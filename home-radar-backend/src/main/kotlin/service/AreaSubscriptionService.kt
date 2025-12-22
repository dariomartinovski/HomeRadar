package com.home_radar.service

import com.home_radar.domain.AreaSubscription
import com.home_radar.repository.AreaSubscriptionRepository
import com.home_radar.repository.UserRepository
import com.home_radar.web.request.CreateAreaSubscriptionRequest
import com.home_radar.web.request.AreaSubscriptionResponse
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional
class AreaSubscriptionService(
    private val areaSubscriptionRepository: AreaSubscriptionRepository,
    private val userRepository: UserRepository
) {

    fun createAreaSubscription(userId: Long, request: CreateAreaSubscriptionRequest): AreaSubscriptionResponse {
        val user = userRepository.findById(userId)
            .orElseThrow { RuntimeException("User not found") }

        val areaSubscription = AreaSubscription(
            user = user,
            latitude = request.latitude,
            longitude = request.longitude,
            radiusMeters = request.radiusMeters,
            type = request.type
        )

        val savedAreaSubscription = areaSubscriptionRepository.save(areaSubscription)

        return AreaSubscriptionResponse(
            id = savedAreaSubscription.id,
            latitude = savedAreaSubscription.latitude,
            longitude = savedAreaSubscription.longitude,
            radiusMeters = savedAreaSubscription.radiusMeters,
            type = savedAreaSubscription.type
        )
    }

    fun getAreaUserSubscriptions(userId: Long): List<AreaSubscriptionResponse> {
        val subscriptions = areaSubscriptionRepository.findByUserId(userId)

        return subscriptions.map { subscription ->
            AreaSubscriptionResponse(
                id = subscription.id,
                latitude = subscription.latitude,
                longitude = subscription.longitude,
                radiusMeters = subscription.radiusMeters,
                type = subscription.type
            )
        }
    }

    fun deleteSubscription(userId: Long, subscriptionId: Long) {
        val subscription = areaSubscriptionRepository.findById(subscriptionId)
            .orElseThrow { RuntimeException("Subscription not found") }

        if (subscription.user.id != userId) {
            throw RuntimeException("Not authorized to delete this subscription")
        }

        areaSubscriptionRepository.delete(subscription)
    }
}