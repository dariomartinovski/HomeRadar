package com.home_radar.web.request

import com.home_radar.domain.enum.SubscriptionType

data class CreateSubscriptionRequest(
    val latitude: Double,
    val longitude: Double,
    val radiusMeters: Double,
    val type: SubscriptionType
)