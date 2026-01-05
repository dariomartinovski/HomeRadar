import pandas as pd


def prepare_single_property(property, label_encoders, feature_names):
    data = property.dict()
    df = pd.DataFrame([data])

    # Booleans → int
    for col in ["parking", "wifi", "balcony", "elevator"]:
        df[col] = df[col].astype(int)

    # Missing rooms logic
    if df["number_of_rooms"].isna().any():
        df["number_of_rooms"] = df["bedrooms"] + 1

    # Encode categoricals
    for col in ["heating", "type", "neighborhood"]:
        encoded_col = f"{col}_encoded"

        if col in label_encoders:
            le = label_encoders[col]
            value = df[col].astype(str)

            # Handle unseen labels safely
            if value.iloc[0] in le.classes_:
                df[encoded_col] = le.transform(value)
            else:
                df[encoded_col] = 0
        else:
            df[encoded_col] = 0

    # Derived features (must match training!)
    current_year = pd.Timestamp.now().year
    df["property_age"] = current_year - df["year_built"]
    df["property_age"] = df["property_age"].clip(0, 150)

    df["room_density"] = df["number_of_rooms"] / df["square_meters"]
    df["has_multiple_bathrooms"] = (df["bathrooms"] > 1).astype(int)
    df["has_multiple_bedrooms"] = (df["bedrooms"] > 1).astype(int)
    df["is_ground_floor"] = (df["floor"] == 0).astype(int)
    df["is_high_floor"] = ((df["floor"] >= 5) & (df["type"] == "FLAT")).astype(int)

    # 🔥 CRITICAL: exact feature order used in training
    df = df.reindex(columns=feature_names, fill_value=0)

    return df
