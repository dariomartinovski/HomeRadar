package com.home_radar.domain

import com.home_radar.domain.enum.SubscriptionType
import jakarta.persistence.*

@Entity
data class Subscription(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne
    val user: User,

    val latitude: Double,
    val longitude: Double,
    val radiusMeters: Double,

    @Enumerated(EnumType.STRING)
    val type: SubscriptionType
)