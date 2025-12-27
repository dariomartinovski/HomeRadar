package com.home_radar.config

import org.springframework.security.authentication.AuthenticationProvider
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter

import jakarta.servlet.DispatcherType
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod


@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
class SecurityConfiguration(val authenticationProvider: AuthenticationProvider, val jwtAuthFilter: JwtAuthFilter) {
    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .cors {  }
            .csrf { it.disable() }
            .authorizeHttpRequests {
                it
                    .requestMatchers(
                        "/api/auth/**",
                        "/api/perks",
                        "/api/perks/**",
                        "/api/area-subscriptions/**",
                        "/api/properties/**",
                        "/api/user-preferences",
                        "/api/user-preferences/default",
                        "/uploads/**",
                        "/api/users/**",
                        "/api/images/**"
                        ).permitAll()
                    .requestMatchers(
                        HttpMethod.POST,
                        "/api/webhooks/stripe"
                    ).permitAll()
                    .requestMatchers(
                        HttpMethod.GET,
                        "/api/properties",
                        "/api/properties/**",
                        "/api/perk-types",
                        "/api/perk-types/**"
                    ).permitAll()
                    .dispatcherTypeMatchers(DispatcherType.ASYNC).permitAll()
                    .anyRequest().authenticated()
            }
            .sessionManagement {
                it.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            }
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter::class.java)

        return http.build()
    }
}