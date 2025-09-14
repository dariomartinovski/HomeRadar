package com.home_radar.api

import com.home_radar.domain.UserPreference
import com.home_radar.domain.constants.DEFAULT_PERK_TYPES_WEIGHT
import com.home_radar.domain.constants.DEFAULT_PROPERTIES_PRICES_WEIGHT
import com.home_radar.domain.constants.DEFAULT_RADIUS
import com.home_radar.service.UserPreferenceService
import com.home_radar.service.UserService
import com.home_radar.web.extensions.toResponse
import com.home_radar.web.request.UserPreferenceRequest
import com.home_radar.web.response.PerkWeightResponse
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
        try {
            val currentUser = userService
                .getUserFromAuthentication(SecurityContextHolder.getContext().authentication)
            val userPref = userPreferenceService.getUserPreference(currentUser.id)
            return userPref?.toResponse()
        }
        catch(e: Exception) {
            return UserPreferenceResponse(
                radius = DEFAULT_RADIUS,
                weightsBalance = DEFAULT_PROPERTIES_PRICES_WEIGHT,
                perkPreferences = DEFAULT_PERK_TYPES_WEIGHT.map {
                    PerkWeightResponse(
                        it.key,
                        it.value
                    )
                }
            )
        }
    }

    @PostMapping
    fun createOrUpdateUserPreference(@RequestBody request: UserPreferenceRequest): UserPreferenceResponse {
        val currentUser = userService
            .getUserFromAuthentication(SecurityContextHolder.getContext().authentication)
        val existing = userPreferenceService.getUserPreference(currentUser.id)

        val userPref = existing?.let { it.copy(
            radius = request.radius,
            weightsBalance = request.weightsBalance,
            perkPreferences = request.perkPreferences.associate { it.perkType to it.weight }
        ) } ?: UserPreference(
            radius = request.radius,
            weightsBalance = request.weightsBalance,
            perkPreferences = request.perkPreferences.associate { it.perkType to it.weight },
            userId = currentUser.id
        )

        val saved = userPreferenceService.createOrUpdateUserPreference(userPref)
        return saved.toResponse()
    }

}
