"""
Property Price Prediction Model using XGBoost
Phases:
1. Get data from database
2. Prepare data (encodings, transformations)
3. Extract features
4. Create model
5. Train model
6. Evaluate model
"""

import pandas as pd
import numpy as np
from sqlalchemy import create_engine
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import xgboost as xgb
import matplotlib.pyplot as plt
import seaborn as sns

# ============================================================================
# PHASE 1: GET DATA FROM DATABASE
# ============================================================================

def get_data_from_database(db_url, property_category='FOR_SALE'):
    """
    Connect to PostgreSQL database and fetch property data

    Args:
        db_url: Database connection string
                Example: "postgresql://username:password@localhost:5432/database_name"
        property_category: 'FOR_SALE' or 'FOR_RENT' (default: 'FOR_SALE')

    Returns:
        DataFrame with property data
    """
    print("=" * 80)
    print("PHASE 1: FETCHING DATA FROM DATABASE")
    print("=" * 80)

    # Create database engine
    engine = create_engine(db_url)

    # SQL query to fetch all relevant property data
    # IMPORTANT: Filter by category to separate rental from sale prices
    query = f"""
    SELECT
        id,
        title,
        latitude as lat,
        longitude as lng,
        category,
        address,
        parking,
        wifi,
        balcony,
        square_meters,
        heating,
        type,
        floor,
        elevator,
        number_of_rooms,
        price,
        year_built,
        bedrooms,
        bathrooms,
        neighborhood,
        contact_number,
        description
    FROM properties
    WHERE price IS NOT NULL
        AND price > 0
        AND category = '{property_category}'
        AND square_meters IS NOT NULL
        AND square_meters > 0
    """

    # Load data
    df = pd.read_sql(query, engine)

    print(f"✓ Loaded {len(df)} {property_category} properties from database")
    print(f"✓ Columns: {list(df.columns)}")
    print(f"\nData shape: {df.shape}")

    # Show category distribution
    if len(df) > 0:
        print(f"\nProperty types:")
        print(df['type'].value_counts().to_dict())

        print(f"\nPrice statistics for {property_category}:")
        print(f"  Mean: ${df['price'].mean():,.2f}")
        print(f"  Median: ${df['price'].median():,.2f}")
        print(f"  Min: ${df['price'].min():,.2f}")
        print(f"  Max: ${df['price'].max():,.2f}")

    print(f"\nFirst few rows:")
    print(df.head())

    return df


# ============================================================================
# PHASE 2: PREPARE DATA (ENCODINGS, TRANSFORMATIONS)
# ============================================================================

