package com.home_radar.web.request

data class CreatePerkRequest(
    val title: String,
    val perkTypeId: Long,
    val latitude: Double,
    val longitude: Double,
    val openingHours: String? = null
)