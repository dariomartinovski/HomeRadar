package com.home_radar.api

import com.home_radar.service.AuthenticationService
import com.home_radar.web.request.AuthenticationRequest
import com.home_radar.web.request.RegisterRequest
import com.home_radar.web.response.AuthenticationResponse
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@CrossOrigin
@RequestMapping("/api/auth")
class AuthenticationController(val service: AuthenticationService) {
    @PostMapping("/register")
    fun register(@RequestBody @Valid request: RegisterRequest): ResponseEntity<AuthenticationResponse> {
        try {
            val response: AuthenticationResponse = service.register(request)
            return ResponseEntity.ok(response)
        } catch (e: RuntimeException) {
            return ResponseEntity.badRequest().build()
        }
    }

    @PostMapping("/authenticate")
    fun authenticate(@RequestBody request: AuthenticationRequest): ResponseEntity<AuthenticationResponse> {
        return ResponseEntity.ok(service.authenticate(request))
    }
}