package com.home_radar.domain

import jakarta.persistence.*
import java.time.LocalDateTime
import com.home_radar.domain.enum.PropertyCategory

@Entity
@Table(name = "home_radar_score")
data class HomeRadarScore(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int? = null,

    val lat: Double,
    val lng: Double,
    val radius: Double,
    val rawScore: Double,
    val propertyCount: Int,

    @Enumerated(EnumType.STRING)
    val propertyCategory: PropertyCategory,

    val createdAt: LocalDateTime? = LocalDateTime.now()
)