def prepare_data(df, property_category='FOR_SALE'):
    """
    Clean and prepare data for modeling
    - Handle missing values
    - Convert booleans to 0/1
    - Encode categorical variables
    - Create derived features

    Args:
        df: Raw dataframe from database
        property_category: 'FOR_SALE' or 'FOR_RENT'

    Returns:
        Prepared dataframe
    """
    print("\n" + "=" * 80)
    print(f"PHASE 2: PREPARING DATA ({property_category})")
    print("=" * 80)

    df_prepared = df.copy()

    # Extract square_meters from title if not present
    print("\n0. Validating data quality...")

    # Remove rows without square_meters or with invalid values
    initial_count = len(df_prepared)
    df_prepared = df_prepared[
        (df_prepared['square_meters'].notna()) &
        (df_prepared['square_meters'] > 0) &
        (df_prepared['square_meters'] < 1000)  # Remove outliers (> 1000 sqm)
    ]

    # Remove price outliers based on category
    if property_category == 'FOR_RENT':
        # Monthly rent should be reasonable (remove < $50 or > $5000)
        df_prepared = df_prepared[
            (df_prepared['price'] >= 50) &
            (df_prepared['price'] <= 5000)
        ]
    else:  # FOR_SALE
        # Sale price should be reasonable (remove < $10,000 or > $2,000,000)
        df_prepared = df_prepared[
            (df_prepared['price'] >= 10000) &
            (df_prepared['price'] <= 2000000)
        ]

    removed = initial_count - len(df_prepared)
    if removed > 0:
        print(f"   ✓ Removed {removed} outlier/invalid rows")

    print(f"   ✓ Working with {len(df_prepared)} valid properties")

    # Convert boolean columns to 0/1
    print("\n1. Converting boolean columns to 0/1...")
    boolean_cols = ['parking', 'wifi', 'balcony', 'elevator']
    for col in boolean_cols:
        if col in df_prepared.columns:
            df_prepared[col] = df_prepared[col].fillna(False).astype(int)
            print(f"   ✓ {col}: {df_prepared[col].value_counts().to_dict()}")

    # Handle missing numeric values
    print("\n2. Handling missing numeric values...")

    # First, fill number_of_rooms if missing but can be inferred from bedrooms
    if 'number_of_rooms' in df_prepared.columns and 'bedrooms' in df_prepared.columns:
        # If number_of_rooms is missing but bedrooms exists, use bedrooms + 1 (assuming living room)
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
            missing_count = df_prepared[col].isna().sum()
            if missing_count > 0:
                df_prepared[col] = df_prepared[col].fillna(fill_value)
                print(f"   ✓ {col}: filled {missing_count} missing values with {fill_value:.0f}")
            else:
                print(f"   ✓ {col}: no missing values")

    # Encode categorical variables
    print("\n3. Encoding categorical variables...")
    categorical_cols = ['heating', 'type']  # Removed 'category' since we're filtering by it
    label_encoders = {}

    for col in categorical_cols:
        if col in df_prepared.columns:
            le = LabelEncoder()
            df_prepared[f'{col}_encoded'] = le.fit_transform(df_prepared[col].astype(str))
            label_encoders[col] = le
            print(f"   ✓ {col}: {dict(zip(le.classes_, le.transform(le.classes_)))}")

    # Handle neighborhood (might have many categories)
    print("\n4. Handling neighborhood...")
    if 'neighborhood' in df_prepared.columns:
        # Fill missing neighborhoods
        df_prepared['neighborhood'] = df_prepared['neighborhood'].fillna('Unknown')

        # Only encode if reasonable number of categories
        unique_neighborhoods = df_prepared['neighborhood'].nunique()
        print(f"   Found {unique_neighborhoods} unique neighborhoods")

        if unique_neighborhoods < 100:  # Reasonable number
            le = LabelEncoder()
            df_prepared['neighborhood_encoded'] = le.fit_transform(df_prepared['neighborhood'])
            label_encoders['neighborhood'] = le
            print(f"   ✓ Encoded neighborhoods")
        else:
            print(f"   ! Too many neighborhoods, will skip encoding")
            df_prepared['neighborhood_encoded'] = 0

    # Create derived features
    print("\n5. Creating derived features...")

    # Property age
    current_year = pd.Timestamp.now().year
    if 'year_built' in df_prepared.columns:
        df_prepared['property_age'] = current_year - df_prepared['year_built']
        # Cap property age at reasonable values (handle outliers and future dates)
        df_prepared['property_age'] = df_prepared['property_age'].clip(0, 150)
        # Handle future year_built (like 2026) - treat as new construction
        df_prepared.loc[df_prepared['property_age'] < 0, 'property_age'] = 0
        print(f"   ✓ property_age (range: {df_prepared['property_age'].min():.0f} - {df_prepared['property_age'].max():.0f} years)")

    # Price per square meter (for analysis, not as feature)
    df_prepared['price_per_sqm'] = df_prepared['price'] / df_prepared['square_meters']
    print(f"   ✓ price_per_sqm (mean: ${df_prepared['price_per_sqm'].mean():.2f})")

    # Rooms per square meter (density indicator)
    if 'number_of_rooms' in df_prepared.columns:
        df_prepared['room_density'] = df_prepared['number_of_rooms'] / df_prepared['square_meters']
        print(f"   ✓ room_density (mean: {df_prepared['room_density'].mean():.4f})")

    # Has multiple bathrooms indicator
    if 'bathrooms' in df_prepared.columns:
        df_prepared['has_multiple_bathrooms'] = (df_prepared['bathrooms'] > 1).astype(int)
        print(f"   ✓ has_multiple_bathrooms ({df_prepared['has_multiple_bathrooms'].sum()} properties)")

    # Has multiple bedrooms indicator
    if 'bedrooms' in df_prepared.columns:
        df_prepared['has_multiple_bedrooms'] = (df_prepared['bedrooms'] > 1).astype(int)
        print(f"   ✓ has_multiple_bedrooms ({df_prepared['has_multiple_bedrooms'].sum()} properties)")

    # Is ground floor
    if 'floor' in df_prepared.columns:
        df_prepared['is_ground_floor'] = (df_prepared['floor'] == 0).astype(int)
        print(f"   ✓ is_ground_floor ({df_prepared['is_ground_floor'].sum()} properties)")

    # Is top floor (assume top floor if floor >= 5 for flats)
    if 'floor' in df_prepared.columns and 'type' in df_prepared.columns:
        df_prepared['is_high_floor'] = ((df_prepared['floor'] >= 5) & (df_prepared['type'] == 'FLAT')).astype(int)
        print(f"   ✓ is_high_floor ({df_prepared['is_high_floor'].sum()} properties)")

    print(f"\n✓ Data preparation complete!")
    print(f"✓ Final shape: {df_prepared.shape}")

    return df_prepared, label_encoders


