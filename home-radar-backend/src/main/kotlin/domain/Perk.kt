package com.home_radar.domain

import jakarta.persistence.*

@Entity
@Table(name = "perks")
data class Perk(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(nullable = false)
    val title: String,

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "perk_type_id", nullable = false)
    val perkType: PerkType,

    @Column(nullable = false)
    val latitude: Double,

    @Column(nullable = false)
    val longitude: Double,

    @Column(length = 500)
    val openingHours: String? = null
)