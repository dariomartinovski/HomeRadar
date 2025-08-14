package com.home_radar.domain

import com.home_radar.domain.enum.HeatingType
import com.home_radar.domain.enum.PropertyCategory
import com.home_radar.domain.enum.PropertyType

import jakarta.persistence.*

@Entity
@Table(name = "properties")
data class Property(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    val title: String,
    val latitude: Double,
    val longitude: Double,

    @Enumerated(EnumType.STRING)
    val category: PropertyCategory,

    @Column(length = 2000)
    val description: String,
    val address: String,
    val contactNumber: String,

    val parking: Boolean,
    val wifi: Boolean,
    val balcony: Boolean,

    val squareMeters: Double,

    @Enumerated(EnumType.STRING)
    val heating: HeatingType,

    @Enumerated(EnumType.STRING)
    val type: PropertyType,

    val floor: Int?,
    val elevator: Boolean?,
    val numberOfRooms: Int,

    val price: String,
    val yearBuilt: Int?,
    val bedrooms: Int?,
    val bathrooms: Int?,
    val imageUrl: String,
    val neighborhood: String?
    )
