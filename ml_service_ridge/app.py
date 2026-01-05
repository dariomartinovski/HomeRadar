from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
import joblib
import json
import numpy as np
from preprocessing import prepare_single_property

app = FastAPI(title="Property Price Prediction API (Ridge V2)")

# ============================================================================
# LOAD MODEL BUNDLES
# ============================================================================

def load_bundle(model_path, n_map_path):
    # The .pkl now contains the Pipeline (Imputer + Scaler + Ridge)
    model = joblib.load(model_path)

    with open(n_map_path, 'r', encoding='utf-8') as f:
        n_map = json.load(f)

    # These must match the 'features' list in your training script exactly
    feature_names = [
        'square_meters', 'sqm_squared', 'floor', 'latitude', 'longitude',
        'number_of_rooms', 'bedrooms', 'bathrooms', 'neighborhood_signal',
        'property_age', 'room_density'
    ]

    return model, n_map, feature_names

# UPDATE THESE PATHS to your latest generated files
MODEL_BUNDLES = {
    "FOR_SALE": load_bundle(
        model_path="model/for-sale/for_sale_ridge_v2_2025_12_29_22_08.pkl",
        n_map_path="model/for-sale/for_sale_n_map_2025_12_29_22_08.json"
    ),
    "FOR_RENT": load_bundle(
        model_path="model/for-rent/for_rent_ridge_v2_2025_12_29_22_08.pkl",
        n_map_path="model/for-rent/for_rent_n_map_2025_12_29_22_08.json"
    )
}

class PropertyInput(BaseModel):
    square_meters: float
    floor: int | None = 0
    parking: bool = False
    wifi: bool = False
    balcony: bool = False
    elevator: bool = False
    heating: str | None = "NONE"
    type: str | None = "FLAT"
    neighborhood: str
    lat: float  # Must match JSON key
    lng: float  # Must match JSON key
    number_of_rooms: float | None = 2
    bedrooms: int | None = 1
    bathrooms: int | None = 1
    year_built: int | None = 2000

@app.post("/predict")
def predict_price(
    property: PropertyInput,
    category: str = Query(..., pattern="^(FOR_RENT|FOR_SALE)$")
):
    try:
        model, n_map, feature_names = MODEL_BUNDLES[category]

        X = prepare_single_property(property, n_map, feature_names)

        # Predict (Result is in Log Scale)
        log_prediction = model.predict(X)[0]

        # Reverse Log to get real EUR
        real_price = np.expm1(log_prediction)

        return {
            "category": category,
            "predictedPrice": round(float(real_price), 2),
            "currency": "EUR",
            "neighborhood": property.neighborhood,
            "modelType": "Ridge Regression"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))