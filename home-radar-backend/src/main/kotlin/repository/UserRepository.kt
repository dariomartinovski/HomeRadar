package com.home_radar.repository

import com.home_radar.domain.User
import org.springframework.data.jpa.repository.JpaRepository

interface UserRepository : JpaRepository<User, Long> {
    fun findByEmail(email: String): User?
    fun existsByEmail(email: String): Boolean
    fun existsByPhoneNumber(phoneNumber: String): Boolean
}