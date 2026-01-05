"""
Property Price Prediction Model using XGBoost
Saves all outputs to organized date-based folders with timestamps
"""

import pandas as pd
import numpy as np
from sqlalchemy import create_engine
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import xgboost as xgb
import joblib
import os
from datetime import datetime
import json

# ============================================================================
# OUTPUT MANAGEMENT
# ============================================================================

def setup_output_directory(property_category):
    """Create organized output directory structure"""
    now = datetime.now()
    date_folder = now.strftime("%Y-%m-%d")
    timestamp_str = now.strftime("%Y_%m_%d_%H_%M")

    base_dir = "../property_price_model_outputs"
    date_dir = os.path.join(base_dir, date_folder)
    os.makedirs(date_dir, exist_ok=True)

    print(f"📁 Output directory: {date_dir}")
    print(f"🕐 Timestamp: {timestamp_str}")

    return date_dir, timestamp_str


def save_training_log(output_dir, timestamp_str, property_category, metrics, feature_names, df_info):
    """Save comprehensive training log"""
    log_filename = os.path.join(output_dir, f"{property_category.lower()}_training_log_{timestamp_str}.txt")

    with open(log_filename, 'w') as f:
        f.write("=" * 80 + "\n")
        f.write("PROPERTY PRICE PREDICTION MODEL - TRAINING LOG\n")
        f.write("=" * 80 + "\n")
        f.write(f"Training Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"Property Category: {property_category}\n\n")

        f.write("DATASET INFORMATION\n" + "-" * 80 + "\n")
        f.write(f"Total Properties: {df_info['total_properties']}\n")
        f.write(f"Training Samples: {df_info['train_samples']}\n")
        f.write(f"Test Samples: {df_info['test_samples']}\n")
        f.write(f"\nPrice Statistics:\n")
        f.write(f"  Mean: ${df_info['price_mean']:,.2f}\n")
        f.write(f"  Median: ${df_info['price_median']:,.2f}\n")
        f.write(f"  Min: ${df_info['price_min']:,.2f}\n")
        f.write(f"  Max: ${df_info['price_max']:,.2f}\n\n")

        f.write("MODEL PERFORMANCE METRICS\n" + "-" * 80 + "\n")
        f.write("\nTraining Set:\n")
        f.write(f"  MAE:  ${metrics['train_mae']:,.2f}\n")
        f.write(f"  RMSE: ${metrics['train_rmse']:,.2f}\n")
        f.write(f"  R²:   {metrics['train_r2']:.4f}\n")
        f.write("\nTest Set:\n")
        f.write(f"  MAE:  ${metrics['test_mae']:,.2f}\n")
        f.write(f"  RMSE: ${metrics['test_rmse']:,.2f}\n")
        f.write(f"  R²:   {metrics['test_r2']:.4f}\n")
        f.write(f"  MAPE: {metrics['test_mape']:.2f}%\n\n")

        f.write("FEATURE IMPORTANCE\n" + "-" * 80 + "\n")
        for idx, row in metrics['feature_importance'].iterrows():
            f.write(f"  {row['feature']:30s}: {row['importance']:.4f}\n")

    print(f"💾 Training log saved: {log_filename}")
    return log_filename


def save_metrics_json(output_dir, timestamp_str, property_category, metrics, feature_names, df_info):
    """Save metrics in JSON format"""
    json_filename = os.path.join(output_dir, f"{property_category.lower()}_metrics_{timestamp_str}.json")

    metrics_dict = {
        "timestamp": datetime.now().isoformat(),
        "property_category": property_category,
        "dataset_info": df_info,
        "training_metrics": {
            "mae": float(metrics['train_mae']),
            "rmse": float(metrics['train_rmse']),
            "r2": float(metrics['train_r2'])
        },
        "test_metrics": {
            "mae": float(metrics['test_mae']),
            "rmse": float(metrics['test_rmse']),
            "r2": float(metrics['test_r2']),
            "mape": float(metrics['test_mape'])
        },
        "feature_importance": metrics['feature_importance'].to_dict('records'),
        "features_used": feature_names
    }

    with open(json_filename, 'w') as f:
        json.dump(metrics_dict, f, indent=2)

    print(f"💾 Metrics JSON saved: {json_filename}")
    return json_filename


# ============================================================================
# PHASE 1: GET DATA FROM DATABASE
# ============================================================================

def get_data_from_database(db_url, property_category='FOR_SALE'):
    """Connect to PostgreSQL database and fetch property data"""
    print("=" * 80)
    print("PHASE 1: FETCHING DATA FROM DATABASE")
    print("=" * 80)

    engine = create_engine(db_url)

    query = f"""
    SELECT id, title, latitude as lat, longitude as lng, category, address,
           parking, wifi, balcony, square_meters, heating, type, floor, elevator,
           number_of_rooms, price, year_built, bedrooms, bathrooms, neighborhood,
           contact_number, description
    FROM properties
    WHERE price IS NOT NULL AND price > 0
        AND category = '{property_category}'
        AND square_meters IS NOT NULL AND square_meters > 0
    """

    df = pd.read_sql(query, engine)
    print(f"✓ Loaded {len(df)} {property_category} properties from database")

    if len(df) > 0:
        print(f"\nPrice statistics: Mean=${df['price'].mean():,.2f}, Median=${df['price'].median():,.2f}")

    return df


# ============================================================================
# PHASE 2: PREPARE DATA
# ============================================================================

def prepare_data(df, property_category='FOR_SALE'):
    """Clean and prepare data for modeling"""
    print("\n" + "=" * 80)
    print(f"PHASE 2: PREPARING DATA ({property_category})")
    print("=" * 80)

    df_prepared = df.copy()

    print("\n0. Validating data quality...")
    initial_count = len(df_prepared)

    # Double-check category filtering
    if 'category' in df_prepared.columns:
        category_counts = df_prepared['category'].value_counts()
        print(f"   Categories found: {category_counts.to_dict()}")

        # Ensure we only have the requested category
        df_prepared = df_prepared[df_prepared['category'] == property_category]
        filtered_out = initial_count - len(df_prepared)
        if filtered_out > 0:
            print(f"   ⚠️  Filtered out {filtered_out} properties with wrong category")

    # Remove outliers
    initial_count = len(df_prepared)
    df_prepared = df_prepared[
        (df_prepared['square_meters'].notna()) &
        (df_prepared['square_meters'] > 0) &
        (df_prepared['square_meters'] < 1000)
    ]

    if property_category == 'FOR_RENT':
        df_prepared = df_prepared[(df_prepared['price'] >= 50) & (df_prepared['price'] <= 5000)]
        print(f"   ✓ Applied FOR_RENT price filters (50-5000)")
    else:
        df_prepared = df_prepared[(df_prepared['price'] >= 10000) & (df_prepared['price'] <= 2000000)]
        print(f"   ✓ Applied FOR_SALE price filters (10000-2000000)")

    removed = initial_count - len(df_prepared)
    if removed > 0:
        print(f"   ✓ Removed {removed} outliers")

    print(f"   ✓ Working with {len(df_prepared)} valid properties")

    # Show updated price statistics after filtering
    print(f"\n   Price statistics after filtering:")
    print(f"      Mean: ${df_prepared['price'].mean():,.2f}")
    print(f"      Median: ${df_prepared['price'].median():,.2f}")
    print(f"      Min: ${df_prepared['price'].min():,.2f}")
    print(f"      Max: ${df_prepared['price'].max():,.2f}")

    # Convert booleans to 0/1
    boolean_cols = ['parking', 'wifi', 'balcony', 'elevator']
    for col in boolean_cols:
        if col in df_prepared.columns:
            df_prepared[col] = df_prepared[col].fillna(False).astype(int)

    # Handle missing numeric values
    if 'number_of_rooms' in df_prepared.columns and 'bedrooms' in df_prepared.columns:
        mask = df_prepared['number_of_rooms'].isna() & df_prepared['bedrooms'].notna()
        df_prepared.loc[mask, 'number_of_rooms'] = df_prepared.loc[mask, 'bedrooms'] + 1

    numeric_fillable = {
        'floor': df_prepared['floor'].median() if 'floor' in df_prepared.columns else 0,
        'year_built': df_prepared['year_built'].median() if 'year_built' in df_prepared.columns else 2000,
        'bedrooms': df_prepared['bedrooms'].median() if 'bedrooms' in df_prepared.columns else 2,
        'bathrooms': df_prepared['bathrooms'].median() if 'bathrooms' in df_prepared.columns else 1,
        'number_of_rooms': df_prepared['number_of_rooms'].median() if 'number_of_rooms' in df_prepared.columns else 2
    }

    for col, fill_value in numeric_fillable.items():
        if col in df_prepared.columns:
            df_prepared[col] = df_prepared[col].fillna(fill_value)

    # Encode categorical variables (NOT category - we already filtered by it)
    categorical_cols = ['heating', 'type']
    label_encoders = {}

    for col in categorical_cols:
        if col in df_prepared.columns:
            le = LabelEncoder()
            df_prepared[f'{col}_encoded'] = le.fit_transform(df_prepared[col].astype(str))
            label_encoders[col] = le

    print(f"   ✓ Encoded {len(categorical_cols)} categorical columns")

    # Handle neighborhood
    if 'neighborhood' in df_prepared.columns:
        df_prepared['neighborhood'] = df_prepared['neighborhood'].fillna('Unknown')
        unique_neighborhoods = df_prepared['neighborhood'].nunique()

        if unique_neighborhoods < 100:
            le = LabelEncoder()
            df_prepared['neighborhood_encoded'] = le.fit_transform(df_prepared['neighborhood'])
            label_encoders['neighborhood'] = le
        else:
            df_prepared['neighborhood_encoded'] = 0

    # Create derived features
    current_year = pd.Timestamp.now().year
    if 'year_built' in df_prepared.columns:
        df_prepared['property_age'] = current_year - df_prepared['year_built']
        df_prepared['property_age'] = df_prepared['property_age'].clip(0, 150)

    df_prepared['price_per_sqm'] = df_prepared['price'] / df_prepared['square_meters']

    if 'number_of_rooms' in df_prepared.columns:
        df_prepared['room_density'] = df_prepared['number_of_rooms'] / df_prepared['square_meters']

    if 'bathrooms' in df_prepared.columns:
        df_prepared['has_multiple_bathrooms'] = (df_prepared['bathrooms'] > 1).astype(int)

    if 'bedrooms' in df_prepared.columns:
        df_prepared['has_multiple_bedrooms'] = (df_prepared['bedrooms'] > 1).astype(int)

    if 'floor' in df_prepared.columns:
        df_prepared['is_ground_floor'] = (df_prepared['floor'] == 0).astype(int)
        if 'type' in df_prepared.columns:
            df_prepared['is_high_floor'] = ((df_prepared['floor'] >= 5) & (df_prepared['type'] == 'FLAT')).astype(int)

    print(f"✓ Data preparation complete! Final shape: {df_prepared.shape}")
    return df_prepared, label_encoders


# ============================================================================
# PHASE 3: EXTRACT FEATURES
# ============================================================================

def extract_features(df_prepared):
    """Select and organize features for modeling"""
    print("\n" + "=" * 80)
    print("PHASE 3: EXTRACTING FEATURES")
    print("=" * 80)

    feature_columns = [
        'square_meters', 'floor', 'parking', 'wifi', 'balcony', 'elevator',
        'heating_encoded', 'type_encoded', 'neighborhood_encoded', 'lat', 'lng',
        'number_of_rooms', 'year_built', 'bedrooms', 'bathrooms', 'property_age',
        'room_density', 'has_multiple_bathrooms', 'has_multiple_bedrooms',
        'is_ground_floor', 'is_high_floor'
    ]

    available_features = [col for col in feature_columns if col in df_prepared.columns]
    print(f"\nSelected {len(available_features)} features")

    X = df_prepared[available_features].copy()
    y = df_prepared['price'].copy()

    print(f"✓ Features shape: {X.shape}, Target shape: {y.shape}")
    return X, y, available_features


# ============================================================================
# PHASE 4: CREATE MODEL
# ============================================================================

def create_model():
    """Create and configure XGBoost model"""
    print("\n" + "=" * 80)
    print("PHASE 4: CREATING MODEL")
    print("=" * 80)

    params = {
        'objective': 'reg:squarederror',
        'max_depth': 6,    # how deep can each tree grow
        'learning_rate': 0.1, # learning rate
        'n_estimators': 200,  # number of trees
        'subsample': 0.8,  # % of data used per tree
        'colsample_bytree': 0.8, # % of features used per tree
        'min_child_weight': 3,
        'gamma': 0,
        'random_state': 42,
        'n_jobs': -1
    }

    model = xgb.XGBRegressor(**params)
    print("✓ XGBoost Regressor created successfully")
    return model


# ============================================================================
# PHASE 5: TRAIN MODEL
# ============================================================================

def train_model(model, X, y, test_size=0.2):
    """Split data and train the model"""
    print("\n" + "=" * 80)
    print("PHASE 5: TRAINING MODEL")
    print("=" * 80)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=42)
    print(f"Training: {len(X_train)} samples, Test: {len(X_test)} samples")

    print("\nTraining XGBoost model...")
    # Simple fit without eval_set to avoid compatibility issues
    model.fit(X_train, y_train)

    print("✓ Model training complete!")
    return model, X_train, X_test, y_train, y_test


