package com.home_radar.web.request

import com.home_radar.domain.enum.PropertyCategory

data class PricePredictionModelRequest(

    val category: PropertyCategory,

    val square_meters: Int,

    val floor: Int?,

    val parking: Boolean,
    val wifi: Boolean,
    val balcony: Boolean,
    val elevator: Boolean,

    val heating: String,

    val type: String,

    val neighborhood: String = "Unknown",

    val lat: Double,

    val lng: Double,

    val number_of_rooms: Int? = 1,

    val year_built: Int? = 2000,

    val bedrooms: Int? = 1,

    val bathrooms: Int? = 1
)
