package com.home_radar.web.request

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern

data class RegisterRequest(
    @field:NotBlank(message = "First name cannot be empty")
    val firstName: String,

    @field:NotBlank(message = "Last name cannot be empty")
    val lastName: String,

    @field:NotBlank(message = "Email cannot be empty")
    @field:Email(message = "Email should contain '@' and '.'")
    val email: String,

    @field:NotBlank(message = "Password cannot be empty")
    @field:Pattern(
        regexp = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[!@#\$%^&*()_+=|<>?{}\\[\\]~-]).{8,}$",
        message = "Password must be at least 8 characters long and include uppercase, lowercase, digit, and special character"
    )
    val password: String,

    @field:NotBlank(message = "Phone number cannot be empty")
    @field:Pattern(
        regexp = "^(\\+3897\\d{7}|07\\d{7})$",
        message = "Phone number must start with +3897 and be 11 digits, or 07 and be 9 digits"
    )
    val phoneNumber: String
)