package com.home_radar.web.scheduler

import com.home_radar.domain.enum.SubscriptionType
import com.home_radar.repository.PendingNotificationRepository
import com.home_radar.service.EmailService
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import java.time.LocalDate
import java.time.DayOfWeek

@Component
class NotificationScheduler(
    private val pendingNotificationRepository: PendingNotificationRepository,
    private val emailService: EmailService
) {
    // Every day at 18:00
    @Scheduled(cron = "0 0 18 * * *")
    fun sendDailyNotifications() {
        val today = LocalDate.now()
        val notifications = pendingNotificationRepository.findAllForTypeAndDate(
            SubscriptionType.DAILY, today
        )
        groupAndSend(notifications)
    }

    // Every Monday at 09:00
    @Scheduled(cron = "0 0 9 * * MON")
    fun sendWeeklyNotifications() {
        val weekStart = LocalDate.now().with(DayOfWeek.MONDAY).atStartOfDay()
        val notifications = pendingNotificationRepository.findAllForTypeAndAfterDate(
            SubscriptionType.WEEKLY, weekStart
        )
        groupAndSend(notifications)
    }

    private fun groupAndSend(notifications: List<com.home_radar.domain.PendingNotification>) {
        val grouped = notifications.groupBy { it.subscription.user.email }

        grouped.forEach { (email, userNotifications) ->
            val body = userNotifications.joinToString("\n\n") {
                "- ${it.property.title} (${it.property.price})"
            }
            emailService.sendEmail(
                email,
                "Your property digest",
                "Here are new properties in your area:\n\n$body"
            )
        }

        pendingNotificationRepository.deleteAll(notifications)
    }
}
