package com.home_radar.service

import com.home_radar.domain.UserPreference
import com.home_radar.repository.UserPreferenceRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class UserPreferenceService(
    private val userPreferenceRepository: UserPreferenceRepository
) {

    //TODO remove id from here, fetch from the user
    @Transactional(readOnly = true)
    fun getUserPreference(id: Long): UserPreference? {
        return userPreferenceRepository.findById(id).orElse(null)
    }

    @Transactional
    fun createOrUpdateUserPreference(userPreference: UserPreference): UserPreference {
        return userPreferenceRepository.save(userPreference)
    }
}