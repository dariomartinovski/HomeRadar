package com.home_radar.repository

import com.home_radar.domain.Subscription
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface SubscriptionRepository : JpaRepository<Subscription, Long> {
    fun findByUserId(userId: Long): Optional<Subscription>
    fun findByStripeSubscriptionId(stripeSubscriptionId: String): Optional<Subscription>
    fun findByStripeCustomerId(stripeCustomerId: String): Optional<Subscription>
}