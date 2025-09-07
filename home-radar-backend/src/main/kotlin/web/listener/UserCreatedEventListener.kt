package com.home_radar.web.listener

import com.home_radar.domain.UserPreference
import com.home_radar.domain.constants.DEFAULT_PERK_TYPES_WEIGHT
import com.home_radar.domain.constants.DEFAULT_RADIUS
import com.home_radar.domain.events.UserCreatedEvent
import com.home_radar.service.UserPreferenceService
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Component

@Component
class UserCreatedEventListener(
    private val userPreferenceService: UserPreferenceService
) {
    @EventListener
    fun onUserCreated(event: UserCreatedEvent) {
        userPreferenceService.createOrUpdateUserPreference(
            UserPreference(
                radius = DEFAULT_RADIUS,
                perkPreferences = DEFAULT_PERK_TYPES_WEIGHT,
                userId = event.user.id
            )
        )
    }
}