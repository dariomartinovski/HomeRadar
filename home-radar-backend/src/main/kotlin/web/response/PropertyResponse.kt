package com.home_radar.web.response

data class PropertyResponse(
    val id: Long,
    val title: String,
    val latitude: Double,
    val longitude: Double,
    val category: String,
    val description: String,
    val address: String,
    val contactNumber: String,
    val parking: Boolean,
    val wifi: Boolean,
    val balcony: Boolean,
    val squareMeters: Double,
    val heating: String,
    val type: String,
    val floor: Int?,
    val elevator: Boolean?,
    val numberOfRooms: Int
)
