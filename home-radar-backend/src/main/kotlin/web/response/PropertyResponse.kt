package com.home_radar.web.response

import com.home_radar.domain.enum.HeatingType
import com.home_radar.domain.enum.PropertyCategory
import com.home_radar.domain.enum.PropertyType

data class PropertyResponse(
    val id: Long,
    val title: String,
    val category: PropertyCategory,
    val description: String,
    val address: String,
    val contactNumber: String,
    val type: PropertyType,
    val squareMeters: Double,
    val numberOfRooms: Int,
    val floor: Int?,
    val heating: HeatingType,
    val price: Double,
    val parking: Boolean,
    val wifi: Boolean,
    val balcony: Boolean,
    val elevator: Boolean?,
    val yearBuilt: Int?,
    val bedrooms: Int?,
    val bathrooms: Int?,
    val imageUrl: String?,
    val neighborhood: String?,
    val latitude: Double,
    val longitude: Double,
)
