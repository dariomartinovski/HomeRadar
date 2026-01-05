package com.home_radar.web.response

import com.home_radar.domain.enum.PropertyCategory

data class PricePredictionModelResponse(
    val category: PropertyCategory,
    val predictedPrice: Double,
    val currency: String,
    val neighborhood: String,
    val modelType: String
)
