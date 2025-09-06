package com.home_radar.domain

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
data class PendingNotification(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne
    val subscription: Subscription,

    @ManyToOne
    val property: Property,

    val createdAt: LocalDateTime = LocalDateTime.now()
)