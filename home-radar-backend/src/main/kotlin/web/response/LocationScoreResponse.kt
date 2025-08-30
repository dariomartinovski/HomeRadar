package com.home_radar.web.response

data class LocationScoreResponse(
    val rentScore: Double,
    val saleScore: Double,
    val averageRentPrice: Double? = null,
    val averageSalePrice: Double? = null,
    val perkCounts: List<PerkCountResponse> = emptyList()
)
