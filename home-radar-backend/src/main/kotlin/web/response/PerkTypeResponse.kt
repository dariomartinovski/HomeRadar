package com.home_radar.web.response

data class PerkTypeResponse(
    val id: Long? = null,
    val name: String,
    val description: String? = null,
    val defaultPerkTypeWeight: Double
)