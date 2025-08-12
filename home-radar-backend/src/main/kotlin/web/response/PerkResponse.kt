package com.home_radar.web.response

data class PerkResponse(
    val id: Long? = null,
    val title: String,
    val type: String,
    val latitude: Double,
    val longitude: Double,
    val openingHours: String? = null
)