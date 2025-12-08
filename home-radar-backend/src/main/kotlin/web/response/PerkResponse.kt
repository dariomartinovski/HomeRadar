package com.home_radar.web.response

data class PerkResponse(
    val id: Long? = null,
    val title: String,
    val perkType: PerkTypeResponse,
    val latitude: Double,
    val longitude: Double,
    val openingHours: String? = null
)