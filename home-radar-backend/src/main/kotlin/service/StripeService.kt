package com.home_radar.service

import com.home_radar.domain.Subscription
import com.home_radar.domain.enum.PlanType
import com.home_radar.domain.enum.SubscriptionStatus
import com.home_radar.repository.SubscriptionRepository
import com.stripe.model.Customer
import com.stripe.model.checkout.Session
import com.stripe.param.CustomerCreateParams
import com.stripe.param.SubscriptionCancelParams
import com.stripe.param.checkout.SessionCreateParams
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import org.slf4j.LoggerFactory

@Service
class StripeService(
    private val subscriptionRepository: SubscriptionRepository
) {

    private val logger = LoggerFactory.getLogger(StripeService::class.java)

    @Value("\${stripe.webhook.secret}")
    private lateinit var webhookSecret: String

    @Value("\${app.frontend.url}")
    private lateinit var frontendUrl: String

    @Value("\${stripe.price-id-standard}")
    private lateinit var standardPriceId: String

    @Value("\${stripe.price-id-premium}")
    private lateinit var premiumPriceId: String

    private val priceIdToPlanType: Map<String, PlanType> by lazy {
        mapOf(
            standardPriceId to PlanType.STANDARD,
            premiumPriceId to PlanType.PREMIUM
        )
    }

    @Transactional
    fun createCheckoutSession(userId: Long, userEmail: String, priceId: String): Session {
        val customerId = getOrCreateStripeCustomer(userId, userEmail)

        val planType = priceIdToPlanType[priceId]
            ?: throw IllegalArgumentException("Invalid price ID: $priceId")

        val params = SessionCreateParams.builder()
            .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
            .setCustomer(customerId)
            .addLineItem(
                SessionCreateParams.LineItem.builder()
                    .setPrice(priceId)
                    .setQuantity(1L)
                    .build()
            )
            .setSuccessUrl("$frontendUrl/subscription/success?session_id={CHECKOUT_SESSION_ID}")
            .setCancelUrl("$frontendUrl/subscription-plans?canceled=true")
            .putMetadata("userId", userId.toString())
            .putMetadata("planType", planType.name)
            .build()

        return Session.create(params)
    }

    @Transactional
    fun cancelSubscription(userId: Long): Subscription {
        val subscription = subscriptionRepository.findByUserId(userId)
            .orElseThrow { IllegalArgumentException("No subscription found for user: $userId") }

        if (subscription.stripeSubscriptionId == null) {
            throw IllegalArgumentException("No active Stripe subscription found")
        }

        if (subscription.status == SubscriptionStatus.CANCELED) {
            throw IllegalArgumentException("Subscription is already canceled")
        }

        val stripeSubscription = com.stripe.model.Subscription.retrieve(subscription.stripeSubscriptionId)

        val cancelParams = SubscriptionCancelParams.builder()
            .build()

        stripeSubscription.cancel(cancelParams)

        logger.info("Canceled Stripe subscription: ${subscription.stripeSubscriptionId} for user: $userId")

        // Update local subscription status
        val updatedSubscription = subscription.copy(
            status = SubscriptionStatus.CANCELED,
            endDate = LocalDateTime.now(),
            updatedAt = LocalDateTime.now()
        )

        return subscriptionRepository.save(updatedSubscription)
    }

    @Transactional
    fun getOrCreateStripeCustomer(userId: Long, userEmail: String): String {
        val existingSubscription = subscriptionRepository.findByUserId(userId)

        if (existingSubscription.isPresent && existingSubscription.get().stripeCustomerId != null) {
            return existingSubscription.get().stripeCustomerId!!
        }

        val params = CustomerCreateParams.builder()
            .setEmail(userEmail)
            .putMetadata("userId", userId.toString())
            .build()

        val customer = Customer.create(params)
        return customer.id
    }

    @Transactional
    fun handleCheckoutSessionCompleted(session: Session) {
        val userId = session.metadata["userId"]?.toLongOrNull()
            ?: throw IllegalArgumentException("User ID not found in session metadata")

        val planTypeString = session.metadata["planType"]
            ?: throw IllegalArgumentException("Plan type not found in session metadata")

        val planType = PlanType.valueOf(planTypeString)
        val customerId = session.customer
        val subscriptionId = session.subscription

        val subscription = subscriptionRepository.findByUserId(userId)
            .map { existing ->
                existing.copy(
                    planType = planType,
                    stripeCustomerId = customerId,
                    stripeSubscriptionId = subscriptionId,
                    status = SubscriptionStatus.ACTIVE,
                    startDate = LocalDateTime.now(),
                    updatedAt = LocalDateTime.now()
                )
            }
            .orElse(
                Subscription(
                    userId = userId,
                    planType = planType,
                    stripeCustomerId = customerId,
                    stripeSubscriptionId = subscriptionId,
                    status = SubscriptionStatus.ACTIVE,
                    startDate = LocalDateTime.now()
                )
            )

        subscriptionRepository.save(subscription)
    }

    @Transactional
    fun handleSubscriptionUpdated(stripeSubscription: com.stripe.model.Subscription) {
        val subscription = subscriptionRepository.findByStripeSubscriptionId(stripeSubscription.id)
            .orElseThrow { IllegalArgumentException("Subscription not found: ${stripeSubscription.id}") }

        val status = when (stripeSubscription.status) {
            "active" -> SubscriptionStatus.ACTIVE
            "canceled" -> SubscriptionStatus.CANCELED
            "incomplete" -> SubscriptionStatus.INCOMPLETE
            "past_due" -> SubscriptionStatus.PAST_DUE
            "trialing" -> SubscriptionStatus.TRIALING
            else -> SubscriptionStatus.INCOMPLETE
        }

        val updatedSubscription = subscription.copy(
            status = status,
            updatedAt = LocalDateTime.now()
        )

        subscriptionRepository.save(updatedSubscription)
    }

    @Transactional
    fun handleSubscriptionDeleted(stripeSubscription: com.stripe.model.Subscription) {
        val subscription = subscriptionRepository.findByStripeSubscriptionId(stripeSubscription.id)
            .orElseThrow { IllegalArgumentException("Subscription not found: ${stripeSubscription.id}") }

        val updatedSubscription = subscription.copy(
            status = SubscriptionStatus.CANCELED,
            endDate = LocalDateTime.now(),
            updatedAt = LocalDateTime.now()
        )

        subscriptionRepository.save(updatedSubscription)
    }

    fun getWebhookSecret(): String = webhookSecret
}