# ============================================================================
# PHASE 6: EVALUATE MODEL
# ============================================================================

def evaluate_model(model, X_train, X_test, y_train, y_test, feature_names):
    """Evaluate model performance"""
    print("\n" + "=" * 80)
    print("PHASE 6: EVALUATING MODEL")
    print("=" * 80)

    y_train_pred = model.predict(X_train)
    y_test_pred = model.predict(X_test)

    # Calculate metrics
    train_mae = mean_absolute_error(y_train, y_train_pred)
    train_rmse = np.sqrt(mean_squared_error(y_train, y_train_pred))
    train_r2 = r2_score(y_train, y_train_pred)

    test_mae = mean_absolute_error(y_test, y_test_pred)
    test_rmse = np.sqrt(mean_squared_error(y_test, y_test_pred))
    test_r2 = r2_score(y_test, y_test_pred)
    test_mape = np.mean(np.abs((y_test - y_test_pred) / y_test)) * 100

    print(f"\nTest Set: MAE=${test_mae:,.2f}, RMSE=${test_rmse:,.2f}, R²={test_r2:.4f}, MAPE={test_mape:.2f}%")

    importance_df = pd.DataFrame({
        'feature': feature_names,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)

    print("\n📈 Top 10 Features:")
    for i, row in importance_df.head(10).iterrows():
        print(f"  {row['feature']:30s}: {row['importance']:.4f}")

    return {
        'train_mae': train_mae, 'train_rmse': train_rmse, 'train_r2': train_r2,
        'test_mae': test_mae, 'test_rmse': test_rmse, 'test_r2': test_r2,
        'test_mape': test_mape, 'feature_importance': importance_df
    }


# ============================================================================
# MAIN EXECUTION
# ============================================================================

def main():
    """Main execution function"""
    DB_URL = "postgresql://admin:admin@localhost:5432/home_radar_db"
    PROPERTY_CATEGORY = 'FOR_RENT'

    print("🏠 PROPERTY PRICE PREDICTION MODEL")
    print("=" * 80)

    try:
        output_dir, timestamp_str = setup_output_directory(PROPERTY_CATEGORY)

        df = get_data_from_database(DB_URL, PROPERTY_CATEGORY)
        if len(df) == 0:
            print(f"\n❌ No {PROPERTY_CATEGORY} properties found!")
            return

        df_prepared, label_encoders = prepare_data(df, PROPERTY_CATEGORY)
        X, y, feature_names = extract_features(df_prepared)
        model = create_model()
        model, X_train, X_test, y_train, y_test = train_model(model, X, y)
        metrics = evaluate_model(model, X_train, X_test, y_train, y_test, feature_names)

        print("\n✅ All phases completed!")

        # Save outputs
        print("\n" + "=" * 80)
        print("SAVING OUTPUTS")
        print("=" * 80)

        df_info = {
            'total_properties': len(df_prepared),
            'train_samples': len(X_train),
            'test_samples': len(X_test),
            'price_mean': float(y.mean()),
            'price_median': float(y.median()),
            'price_min': float(y.min()),
            'price_max': float(y.max())
        }

        # Save model
        model_filename = os.path.join(output_dir, f"{PROPERTY_CATEGORY.lower()}_property_price_model_{timestamp_str}.pkl")
        joblib.dump(model, model_filename)
        print(f"💾 Model: {model_filename}")

        # Save encoders
        encoders_filename = os.path.join(output_dir, f"{PROPERTY_CATEGORY.lower()}_label_encoders_{timestamp_str}.pkl")
        joblib.dump(label_encoders, encoders_filename)
        print(f"💾 Encoders: {encoders_filename}")

        # Save features
        features_filename = os.path.join(output_dir, f"{PROPERTY_CATEGORY.lower()}_features_{timestamp_str}.json")
        with open(features_filename, 'w') as f:
            json.dump({'features': feature_names}, f, indent=2)
        print(f"💾 Features: {features_filename}")

        # Save training log
        save_training_log(output_dir, timestamp_str, PROPERTY_CATEGORY, metrics, feature_names, df_info)

        # Save metrics JSON
        save_metrics_json(output_dir, timestamp_str, PROPERTY_CATEGORY, metrics, feature_names, df_info)

        print(f"\n✅ All outputs saved to: {output_dir}")

    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        raise


if __name__ == "__main__":
    main()