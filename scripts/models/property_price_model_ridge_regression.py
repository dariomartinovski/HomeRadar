"""
Property Price Prediction Model using Ridge Regression
Saves all outputs to organized date-based folders with timestamps
"""

import pandas as pd
import numpy as np
from sqlalchemy import create_engine
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.linear_model import Ridge
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
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
        f.write("PROPERTY PRICE PREDICTION MODEL - RIDGE REGRESSION TRAINING LOG\n")
        f.write("=" * 80 + "\n")
        f.write(f"Training Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"Property Category: {property_category}\n\n")

        f.write("DATASET INFORMATION\n" + "-" * 80 + "\n")
        f.write(f"Total Properties: {df_info['total_properties']}\n")
        f.write(f"Training Samples: {df_info['train_samples']}\n")
        f.write(f"Test Samples: {df_info['test_samples']}\n")
        f.write(f"\nPrice Statistics (Original Scale):\n")
        f.write(f"  Mean: ${df_info['price_mean']:,.2f}\n")
        f.write(f"  Median: ${df_info['price_median']:,.2f}\n\n")

        f.write("MODEL PERFORMANCE METRICS (Back-transformed to Dollars)\n" + "-" * 80 + "\n")
        f.write("\nTest Set:\n")
        f.write(f"  MAE:  ${metrics['test_mae']:,.2f}\n")
        f.write(f"  RMSE: ${metrics['test_rmse']:,.2f}\n")
        f.write(f"  R²:   {metrics['test_r2']:.4f}\n")
        f.write(f"  MAPE: {metrics['test_mape']:.2f}%\n\n")

        f.write("FEATURE IMPORTANCE (Ridge Coefficients)\n" + "-" * 80 + "\n")
        f.write("Note: Higher absolute values indicate stronger influence on log-price.\n")
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
        "algorithm": "Ridge Regression",
        "dataset_info": df_info,
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
    print(f"PHASE 1: FETCHING {property_category} DATA")
    print("=" * 80)

    engine = create_engine(db_url)

    query = f"""
    SELECT id, title, latitude as lat, longitude as lng, category, address,
           parking, wifi, balcony, square_meters, heating, type, floor, elevator,
           number_of_rooms, price, year_built, bedrooms, bathrooms, neighborhood
    FROM properties
    WHERE price IS NOT NULL AND price > 0
        AND category = '{property_category}'
        AND square_meters IS NOT NULL AND square_meters > 0
    """

    df = pd.read_sql(query, engine)
    print(f"✓ Loaded {len(df)} properties")
    return df


# ============================================================================
# PHASE 2: PREPARE DATA
# ============================================================================

def prepare_data(df, property_category='FOR_SALE'):
    """Clean and prepare data for modeling"""
    print("\n" + "=" * 80)
    print(f"PHASE 2: PREPARING DATA")
    print("=" * 80)

    df_prepared = df.copy()

    # Outlier removal based on category
    if property_category == 'FOR_RENT':
        df_prepared = df_prepared[(df_prepared['price'] >= 50) & (df_prepared['price'] <= 5000)]
    else:
        df_prepared = df_prepared[(df_prepared['price'] >= 10000) & (df_prepared['price'] <= 2000000)]

    df_prepared = df_prepared[df_prepared['square_meters'] < 1000]

    # Convert booleans
    boolean_cols = ['parking', 'wifi', 'balcony', 'elevator']
    for col in boolean_cols:
        if col in df_prepared.columns:
            df_prepared[col] = df_prepared[col].fillna(False).astype(int)

    # Impute missing numeric values
    numeric_cols = ['floor', 'year_built', 'bedrooms', 'bathrooms', 'number_of_rooms']
    for col in numeric_cols:
        if col in df_prepared.columns:
            df_prepared[col] = df_prepared[col].fillna(df_prepared[col].median())

    # Encode categorical
    label_encoders = {}
    for col in ['heating', 'type', 'neighborhood']:
        if col in df_prepared.columns:
            le = LabelEncoder()
            df_prepared[f'{col}_encoded'] = le.fit_transform(df_prepared[col].astype(str))
            label_encoders[col] = le

    # Derived Features
    df_prepared['property_age'] = 2024 - df_prepared['year_built']
    df_prepared['room_density'] = df_prepared['number_of_rooms'] / df_prepared['square_meters']

    print(f"✓ Data preparation complete! Final shape: {df_prepared.shape}")
    return df_prepared, label_encoders


# ============================================================================
# PHASE 3: EXTRACT FEATURES
# ============================================================================

def extract_features(df_prepared):
    """Select features and apply Log Transformation to target"""
    print("\n" + "=" * 80)
    print("PHASE 3: EXTRACTING FEATURES & LOG TRANSFORM")
    print("=" * 80)

    feature_columns = [
        'square_meters', 'floor', 'parking', 'wifi', 'balcony', 'elevator',
        'heating_encoded', 'type_encoded', 'neighborhood_encoded', 'lat', 'lng',
        'number_of_rooms', 'property_age', 'bedrooms', 'bathrooms', 'room_density'
    ]

    available_features = [col for col in feature_columns if col in df_prepared.columns]

    X = df_prepared[available_features].copy()

    # Apply natural log transformation to target
    y = np.log1p(df_prepared['price']).copy()

    print(f"✓ Features extracted. Target transformed to log scale.")
    return X, y, available_features


# ============================================================================
# PHASE 4: CREATE MODEL (RIDGE PIPELINE)
# ============================================================================

def create_model():
    """Create a Ridge Regression pipeline with standard scaling"""
    print("\n" + "=" * 80)
    print("PHASE 4: CREATING RIDGE PIPELINE")
    print("=" * 80)

    # Pipeline handles Scaling + Ridge in one object
    model = Pipeline([
        ('scaler', StandardScaler()),
        # increased alpha from 1 -> 7 to make the model more conservative
        ('ridge', Ridge(alpha=7.0, random_state=42))
    ])

    print("✓ Ridge Pipeline (Scaler + Regressor) created")
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

    model.fit(X_train, y_train)

    print("✓ Model training complete!")
    return model, X_train, X_test, y_train, y_test


# ============================================================================
# PHASE 6: EVALUATE MODEL
# ============================================================================

def evaluate_model(model, X_train, X_test, y_train, y_test, feature_names):
    """Evaluate performance by reversing the log transform"""
    print("\n" + "=" * 80)
    print("PHASE 6: EVALUATING MODEL")
    print("=" * 80)

    # Predict (results are in log scale)
    y_test_pred_log = model.predict(X_test)
    y_train_pred_log = model.predict(X_train)

    # Back-transform to real dollars using expm1
    y_test_real = np.expm1(y_test)
    y_test_pred_real = np.expm1(y_test_pred_log)

    y_train_real = np.expm1(y_train)
    y_train_pred_real = np.expm1(y_train_pred_log)

    # Metrics on real dollar values
    test_mae = mean_absolute_error(y_test_real, y_test_pred_real)
    test_rmse = np.sqrt(mean_squared_error(y_test_real, y_test_pred_real))
    test_r2 = r2_score(y_test_real, y_test_pred_real)
    test_mape = np.mean(np.abs((y_test_real - y_test_pred_real) / y_test_real)) * 100

    # For log-scale metrics
    train_r2 = r2_score(y_train, y_train_pred_log)

    print(f"\nResults (Real Dollars):")
    print(f"  MAE:  ${test_mae:,.2f}")
    print(f"  RMSE: ${test_rmse:,.2f}")
    print(f"  R²:   {test_r2:.4f}")
    print(f"  MAPE: {test_mape:.2f}%")

    # Extract coefficients from the pipeline
    ridge_coeffs = model.named_steps['ridge'].coef_
    importance_df = pd.DataFrame({
        'feature': feature_names,
        'importance': ridge_coeffs
    }).sort_values('importance', key=abs, ascending=False)

    print("\n📈 Top Features (Coefficient magnitude):")
    print(importance_df.head(10).to_string(index=False))

    return {
        'test_mae': test_mae, 'test_rmse': test_rmse, 'test_r2': test_r2,
        'test_mape': test_mape, 'train_r2': train_r2,
        'train_mae': mean_absolute_error(y_train_real, y_train_pred_real),
        'train_rmse': np.sqrt(mean_squared_error(y_train_real, y_train_pred_real)),
        'feature_importance': importance_df
    }


# ============================================================================
# MAIN EXECUTION
# ============================================================================

def main():
    DB_URL = "postgresql://admin:admin@localhost:5432/home_radar_db"
    categories = ["FOR_RENT", "FOR_SALE"]

    print("🏠 PROPERTY PRICE PREDICTION - RIDGE MODEL")

    for category in categories:
        try:
            output_dir, timestamp_str = setup_output_directory(category)
            df = get_data_from_database(DB_URL, category)

            if len(df) == 0:
                continue

            df_prepared, label_encoders = prepare_data(df, category)
            X, y, feature_names = extract_features(df_prepared)

            model = create_model()
            model, X_train, X_test, y_train, y_test = train_model(model, X, y)

            metrics = evaluate_model(model, X_train, X_test, y_train, y_test, feature_names)

            # SAVE OUTPUTS
            df_info = {
                'total_properties': len(df_prepared),
                'train_samples': len(X_train),
                'test_samples': len(X_test),
                'price_mean': float(np.expm1(y).mean()),
                'price_median': float(np.expm1(y).median())
            }

            joblib.dump(model, os.path.join(output_dir, f"{category.lower()}_ridge_model_{timestamp_str}.pkl"))
            joblib.dump(label_encoders, os.path.join(output_dir, f"{category.lower()}_encoders_{timestamp_str}.pkl"))

            save_training_log(output_dir, timestamp_str, category, metrics, feature_names, df_info)
            save_metrics_json(output_dir, timestamp_str, category, metrics, feature_names, df_info)

            print(f"\n✅ Completed category: {category}")

        except Exception as e:
            print(f"❌ Error in {category}: {e}")

if __name__ == "__main__":
    main()