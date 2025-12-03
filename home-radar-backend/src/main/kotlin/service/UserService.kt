package com.home_radar.service

import com.home_radar.domain.User
import com.home_radar.domain.UserPropertyPreference
import com.home_radar.domain.enum.PreferenceType
import com.home_radar.repository.UserRepository
import jakarta.transaction.Transactional
import org.springframework.stereotype.Service
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UsernameNotFoundException

@Service
class UserService(
    private val userRepository: UserRepository,
    private val propertyService: PropertyService
) {
    @Transactional
    fun getUserFromAuthentication(authentication: org.springframework.security.core.Authentication): User {
        val userDetails: UserDetails = authentication.principal as UserDetails
        return userRepository.findByEmail(userDetails.username)
            ?: throw UsernameNotFoundException("User not found")
    }

    @Transactional
    fun setPreference(user: User, propertyId: Long, preference: PreferenceType): User {
        val property = propertyService.findById(propertyId)

        val existingPreference = user.propertyPreferences
            .firstOrNull { it.property.id == propertyId }

        if (existingPreference != null) {
            if (existingPreference.preferenceType != preference) {
                existingPreference.preferenceType = preference
            }
            else {
                user.propertyPreferences.remove(existingPreference)
            }
            return user
        }

        user.propertyPreferences.add(
            UserPropertyPreference(
                user = user,
                property = property,
                preferenceType = preference
            )
        )
        return user
    }
}