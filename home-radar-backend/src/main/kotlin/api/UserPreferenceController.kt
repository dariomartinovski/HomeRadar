package com.home_radar.api

import com.home_radar.domain.UserPreference
import com.home_radar.service.UserPreferenceService
import com.home_radar.service.UserService
import com.home_radar.web.extensions.toResponse
import com.home_radar.web.request.UserPreferenceRequest
import com.home_radar.web.response.UserPreferenceResponse
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.*

@CrossOrigin
@RestController
@RequestMapping("/api/user-preferences")
class UserPreferenceController(
    private val userPreferenceService: UserPreferenceService,
    private val userService: UserService
) {
    @GetMapping
    fun getUserPreference(): UserPreferenceResponse? {
        val currentUser = userService
            .getUserFromAuthentication(SecurityContextHolder.getContext().authentication)
        val userPref = userPreferenceService.getUserPreference(currentUser.id)
        return userPref?.toResponse()
    }

    @PostMapping
    fun createOrUpdateUserPreference(@RequestBody request: UserPreferenceRequest): UserPreferenceResponse {
        val currentUser = userService
            .getUserFromAuthentication(SecurityContextHolder.getContext().authentication)
        val existing = userPreferenceService.getUserPreference(currentUser.id)

        val userPref = existing?.let { it.copy(
            radius = request.radius,
            perkPreferences = request.perkPreferences.associate { it.perkType to it.weight }
        ) } ?: UserPreference(
            radius = request.radius,
            perkPreferences = request.perkPreferences.associate { it.perkType to it.weight },
            userId = currentUser.id
        )

        val saved = userPreferenceService.createOrUpdateUserPreference(userPref)
        return saved.toResponse()
    }

}
