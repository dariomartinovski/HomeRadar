"""
Property Price Prediction Model using CatBoost
Handles categorical variables natively for higher accuracy.
"""

import pandas as pd
import numpy as np
from sqlalchemy import create_engine
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from catboost import CatBoostRegressor, Pool
import joblib
import os
from datetime import datetime
import json

# ============================================================================
# OUTPUT MANAGEMENT (Same as your template)
# ============================================================================

def setup_output_directory(property_category):
    now = datetime.now()
    date_folder = now.strftime("%Y-%m-%d")
    timestamp_str = now.strftime("%Y_%m_%d_%H_%M")
    base_dir = "../property_price_model_outputs"
    date_dir = os.path.join(base_dir, date_folder)
    os.makedirs(date_dir, exist_ok=True)
    return date_dir, timestamp_str

def save_training_log(output_dir, timestamp_str, property_category, metrics, feature_names, df_info):
    log_filename = os.path.join(output_dir, f"{property_category.lower()}_catboost_log_{timestamp_str}.txt")
    with open(log_filename, 'w') as f:
        f.write("=" * 80 + "\n")
        f.write("PROPERTY PRICE PREDICTION - CATBOOST LOG\n")
        f.write("=" * 80 + "\n")
        f.write(f"Test Set Metrics (Real Scale):\n")
        f.write(f"  MAE:  ${metrics['test_mae']:,.2f}\n")
        f.write(f"  RMSE: ${metrics['test_rmse']:,.2f}\n")
        f.write(f"  R²:   {metrics['test_r2']:.4f}\n")
        f.write(f"  MAPE: {metrics['test_mape']:.2f}%\n")
    return log_filename

# ============================================================================
# PHASE 1: GET DATA FROM DATABASE
# ============================================================================

def get_data_from_database(db_url, property_category='FOR_SALE'):
    engine = create_engine(db_url)
    query = f"""
    SELECT id, latitude as lat, longitude as lng, category,
           parking, wifi, balcony, square_meters, heating, type, floor, elevator,
           number_of_rooms, price, year_built, bedrooms, bathrooms, neighborhood
    FROM properties
    WHERE price IS NOT NULL AND price > 0
        AND category = '{property_category}'
        AND square_meters IS NOT NULL AND square_meters > 0
    """
    df = pd.read_sql(query, engine)
    return df

# ============================================================================
# PHASE 2: PREPARE DATA (No Label Encoding needed for CatBoost!)
# ============================================================================

def prepare_data(df, property_category='FOR_SALE'):
    df_prepared = df.copy()

    # Outlier removal
    if property_category == 'FOR_RENT':
        df_prepared = df_prepared[(df_prepared['price'] >= 50) & (df_prepared['price'] <= 5000)]
    else:
        df_prepared = df_prepared[(df_prepared['price'] >= 10000) & (df_prepared['price'] <= 2000000)]

    # Fill categorical missing values
    df_prepared['neighborhood'] = df_prepared['neighborhood'].fillna('Unknown')
    df_prepared['heating'] = df_prepared['heating'].fillna('NONE')
    df_prepared['type'] = df_prepared['type'].fillna('FLAT')

    # Fill numeric missing values
    df_prepared['floor'] = df_prepared['floor'].fillna(0)
    df_prepared['year_built'] = df_prepared['year_built'].fillna(2000)
    df_prepared['bedrooms'] = df_prepared['bedrooms'].fillna(2)
    df_prepared['bathrooms'] = df_prepared['bathrooms'].fillna(1)
    df_prepared['number_of_rooms'] = df_prepared['number_of_rooms'].fillna(2)

    # Convert booleans to int
    for col in ['parking', 'wifi', 'balcony', 'elevator']:
        df_prepared[col] = df_prepared[col].astype(int)

    # Derived features
    current_year = pd.Timestamp.now().year  # ✅ Dynamic year
    df_prepared['property_age'] = current_year - df_prepared['year_built']
    df_prepared['property_age'] = df_prepared['property_age'].clip(0, 150)

    df_prepared['room_density'] = df_prepared['number_of_rooms'] / df_prepared['square_meters']

    return df_prepared

# ============================================================================
# PHASE 3: EXTRACT FEATURES
# ============================================================================

def extract_features(df_prepared):
    # We use RAW strings for categorical features
    feature_columns = [
        'square_meters', 'floor', 'parking', 'wifi', 'balcony', 'elevator',
        'heating', 'type', 'neighborhood', 'lat', 'lng',
        'number_of_rooms', 'property_age', 'bedrooms', 'bathrooms', 'room_density'
    ]

    # Identify which columns are strings (Categorical)
    cat_features = ['heating', 'type', 'neighborhood']

    X = df_prepared[feature_columns].copy()
    y = np.log1p(df_prepared['price']) # Log transform price

    return X, y, feature_columns, cat_features

# ============================================================================
# PHASE 4: CREATE MODEL
# ============================================================================

def create_model(cat_features):
    model = CatBoostRegressor(
        iterations=1000,
        learning_rate=0.05,
        depth=6,
        loss_function='RMSE',
        eval_metric='MAE',
        random_seed=42,
        verbose=100,
        cat_features=cat_features # This is the magic part
    )
    return model

# ============================================================================
# PHASE 5: TRAIN MODEL
# ============================================================================

def train_model(model, X, y):
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model.fit(X_train, y_train, eval_set=(X_test, y_test), use_best_model=True)
    return model, X_train, X_test, y_train, y_test

# ============================================================================
# PHASE 6: EVALUATE MODEL
# ============================================================================

def evaluate_model(model, X_train, X_test, y_train, y_test, feature_names):
    # Predict and reverse Log
    y_test_pred_log = model.predict(X_test)
    y_test_real = np.expm1(y_test)
    y_test_pred_real = np.expm1(y_test_pred_log)

    test_mae = mean_absolute_error(y_test_real, y_test_pred_real)
    test_rmse = np.sqrt(mean_squared_error(y_test_real, y_test_pred_real))
    test_r2 = r2_score(y_test_real, y_test_pred_real)
    test_mape = np.mean(np.abs((y_test_real - y_test_pred_real) / y_test_real)) * 100

    importance = model.get_feature_importance()
    importance_df = pd.DataFrame({'feature': feature_names, 'importance': importance}).sort_values('importance', ascending=False)

    return {
        'test_mae': test_mae, 'test_rmse': test_rmse,
        'test_r2': test_r2, 'test_mape': test_mape,
        'feature_importance': importance_df
    }

# ============================================================================
# MAIN
# ============================================================================

def main():
    DB_URL = "postgresql://admin:admin@localhost:5432/home_radar_db"
    categories = ["FOR_RENT", "FOR_SALE"]

    for category in categories:
        try:
            output_dir, ts = setup_output_directory(category)
            df = get_data_from_database(DB_URL, category)
            if df.empty: continue

            df_prepared = prepare_data(df, category)
            X, y, features, cat_indices = extract_features(df_prepared)

            model = create_model(cat_indices)
            model, X_train, X_test, y_train, y_test = train_model(model, X, y)

            metrics = evaluate_model(model, X_train, X_test, y_train, y_test, features)

            # Save
            joblib.dump(model, os.path.join(output_dir, f"{category.lower()}_catboost_model_{ts}.pkl"))
            save_training_log(output_dir, ts, category, metrics, features, {})

            print(f"✅ {category} Complete. MAE: ${metrics['test_mae']:,.2f}")

        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()