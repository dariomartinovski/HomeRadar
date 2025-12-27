package com.home_radar.web.listener

import com.home_radar.domain.UserPreference
import com.home_radar.domain.constants.DEFAULT_RADIUS
import com.home_radar.domain.events.UserCreatedEvent
import com.home_radar.service.PerkTypeService
import com.home_radar.service.SubscriptionService
import com.home_radar.service.UserPreferenceService
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Component

@Component
class UserCreatedEventListener(
    private val userPreferenceService: UserPreferenceService,
    private val perkTypeService: PerkTypeService,
    private val subscriptionService: SubscriptionService
) {
    @EventListener
    fun onUserCreated(event: UserCreatedEvent) {
        userPreferenceService.createOrUpdateUserPreference(
            UserPreference(
                radius = DEFAULT_RADIUS,
                perkPreferences = perkTypeService.getAllPerkTypes().associate {
                    it.name to it.defaultPerkTypeWeight
                },
                userId = event.user.id
            )
        )

        subscriptionService.createFreeSubscription(event.user.id)
    }
}