package com.home_radar.domain.dto

import com.home_radar.domain.Property

data class UserDto(
    val id: Long,
    val email: String,
    val firstName: String,
    val lastName: String,
    val phoneNumber: String,
    val ownedProperties: List<Property>,
    val userRole: String
)