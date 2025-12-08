package com.home_radar.web.request

data class CreatePerkTypeRequest(
    val name: String,
    val description: String? = null,
    val defaultPerkTypeWeight: Double
)