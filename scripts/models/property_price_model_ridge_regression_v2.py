import pandas as pd
import numpy as np
from sqlalchemy import create_engine
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.linear_model import Ridge
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import os
from datetime import datetime
import json

def setup_output_directory(category):
    now = datetime.now()
    base_dir = "../property_price_model_outputs"
    date_dir = os.path.join(base_dir, now.strftime("%Y-%m-%d"))
    os.makedirs(date_dir, exist_ok=True)
    return date_dir, now.strftime("%Y_%m_%d_%H_%M")

def get_data(db_url, category):
    engine = create_engine(db_url)
    query = f"SELECT * FROM properties WHERE price > 0 AND category = '{category}'"
    return pd.read_sql(query, engine)

def prepare_data(df, category):
    df_p = df.copy()

    # 1. Stricter Outlier Filtering
    if category == 'FOR_RENT':
        df_p = df_p[(df_p['price'] >= 50) & (df_p['price'] <= 4000)]
    else:
        df_p = df_p[(df_p['price'] >= 15000) & (df_p['price'] <= 1200000)]
    df_p = df_p[df_p['square_meters'] > 5] # Remove tiny/wrong entries

    # 2. Aggressive Imputation (Fixes the NaN Error)
    numeric_cols = df_p.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        median_val = df_p[col].median()
        df_p[col] = df_p[col].fillna(median_val)

    # 3. Neighborhood Price Signal (Target Encoding)
    df_p['price_per_sqm'] = df_p['price'] / df_p['square_meters']
    n_stats = df_p.groupby('neighborhood')['price_per_sqm'].median().to_dict()
    global_median = df_p['price_per_sqm'].median()
    df_p['neighborhood_signal'] = df_p['neighborhood'].map(n_stats).fillna(global_median)

    # 4. Features & Logic
    df_p['sqm_squared'] = df_p['square_meters'] ** 2
    df_p['room_density'] = df_p['number_of_rooms'] / df_p['square_meters']
    df_p['property_age'] = 2025 - df_p['year_built'].fillna(2000)

    # Replace any Infinity values with the column median
    df_p = df_p.replace([np.inf, -np.inf], np.nan)
    df_p = df_p.fillna(df_p.median(numeric_only=True))

    return df_p, n_stats

def train_and_save():
    DB_URL = "postgresql://admin:admin@localhost:5432/home_radar_db"
    features = [
        'square_meters', 'sqm_squared', 'floor', 'latitude', 'longitude',
        'number_of_rooms', 'bedrooms', 'bathrooms', 'neighborhood_signal',
        'property_age', 'room_density'
    ]

    for cat in ["FOR_RENT", "FOR_SALE"]:
        try:
            output_dir, ts = setup_output_directory(cat)
            df = get_data(DB_URL, cat)
            if df.empty: continue

            df_p, n_map = prepare_data(df, cat)

            X = df_p[features]
            y = np.log1p(df_p['price'])

            # Safety Check: Print NaN count before training
            nan_count = X.isna().sum().sum()
            if nan_count > 0:
                print(f"⚠️ Warning: {nan_count} NaNs still present in {cat} features!")

            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

            # Pipeline with Imputer for extra safety
            model = Pipeline([
                ('imputer', SimpleImputer(strategy='median')), # Catches any missed NaNs
                ('scaler', StandardScaler()),
                ('ridge', Ridge(alpha=10.0))
            ])

            model.fit(X_train, y_train)

            # Metrics
            y_pred = np.expm1(model.predict(X_test))
            y_real = np.expm1(y_test)
            print(f"✅ {cat} Model Trained. MAE: ${mean_absolute_error(y_real, y_pred):,.2f}")

            # Save
            joblib.dump(model, os.path.join(output_dir, f"{cat.lower()}_ridge_v2_{ts}.pkl"))
            with open(os.path.join(output_dir, f"{cat.lower()}_n_map_{ts}.json"), 'w') as f:
                json.dump(n_map, f)

        except Exception as e:
            print(f"❌ Error training {cat}: {e}")

if __name__ == "__main__":
    train_and_save()