# ============================================================================
# PHASE 3: EXTRACT FEATURES
# ============================================================================

def extract_features(df_prepared):
    """
    Select and organize features for modeling

    Args:
        df_prepared: Prepared dataframe

    Returns:
        X (features), y (target)
    """
    print("\n" + "=" * 80)
    print("PHASE 3: EXTRACTING FEATURES")
    print("=" * 80)

    # Define feature columns
    feature_columns = [
        # Core numeric features
        'square_meters',
        'floor',

        # Boolean features (already 0/1)
        'parking',
        'wifi',
        'balcony',
        'elevator',

        # Encoded categorical features
        'heating_encoded',
        'type_encoded',
        'neighborhood_encoded',

        # Location features
        'lat',
        'lng'
    ]

    # Add optional numeric features if they exist
    optional_features = [
        'number_of_rooms',
        'year_built',
        'bedrooms',
        'bathrooms',
        'property_age',
        'room_density',
        'has_multiple_bathrooms',
        'has_multiple_bedrooms',
        'is_ground_floor',
        'is_high_floor'
    ]

    feature_columns.extend(optional_features)

    # Filter to only existing columns
    available_features = [col for col in feature_columns if col in df_prepared.columns]

    print(f"\nSelected {len(available_features)} features:")
    for i, feat in enumerate(available_features, 1):
        print(f"  {i:2d}. {feat}")

    # Extract features and target
    X = df_prepared[available_features].copy()
    y = df_prepared['price'].copy()

    print(f"\n✓ Features shape: {X.shape}")
    print(f"✓ Target shape: {y.shape}")
    print(f"\nTarget statistics (price):")
    print(f"  Mean: ${y.mean():,.2f}")
    print(f"  Median: ${y.median():,.2f}")
    print(f"  Std: ${y.std():,.2f}")
    print(f"  Min: ${y.min():,.2f}")
    print(f"  Max: ${y.max():,.2f}")

    # Check for any missing values
    missing_in_features = X.isna().sum().sum()
    if missing_in_features > 0:
        print(f"\n⚠ Warning: {missing_in_features} missing values found in features")
        print(X.isna().sum()[X.isna().sum() > 0])
    else:
        print(f"\n✓ No missing values in features")

    return X, y, available_features


