package com.home_radar.api

import com.home_radar.service.SubscriptionService
import com.home_radar.service.UserService
import com.home_radar.web.request.CreateSubscriptionRequest
import com.home_radar.web.request.SubscriptionResponse
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.web.bind.annotation.*
import java.security.Principal

@CrossOrigin
@RestController
@RequestMapping("/api/subscriptions")
class SubscriptionController(
    private val subscriptionService: SubscriptionService,
    private val userService: UserService
) {

    @PostMapping
    fun createSubscription(
        @RequestBody request: CreateSubscriptionRequest,
        principal: Principal
    ): SubscriptionResponse {
        val user = userService.getUserFromAuthentication(SecurityContextHolder.getContext().authentication)
            ?: throw UsernameNotFoundException("User not found")

        val subscription = subscriptionService.createSubscription(user.id, request)
        return subscription
    }

    @GetMapping
    fun getUserSubscriptions(principal: Principal): List<SubscriptionResponse> {
        val userId = getUserIdFromPrincipal(principal)
        val subscriptions = subscriptionService.getUserSubscriptions(userId)
        return subscriptions
    }

    private fun getUserIdFromPrincipal(principal: Principal): Long {
        return principal.name.toLong()
    }
}