from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
import joblib
import json
from preprocessing import prepare_single_property
import numpy as np

app = FastAPI(title="Property Price Prediction API")

# ============================================================================
# LOAD MODEL BUNDLES (FOR_RENT + FOR_SALE)
# ============================================================================

def load_bundle(model_path, encoders_path, features_path):
    model = joblib.load(model_path)
    encoders = joblib.load(encoders_path)
    with open(features_path) as f:
        features = json.load(f)["features"]
    return model, encoders, features

# MODEL_BUNDLES = {
#     "FOR_RENT": load_bundle(
#         model_path="model/for-rent/for_rent_property_price_model_2026_01_05_11_16.pkl",
#         encoders_path="model/for-rent/for_rent_label_encoders_2026_01_05_11_16.pkl",
#         features_path="model/for-rent/for_rent_features_2026_01_05_11_16.json",
#     ),
#     "FOR_SALE": load_bundle(
#         model_path="model/for-sale/for_sale_property_price_model_2026_01_05_11_16.pkl",
#         encoders_path="model/for-sale/for_sale_label_encoders_2026_01_05_11_16.pkl",
#         features_path="model/for-sale/for_sale_features_2026_01_05_11_16.json",
#     )
# }
MODEL_BUNDLES = {
    "FOR_RENT": load_bundle(
        model_path="model/for-rent/for_rent_property_price_model_2025_12_29_21_32.pkl",
        encoders_path="model/for-rent/for_rent_label_encoders_2025_12_29_21_32.pkl",
        features_path="model/for-rent/for_rent_features_2025_12_29_21_32.json",
    ),
    "FOR_SALE": load_bundle(
        model_path="model/for-sale/for_sale_property_price_model_2025_12_29_21_33.pkl",
        encoders_path="model/for-sale/for_sale_label_encoders_2025_12_29_21_33.pkl",
        features_path="model/for-sale/for_sale_features_2025_12_29_21_33.json",
    )
}

# ============================================================================
# INPUT SCHEMA
# ============================================================================

class PropertyInput(BaseModel):
    square_meters: float
    floor: int | None = 0
    parking: bool = False
    wifi: bool = False
    balcony: bool = False
    elevator: bool = False

    heating: str
    type: str
    neighborhood: str | None = "Unknown"

    lat: float
    lng: float

    number_of_rooms: float | None = None
    year_built: int | None = 2000
    bedrooms: int | None = 2
    bathrooms: int | None = 1


# ============================================================================
# PREDICTION ENDPOINT
# ============================================================================

@app.post("/predict")
def predict_price(
    property: PropertyInput,
    category: str = Query(..., description="Property category", regex="^(FOR_RENT|FOR_SALE)$")
):
    try:
        if category not in MODEL_BUNDLES:
            raise HTTPException(status_code=400, detail="Invalid category")

        model, label_encoders, feature_names = MODEL_BUNDLES[category]

        X = prepare_single_property(
            property=property,
            label_encoders=label_encoders,
            feature_names=feature_names
        )

        predicted_log = model.predict(X)[0]
        predicted_price = np.expm1(predicted_log)

        return {
            "category": category,
            "predictedPrice": round(float(predicted_price), 2),
            "currency": "EUR",
            "neighborhood": property.neighborhood,
            "modelType": "XGBoost"
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