# ============================================================================
# PHASE 4: CREATE MODEL
# ============================================================================

def create_model():
    """
    Create and configure XGBoost model

    Returns:
        Configured XGBoost model
    """
    print("\n" + "=" * 80)
    print("PHASE 4: CREATING MODEL")
    print("=" * 80)

    # XGBoost parameters optimized for regression
    params = {
        'objective': 'reg:squarederror',  # Regression with squared error
        'max_depth': 6,                    # Maximum tree depth
        'learning_rate': 0.1,              # Step size shrinkage
        'n_estimators': 200,               # Number of boosting rounds
        'subsample': 0.8,                  # Fraction of samples for training
        'colsample_bytree': 0.8,          # Fraction of features for training
        'min_child_weight': 3,             # Minimum sum of instance weight
        'gamma': 0,                        # Minimum loss reduction
        'random_state': 42,                # For reproducibility
        'n_jobs': -1                       # Use all CPU cores
    }

    print("Model Configuration:")
    for param, value in params.items():
        print(f"  {param:20s}: {value}")

    model = xgb.XGBRegressor(**params)

    print("\n✓ XGBoost Regressor created successfully")

    return model


# ============================================================================
# PHASE 5: TRAIN MODEL
# ============================================================================

def train_model(model, X, y, test_size=0.2):
    """
    Split data and train the model

    Args:
        model: XGBoost model
        X: Features
        y: Target
        test_size: Fraction of data for testing

    Returns:
        Trained model, train/test splits
    """
    print("\n" + "=" * 80)
    print("PHASE 5: TRAINING MODEL")
    print("=" * 80)

    # Split data into train and test sets
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=42
    )

    print(f"\nData split:")
    print(f"  Training set: {len(X_train)} samples ({(1-test_size)*100:.0f}%)")
    print(f"  Test set:     {len(X_test)} samples ({test_size*100:.0f}%)")

    # Train the model
    print(f"\nTraining XGBoost model...")

    # Try different fit methods based on XGBoost version
    try:
        # For newer XGBoost versions (>= 2.0)
        model.fit(
            X_train, y_train,
            eval_set=[(X_train, y_train), (X_test, y_test)],
            verbose=False
        )
    except TypeError:
        # For older XGBoost versions (< 2.0)
        model.fit(X_train, y_train, verbose=False)

    print("✓ Model training complete!")

    return model, X_train, X_test, y_train, y_test


# ============================================================================
# PHASE 6: EVALUATE MODEL
# ============================================================================

