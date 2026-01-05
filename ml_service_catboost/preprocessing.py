import pandas as pd
import numpy as np

def prepare_single_property(property_data, feature_names):
    """
    Prepares a single property for CatBoost prediction.
    Matches training preprocessing exactly.
    """
    # 1. Convert Pydantic model to dict and DataFrame
    data = property_data.dict()
    df = pd.DataFrame([data])

    # 2. Handle missing values (match training defaults)
    df['neighborhood'] = df['neighborhood'].fillna('Unknown')
    df['heating'] = df['heating'].fillna('NONE')
    df['type'] = df['type'].fillna('FLAT')

    df['floor'] = df['floor'].fillna(0)
    df['year_built'] = df['year_built'].fillna(2000)
    df['bedrooms'] = df['bedrooms'].fillna(2)
    df['bathrooms'] = df['bathrooms'].fillna(1)
    df['number_of_rooms'] = df['number_of_rooms'].fillna(2)

    # 3. Convert booleans to int (match training)
    bool_cols = ['parking', 'wifi', 'balcony', 'elevator']
    for col in bool_cols:
        df[col] = df[col].astype(int)

    # 4. Derived features (match training exactly!)
    current_year = pd.Timestamp.now().year  # ✅ Dynamic year
    df['property_age'] = current_year - df['year_built']
    df['property_age'] = df['property_age'].clip(0, 150)

    # Prevent division by zero
    df['room_density'] = df['number_of_rooms'] / df['square_meters'].replace(0, 1)

    # 5. Align to exact training feature order
    X = df.reindex(columns=feature_names, fill_value=0)

    return X