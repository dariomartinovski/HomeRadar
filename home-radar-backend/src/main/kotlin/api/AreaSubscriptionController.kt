package com.home_radar.api

import com.home_radar.service.AreaSubscriptionService
import com.home_radar.service.UserService
import com.home_radar.web.request.CreateAreaSubscriptionRequest
import com.home_radar.web.request.AreaSubscriptionResponse
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.web.bind.annotation.*
import java.security.Principal

@CrossOrigin
@RestController
@RequestMapping("/api/area-subscriptions")
class AreaSubscriptionController(
    private val areaSubscriptionService: AreaSubscriptionService,
    private val userService: UserService
) {

    @PostMapping
    fun createSubscription(
        @RequestBody request: CreateAreaSubscriptionRequest,
        principal: Principal
    ): AreaSubscriptionResponse {
        val user = userService.getUserFromAuthentication(SecurityContextHolder.getContext().authentication)
            ?: throw UsernameNotFoundException("User not found")

        val subscription = areaSubscriptionService.createAreaSubscription(user.id, request)
        return subscription
    }

    @GetMapping
    fun getUserSubscriptions(principal: Principal): List<AreaSubscriptionResponse> {
        val userId = getUserIdFromPrincipal(principal)
        val subscriptions = areaSubscriptionService.getAreaUserSubscriptions(userId)
        return subscriptions
    }

    private fun getUserIdFromPrincipal(principal: Principal): Long {
        return principal.name.toLong()
    }
}