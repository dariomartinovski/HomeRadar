import pandas as pd
import numpy as np

def prepare_single_property(property, n_map, feature_names):
    # Convert Pydantic object to a dictionary
    data = property.dict()
    # Create DataFrame
    df = pd.DataFrame([data])

    # 1. Map input 'lat'/'lng' to the names the model expects ('latitude'/'longitude')
    df['latitude'] = df['lat']
    df['longitude'] = df['lng']

    # 2. Neighborhood Price Signal (Target Encoding)
    # Get the average of all known neighborhoods as a fallback
    global_median_signal = sum(n_map.values()) / len(n_map) if n_map else 0
    df['neighborhood_signal'] = df['neighborhood'].map(n_map).fillna(global_median_signal)

    # 3. Add Polynomial/Derived Features
    df['sqm_squared'] = df['square_meters'] ** 2

    # FIX: Use .fillna() instead of 'or' to handle missing years
    df['property_age'] = 2025 - df['year_built'].fillna(2000)

    # 4. Room Density
    # We use .replace(0, 1) on square_meters to avoid DivisionByZero errors
    df['room_density'] = df['number_of_rooms'].fillna(2) / df['square_meters'].replace(0, 1)

    # 5. Final Alignment
    # Reindex ensures:
    # - Columns are in the EXACT order of the training 'features' list
    # - Any missing columns are filled with 0
    # - Extra columns (like 'lat', 'lng', 'heating') are dropped
    X = df.reindex(columns=feature_names, fill_value=0)

    return X