package com.home_radar.api

import com.home_radar.domain.enum.PreferenceType
import com.home_radar.service.UserService
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.web.bind.annotation.*

@CrossOrigin
@RestController
@RequestMapping("/api/users")
class UserController(
    private val userService: UserService
) {
    @GetMapping("/self")
    fun getUserDetails(): ResponseEntity<Any> {
        return try {
            val user = userService.getUserFromAuthentication(SecurityContextHolder.getContext().authentication)
                ?: throw UsernameNotFoundException("User not found")
            ResponseEntity.ok(user.toSimpleDto())
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(mapOf("error" to e.message))
        }
    }

    @PutMapping("/property/{propertyId}/preference")
    fun setPreference(
        @PathVariable propertyId: Long,
        @RequestParam type: String
    ): ResponseEntity<Any> {
        return try {
            val user = userService.getUserFromAuthentication(SecurityContextHolder.getContext().authentication)
                ?: throw UsernameNotFoundException("User not found")
            val preferenceType = PreferenceType.valueOf(type.uppercase())
            val updatedUser = userService.setPreference(user, propertyId, preferenceType)

            ResponseEntity.ok(updatedUser.toSimpleDto())
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().body(mapOf("error" to "Invalid preference type"))
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(mapOf("error" to e.message))
        }
    }

}