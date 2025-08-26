package com.home_radar.web.request

import com.home_radar.domain.enum.HeatingType
import com.home_radar.domain.enum.PropertyCategory
import com.home_radar.domain.enum.PropertyType

data class PropertyCreateRequest(
    val title: String,
    val category: PropertyCategory,
    val description: String,
    val address: String,
    val contactNumber: String,
    val type: PropertyType,
    val squareMeters: Double,
    val numberOfRooms: Int,
    val floor: Int? = null,
    val heating: HeatingType,
    val price: Double,
    val parking: Boolean = false,
    val wifi: Boolean = false,
    val balcony: Boolean = false,
    val elevator: Boolean = false,
    val yearBuilt: Int? = null,
    val bedrooms: Int? = null,
    val bathrooms: Int? = null,
    val imageUrl: String? = null,
    val neighborhood: String? = null,
    val latitude: Double,
    val longitude: Double
)