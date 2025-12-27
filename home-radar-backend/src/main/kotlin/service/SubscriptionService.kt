package com.home_radar.service

import com.home_radar.domain.Subscription
import com.home_radar.domain.dto.SubscriptionDto
import com.home_radar.domain.enum.PlanType
import com.home_radar.domain.enum.SubscriptionStatus
import com.home_radar.repository.SubscriptionRepository
import com.home_radar.web.extensions.toDto
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
class SubscriptionService(
    private val subscriptionRepository: SubscriptionRepository
) {

    @Transactional
    fun getUserSubscription(userId: Long): SubscriptionDto {
        val subscription = subscriptionRepository.findByUserId(userId)
            .orElseGet {
                // Create default free subscription if none exists
                this.createFreeSubscription(userId)
            }

        return subscription.toDto()
    }

    @Transactional
    fun createFreeSubscription(userId: Long): Subscription {
        val freeSubscription = Subscription(
            userId = userId,
            planType = PlanType.FREE,
            status = SubscriptionStatus.ACTIVE,
            startDate = LocalDateTime.now()
        )
        return subscriptionRepository.save(freeSubscription)
    }

    @Transactional(readOnly = true)
    fun hasActiveSubscription(userId: Long, requiredPlan: PlanType): Boolean {
        val subscription = subscriptionRepository.findByUserId(userId)
            .orElse(null) ?: return requiredPlan == PlanType.FREE

        if (subscription.status != SubscriptionStatus.ACTIVE) {
            return false
        }

        // Check plan hierarchy: PREMIUM > STANDARD > FREE
        return when (requiredPlan) {
            PlanType.FREE -> true
            PlanType.STANDARD -> subscription.planType in listOf(PlanType.STANDARD, PlanType.PREMIUM)
            PlanType.PREMIUM -> subscription.planType == PlanType.PREMIUM
        }
    }
}