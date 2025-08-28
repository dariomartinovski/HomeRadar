package com.home_radar.service

import com.home_radar.domain.User
import com.home_radar.repository.UserRepository
import jakarta.transaction.Transactional
import org.springframework.stereotype.Service
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UsernameNotFoundException
@Service
class UserService(
    private val userRepository: UserRepository
) {
    @Transactional
    fun getUserFromAuthentication(authentication: org.springframework.security.core.Authentication): User {
        val userDetails: UserDetails = authentication.principal as UserDetails
        return userRepository.findByEmail(userDetails.username)
            ?: throw UsernameNotFoundException("User not found")
    }
}