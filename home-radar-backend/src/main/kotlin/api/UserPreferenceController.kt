package com.home_radar.api

import com.home_radar.domain.UserPreference
import com.home_radar.service.UserPreferenceService
import com.home_radar.web.extensions.toResponse
import com.home_radar.web.request.UserPreferenceRequest
import com.home_radar.web.response.UserPreferenceResponse
import org.springframework.web.bind.annotation.*

@CrossOrigin
@RestController
@RequestMapping("/api/user-preferences")
class UserPreferenceController(
    private val userPreferenceService: UserPreferenceService
) {

    //TODO later by {userId}
    @GetMapping()
    fun getUserPreference(): UserPreferenceResponse? {
        val userPref = userPreferenceService.getUserPreference(1)
        return userPref?.toResponse()
    }

    @PostMapping
    fun createOrUpdateUserPreference(@RequestBody request: UserPreferenceRequest): UserPreferenceResponse {
        val existing = userPreferenceService.getUserPreference(1)
//            userPreferenceService.getByUserId(/* TODO: userId from auth/session */)

        val userPref = existing?.let { it.copy(
            radius = request.radius,
            perkPreferences = request.perkPreferences.associate { it.perkType to it.weight }
        ) } ?: UserPreference(
            radius = request.radius,
            perkPreferences = request.perkPreferences.associate { it.perkType to it.weight }
        )

        val saved = userPreferenceService.createOrUpdateUserPreference(userPref)
        return saved.toResponse()
    }

}
