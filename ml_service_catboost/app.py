from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
import joblib
import numpy as np
import pandas as pd
from preprocessing import prepare_single_property

app = FastAPI(title="Property Price Prediction API (CatBoost)")

# ============================================================================
# MODEL LOADING
# ============================================================================

MODELS = {
    "FOR_SALE": "model/for_sale_catboost_model_2026_01_05_11_38.pkl",
    "FOR_RENT": "model/for_rent_catboost_model_2026_01_05_11_37.pkl"
}

# The feature list MUST match the 'feature_columns' list in your training script
FEATURE_NAMES = [
    'square_meters', 'floor', 'parking', 'wifi', 'balcony', 'elevator',
    'heating', 'type', 'neighborhood', 'lat', 'lng',
    'number_of_rooms', 'property_age', 'bedrooms', 'bathrooms', 'room_density'
]

# Load models into memory on startup
loaded_models = {}
try:
    for cat, path in MODELS.items():
        loaded_models[cat] = joblib.load(path)
    print("✅ CatBoost models loaded successfully.")
except Exception as e:
    print(f"❌ Error loading models: {e}")

# ============================================================================
# SCHEMAS
# ============================================================================

class PropertyInput(BaseModel):
    square_meters: float
    floor: int | None = 0
    parking: bool = False
    wifi: bool = False
    balcony: bool = False
    elevator: bool = False
    heating: str = "NONE"
    type: str = "FLAT"
    neighborhood: str
    lat: float
    lng: float
    number_of_rooms: float = 2
    bedrooms: int = 1
    bathrooms: int = 1
    year_built: int | None = 2000

# ============================================================================
# ENDPOINTS
# ============================================================================

@app.post("/predict")
def predict_price(
    property_input: PropertyInput,
    category: str = Query(..., pattern="^(FOR_RENT|FOR_SALE)$")
):
    if category not in loaded_models:
        raise HTTPException(status_code=500, detail="Model for this category not loaded.")

    try:
        model = loaded_models[category]

        # Preprocess the input
        X = prepare_single_property(property_input, FEATURE_NAMES)

        # Predict (Result is in Log Scale because we used np.log1p during training)
        log_pred = model.predict(X)[0]

        # Reverse Log to get real EUR
        real_price = np.expm1(log_pred)

        return {
            "category": category,
            "predictedPrice": round(float(real_price), 2),
            "currency": "EUR",
            "neighborhood": property_input.neighborhood,
            "modelType": "CatBoost"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)