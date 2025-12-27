package com.home_radar.domain

import com.home_radar.domain.enum.PlanType
import com.home_radar.domain.enum.SubscriptionStatus
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "subscriptions")
data class Subscription(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false)
    val userId: Long,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val planType: PlanType = PlanType.FREE,

    @Column(unique = true)
    val stripeCustomerId: String? = null,

    @Column(unique = true)
    val stripeSubscriptionId: String? = null,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val status: SubscriptionStatus = SubscriptionStatus.ACTIVE,

    @Column(nullable = false)
    val startDate: LocalDateTime = LocalDateTime.now(),

    val endDate: LocalDateTime? = null,

    @Column(nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(nullable = false)
    val updatedAt: LocalDateTime = LocalDateTime.now()
)