package com.home_radar.service

import com.home_radar.config.JwtService
import com.home_radar.domain.User
import com.home_radar.domain.enum.UserRole
import com.home_radar.repository.UserRepository
import com.home_radar.web.request.AuthenticationRequest
import com.home_radar.web.request.RegisterRequest
import com.home_radar.web.response.AuthenticationResponse
import jakarta.transaction.Transactional
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

@Service
class AuthenticationService(
    val repository: UserRepository,
    val passwordEncoder: PasswordEncoder,
    val jwtService: JwtService,
    val authenticationManager: AuthenticationManager
) {
    @Transactional
    fun register(request: RegisterRequest): AuthenticationResponse {
        if (repository.existsByEmail(request.email)) {
            throw IllegalArgumentException("Email '${request.email}' is already in use.")
        }

        if (repository.existsByPhoneNumber(request.phoneNumber)) {
            throw IllegalArgumentException("Phone number '${request.phoneNumber}' is already in use.")
        }
        val user = User(
            firstName = request.firstName,
            lastName = request.lastName,
            email = request.email,
            userPassword = passwordEncoder.encode(request.password),
            phoneNumber = request.phoneNumber,
            role = UserRole.CLIENT
        )
        repository.save(user)
        val jwtToken = jwtService.generateToken(user)
        return AuthenticationResponse(token = jwtToken)
    }

    @Transactional
    fun authenticate(request: AuthenticationRequest): AuthenticationResponse {
        authenticationManager.authenticate(
            UsernamePasswordAuthenticationToken(request.email, request.password)
        )
        val user = repository.findByEmail(request.email)
            ?: throw IllegalArgumentException("Invalid email")
        val jwtToken = jwtService.generateToken(user)
        return AuthenticationResponse(token = jwtToken)
    }
}