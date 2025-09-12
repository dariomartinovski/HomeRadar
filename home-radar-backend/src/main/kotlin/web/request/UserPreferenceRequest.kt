package com.home_radar.web.request

data class UserPreferenceRequest (
    val radius: Double,
    val weightsBalance: Double,
    val perkPreferences: List<PerkWeightRequest>
)