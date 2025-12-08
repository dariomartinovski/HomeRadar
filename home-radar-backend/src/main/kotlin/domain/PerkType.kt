package com.home_radar.domain

import jakarta.persistence.*

@Entity
@Table(name = "perk_types")
data class PerkType(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(nullable = false, unique = true)
    val name: String,

    @Column(length = 500)
    val description: String? = null,

    @Column(nullable = false)
    val defaultPerkTypeWeight: Double
)