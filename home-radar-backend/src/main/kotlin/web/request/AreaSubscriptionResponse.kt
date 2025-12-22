package com.home_radar.web.request

import com.home_radar.domain.enum.AreaSubscriptionType

data class AreaSubscriptionResponse(
    val id: Long,
    val latitude: Double,
    val longitude: Double,
    val radiusMeters: Double,
    val type: AreaSubscriptionType
)