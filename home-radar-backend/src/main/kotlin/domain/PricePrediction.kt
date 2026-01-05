package com.home_radar.domain

import com.home_radar.domain.enum.PropertyCategory
import jakarta.persistence.*
import java.time.ZonedDateTime

@Entity
@Table(name = "price_predictions")
data class PricePrediction(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Enumerated(EnumType.STRING)
    val category: PropertyCategory,

    val predictedPrice: Double,

    val currency: String,

    val neighborhood: String,

    val modelType: String,

    val createdAt: ZonedDateTime = ZonedDateTime.now()
)
