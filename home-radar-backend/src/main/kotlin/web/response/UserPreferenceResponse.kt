package com.home_radar.web.response

data class UserPreferenceResponse(
    val radius: Double,
    val perkPreferences: List<PerkWeightResponse>
)