def evaluate_model(model, X_train, X_test, y_train, y_test, feature_names):
    """
    Evaluate model performance and show insights

    Args:
        model: Trained model
        X_train, X_test: Feature splits
        y_train, y_test: Target splits
        feature_names: List of feature names
    """
    print("\n" + "=" * 80)
    print("PHASE 6: EVALUATING MODEL")
    print("=" * 80)

    # Make predictions
    y_train_pred = model.predict(X_train)
    y_test_pred = model.predict(X_test)

    # Calculate metrics
    print("\n📊 PERFORMANCE METRICS")
    print("-" * 80)

    # Training metrics
    train_mae = mean_absolute_error(y_train, y_train_pred)
    train_rmse = np.sqrt(mean_squared_error(y_train, y_train_pred))
    train_r2 = r2_score(y_train, y_train_pred)

    print("\nTraining Set:")
    print(f"  MAE (Mean Absolute Error):  ${train_mae:,.2f}")
    print(f"  RMSE (Root Mean Squared):   ${train_rmse:,.2f}")
    print(f"  R² Score:                   {train_r2:.4f}")

    # Test metrics
    test_mae = mean_absolute_error(y_test, y_test_pred)
    test_rmse = np.sqrt(mean_squared_error(y_test, y_test_pred))
    test_r2 = r2_score(y_test, y_test_pred)

    print("\nTest Set:")
    print(f"  MAE (Mean Absolute Error):  ${test_mae:,.2f}")
    print(f"  RMSE (Root Mean Squared):   ${test_rmse:,.2f}")
    print(f"  R² Score:                   {test_r2:.4f}")

    # Mean percentage error
    test_mape = np.mean(np.abs((y_test - y_test_pred) / y_test)) * 100
    print(f"  MAPE (Mean Abs % Error):    {test_mape:.2f}%")

    # Feature importance
    print("\n📈 FEATURE IMPORTANCE (Top 10)")
    print("-" * 80)

    importance_df = pd.DataFrame({
        'feature': feature_names,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)

    for i, row in importance_df.head(10).iterrows():
        print(f"  {row['feature']:30s}: {row['importance']:.4f}")

    # Sample predictions
    print("\n🎯 SAMPLE PREDICTIONS (First 10 test samples)")
    print("-" * 80)
    print(f"{'Actual Price':>15s} {'Predicted Price':>15s} {'Difference':>15s} {'Error %':>10s}")
    print("-" * 80)

    for i in range(min(10, len(y_test))):
        actual = y_test.iloc[i]
        predicted = y_test_pred[i]
        diff = predicted - actual
        error_pct = (diff / actual) * 100

        print(f"${actual:>14,.2f} ${predicted:>14,.2f} ${diff:>14,.2f} {error_pct:>9.1f}%")

    print("\n" + "=" * 80)
    print("EVALUATION COMPLETE!")
    print("=" * 80)

    return {
        'train_mae': train_mae,
        'train_rmse': train_rmse,
        'train_r2': train_r2,
        'test_mae': test_mae,
        'test_rmse': test_rmse,
        'test_r2': test_r2,
        'test_mape': test_mape,
        'feature_importance': importance_df
    }


# ============================================================================
# MAIN EXECUTION
# ============================================================================

def main():
    """
    Main execution function - runs all phases
    """

    # Database configuration
    # Update these with your actual database credentials
    DB_URL = "postgresql://admin:admin@localhost:5432/home_radar_db"

    # IMPORTANT: Choose property category
    # 'FOR_SALE' for properties being sold (price = total sale price)
    # 'FOR_RENT' for rental properties (price = monthly rent)
    PROPERTY_CATEGORY = 'FOR_SALE'  # Change to 'FOR_RENT' for rental model

    print("🏠 PROPERTY PRICE PREDICTION MODEL")
    print("=" * 80)
    print(f"Training model for: {PROPERTY_CATEGORY}")
    print("=" * 80)

    try:
        # Phase 1: Get data
        df = get_data_from_database(DB_URL, PROPERTY_CATEGORY)

        if len(df) == 0:
            print(f"\n❌ No {PROPERTY_CATEGORY} properties found in database!")
            return

        # Phase 2: Prepare data
        df_prepared, label_encoders = prepare_data(df, PROPERTY_CATEGORY)

        # Phase 3: Extract features
        X, y, feature_names = extract_features(df_prepared)

        # Phase 4: Create model
        model = create_model()

        # Phase 5: Train model
        model, X_train, X_test, y_train, y_test = train_model(model, X, y)

        # Phase 6: Evaluate model
        metrics = evaluate_model(model, X_train, X_test, y_train, y_test, feature_names)

        print("\n✅ All phases completed successfully!")

        # Optional: Save model for later use
        import joblib
        model_filename = f'property_price_model_{PROPERTY_CATEGORY.lower()}.pkl'
        encoders_filename = f'label_encoders_{PROPERTY_CATEGORY.lower()}.pkl'

        joblib.dump(model, model_filename)
        joblib.dump(label_encoders, encoders_filename)
        print(f"\n💾 Model saved to '{model_filename}'")
        print(f"💾 Encoders saved to '{encoders_filename}'")

    except Exception as e:
        print(f"\n❌ Error occurred: {str(e)}")
        raise


if __name__ == "__main__":
    main()