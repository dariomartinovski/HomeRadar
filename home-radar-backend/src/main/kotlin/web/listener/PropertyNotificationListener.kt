package com.home_radar.domain.listener


import com.home_radar.domain.PendingNotification
import com.home_radar.domain.enum.SubscriptionType
import com.home_radar.domain.events.PropertyCreatedEvent
import com.home_radar.repository.PendingNotificationRepository
import com.home_radar.repository.SubscriptionRepository
import com.home_radar.service.EmailService
import com.home_radar.util.EmailTemplateUtil
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Component

@Component
class PropertyNotificationListener(
    private val subscriptionRepository: SubscriptionRepository,
    private val emailService: EmailService,
    private val pendingNotificationRepository: PendingNotificationRepository,
) {

    @EventListener
    fun onPropertyCreated(event: PropertyCreatedEvent) {
        val property = event.property
        val lat = property.latitude
        val lon = property.longitude

        val subscriptions = subscriptionRepository.findAllSubscriptionsCovering(lat, lon)

        subscriptions.forEach { subscription ->
            when (subscription.type) {
                SubscriptionType.INSTANT -> {
                    emailService.sendEmail(
                        subscription.user.email,
                        "New property in your area",
                        EmailTemplateUtil.newPropertyTemplate(property)
                    )
                }
                SubscriptionType.DAILY, SubscriptionType.WEEKLY -> {
                    pendingNotificationRepository.save(
                        PendingNotification(subscription = subscription, property = property)
                    )
                }
            }
        }
    }
}
