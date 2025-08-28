package com.home_radar.domain.dto

data class UserSimpleDto (
    val id: Long,
    val email: String,
    val firstName: String,
    val lastName: String,
    val phoneNumber: String,
    val role: String
)