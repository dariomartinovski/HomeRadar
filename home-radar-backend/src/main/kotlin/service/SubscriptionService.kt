package com.home_radar.service


import com.home_radar.domain.Subscription
import com.home_radar.repository.SubscriptionRepository
import com.home_radar.repository.UserRepository
import com.home_radar.web.request.CreateSubscriptionRequest
import com.home_radar.web.request.SubscriptionResponse
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional
class SubscriptionService(
    private val subscriptionRepository: SubscriptionRepository,
    private val userRepository: UserRepository
) {

    fun createSubscription(userId: Long, request: CreateSubscriptionRequest): SubscriptionResponse {
        val user = userRepository.findById(userId)
            .orElseThrow { RuntimeException("User not found") }

        val subscription = Subscription(
            user = user,
            latitude = request.latitude,
            longitude = request.longitude,
            radiusMeters = request.radiusMeters,
            type = request.type
        )

        val savedSubscription = subscriptionRepository.save(subscription)

        return SubscriptionResponse(
            id = savedSubscription.id,
            latitude = savedSubscription.latitude,
            longitude = savedSubscription.longitude,
            radiusMeters = savedSubscription.radiusMeters,
            type = savedSubscription.type
        )
    }

    fun getUserSubscriptions(userId: Long): List<SubscriptionResponse> {
        // Add this query to your repository first
        val subscriptions = subscriptionRepository.findByUserId(userId)

        return subscriptions.map { subscription ->
            SubscriptionResponse(
                id = subscription.id,
                latitude = subscription.latitude,
                longitude = subscription.longitude,
                radiusMeters = subscription.radiusMeters,
                type = subscription.type
            )
        }
    }

    fun deleteSubscription(userId: Long, subscriptionId: Long) {
        val subscription = subscriptionRepository.findById(subscriptionId)
            .orElseThrow { RuntimeException("Subscription not found") }

        if (subscription.user.id != userId) {
            throw RuntimeException("Not authorized to delete this subscription")
        }

        subscriptionRepository.delete(subscription)
    }
}