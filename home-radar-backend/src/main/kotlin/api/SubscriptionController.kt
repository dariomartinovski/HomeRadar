package com.home_radar.api

import com.home_radar.domain.User
import com.home_radar.domain.dto.CheckoutSessionRequest
import com.home_radar.domain.dto.CheckoutSessionResponse
import com.home_radar.domain.dto.SubscriptionDto
import com.home_radar.service.StripeService
import com.home_radar.service.SubscriptionService
import com.home_radar.web.extensions.toDto
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*

@CrossOrigin
@RestController
@RequestMapping("/api/subscriptions")
class SubscriptionController(
    private val stripeService: StripeService,
    private val subscriptionService: SubscriptionService
) {

    @PostMapping("/checkout")
    fun createCheckoutSession(
        @AuthenticationPrincipal user: User,
        @RequestBody request: CheckoutSessionRequest
    ): ResponseEntity<CheckoutSessionResponse> {
        val session = stripeService.createCheckoutSession(
            userId = user.id,
            userEmail = user.email,
            priceId = request.priceId
        )

        return ResponseEntity.ok(
            CheckoutSessionResponse(
                url = session.url,
                sessionId = session.id
            )
        )
    }

    @GetMapping("/current")
    fun getCurrentSubscription(
        @AuthenticationPrincipal user: User
    ): ResponseEntity<SubscriptionDto> {
        val subscription = subscriptionService.getUserSubscription(user.id)
        return ResponseEntity.ok(subscription)
    }

    @DeleteMapping("/cancel")
    fun cancelSubscription(
        @AuthenticationPrincipal user: User
    ): ResponseEntity<SubscriptionDto> {
        val canceledSubscription = stripeService.cancelSubscription(user.id)
        return ResponseEntity.ok(canceledSubscription.toDto())
    }
}