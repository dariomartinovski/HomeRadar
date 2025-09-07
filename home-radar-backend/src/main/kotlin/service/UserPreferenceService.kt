package com.home_radar.service

import com.home_radar.domain.UserPreference
import com.home_radar.repository.UserPreferenceRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class UserPreferenceService(
    private val userPreferenceRepository: UserPreferenceRepository
) {

    @Transactional(readOnly = true)
    fun getUserPreference(userId: Long): UserPreference? {
        return userPreferenceRepository.findByUserId(userId)
    }

    @Transactional
    fun createOrUpdateUserPreference(userPreference: UserPreference): UserPreference {
        return userPreferenceRepository.save(userPreference)
    }
}