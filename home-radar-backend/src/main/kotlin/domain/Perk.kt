package com.home_radar.domain

import com.home_radar.domain.enum.PerkType
import jakarta.persistence.*

@Entity
@Table(name = "perks")
data class Perk (
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    val title: String,

    @Enumerated(EnumType.STRING)
    val type: PerkType,
    val latitude: Double,
    val longitude: Double,
    val openingHours: String? = null
)