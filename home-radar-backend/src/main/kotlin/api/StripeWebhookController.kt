package com.home_radar.api

import com.home_radar.service.StripeService
import com.stripe.exception.SignatureVerificationException
import com.stripe.model.Event
import com.stripe.model.StripeObject
import com.stripe.model.checkout.Session
import com.stripe.net.Webhook
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@CrossOrigin
@RestController
@RequestMapping("/api/webhooks")
class StripeWebhookController(
    private val stripeService: StripeService
) {

    private val logger = LoggerFactory.getLogger(StripeWebhookController::class.java)

    @PostMapping("/stripe")
    fun handleStripeWebhook(
        @RequestBody payload: String,
        @RequestHeader("Stripe-Signature") signature: String
    ): ResponseEntity<String> {

        logger.info("=== Received Stripe webhook request ===")

        val event: Event = try {
            Webhook.constructEvent(payload, signature, stripeService.getWebhookSecret())
        } catch (e: SignatureVerificationException) {
            logger.error("Invalid signature for webhook", e)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature")
        }

        logger.info("Webhook event type: ${event.type}, ID: ${event.id}")

        try {
            when (event.type) {
                "checkout.session.completed" -> {
                    logger.info("Processing checkout.session.completed event")
                    val dataObjectDeserializer = event.dataObjectDeserializer

                    val stripeObject: StripeObject? = if (dataObjectDeserializer.`object`.isPresent) {
                        dataObjectDeserializer.`object`.get()
                    } else {
                        dataObjectDeserializer.deserializeUnsafe()
                    }

                    val session = stripeObject as? Session

                    if (session != null) {
                        logger.info("Session successfully deserialized")
                        logger.info("Session ID: ${session.id}")
                        logger.info("Customer: ${session.customer}")
                        logger.info("Subscription: ${session.subscription}")
                        logger.info("Metadata: ${session.metadata}")

                        stripeService.handleCheckoutSessionCompleted(session)
                        logger.info("Successfully processed checkout session")
                    } else {
                        logger.error("Failed to deserialize session object")
                        logger.error("Event data: ${event.data}")
                    }
                }
                "customer.subscription.updated" -> {
                    logger.info("Processing customer.subscription.updated event")
                    val dataObjectDeserializer = event.dataObjectDeserializer

                    val stripeObject: StripeObject? = if (dataObjectDeserializer.`object`.isPresent) {
                        dataObjectDeserializer.`object`.get()
                    } else {
                        dataObjectDeserializer.deserializeUnsafe()
                    }

                    val subscription = stripeObject as? com.stripe.model.Subscription

                    subscription?.let {
                        logger.info("Subscription ID: ${it.id}, Status: ${it.status}")
                        stripeService.handleSubscriptionUpdated(it)
                        logger.info("Successfully updated subscription")
                    }
                }
                "customer.subscription.deleted" -> {
                    logger.info("Processing customer.subscription.deleted event")
                    val dataObjectDeserializer = event.dataObjectDeserializer

                    val stripeObject: StripeObject? = if (dataObjectDeserializer.`object`.isPresent) {
                        dataObjectDeserializer.`object`.get()
                    } else {
                        dataObjectDeserializer.deserializeUnsafe()
                    }

                    val subscription = stripeObject as? com.stripe.model.Subscription

                    subscription?.let {
                        logger.info("Subscription ID: ${it.id}")
                        stripeService.handleSubscriptionDeleted(it)
                        logger.info("Successfully deleted subscription")
                    }
                }
                else -> {
                    logger.info("Unhandled event type: ${event.type}")
                }
            }
        } catch (e: Exception) {
            logger.error("Error processing webhook: ${event.type}", e)
            logger.error("Exception details: ${e.message}", e)
            e.printStackTrace()
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Webhook processing failed: ${e.message}")
        }

        logger.info("=== Webhook processed successfully ===")
        return ResponseEntity.ok("Webhook processed")
    }
}