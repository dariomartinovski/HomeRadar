package com.home_radar.domain

import jakarta.persistence.*
import com.home_radar.domain.enum.PropertyCategory

@Entity
@Table(name = "home_radar_score_benchmark")
data class HomeRadarScoreBenchmark(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    val latitude: Double,
    val longitude: Double,
    val radius: Double,
    val rawScore: Double,

    @Enumerated(EnumType.STRING)
    val propertyCategory: PropertyCategory,

    val createdAt: Long = System.currentTimeMillis()
)
