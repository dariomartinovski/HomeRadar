package com.home_radar.domain.dto

data class CheckoutSessionRequest(
    val priceId: String
)

data class CheckoutSessionResponse(
    val url: String,
    val sessionId: String
)

data class SubscriptionDto(
    val id: Long,
    val userId: Long,
    val planType: String,
    val status: String,
    val startDate: String,
    val endDate: String?
)