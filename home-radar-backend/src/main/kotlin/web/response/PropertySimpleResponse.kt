package com.home_radar.web.response

import com.home_radar.domain.enum.PropertyCategory
import com.home_radar.domain.enum.PropertyType

data class PropertySimpleResponse (
    val id: Long,
    val title: String,
    val address: String,
    val neighborhood: String?,
    val category: PropertyCategory,
    val type: PropertyType,
    val price: Double
)