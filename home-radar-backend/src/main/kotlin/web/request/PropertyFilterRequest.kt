package com.home_radar.web.request

import com.home_radar.domain.enum.PropertyCategory

data class PropertyFilterRequest(
    val title: String? = null,
    val area: String? = null,
    val propertyCategory: PropertyCategory? = null,
    val priceMin: Double? = null,
    val priceMax: Double? = null,
    val rooms: Int? = null,
    val bedrooms: Int? = null,
    val bathrooms: Int? = null,
    val sizeMin: Double? = null,
    val sizeMax: Double? = null,
    val yearBuilt: Int? = null,
    val parking: Boolean? = null,
    val balcony: Boolean? = null,
    val elevator: Boolean? = null
)
