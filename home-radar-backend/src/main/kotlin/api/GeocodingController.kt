package com.home_radar.api

import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.client.RestTemplate

@RestController
@RequestMapping("/api/geocode")
class GeocodingController {

    private val restTemplate = RestTemplate()

    @GetMapping("/reverse")
    fun reverseGeocode(
        @RequestParam lat: Double,
        @RequestParam lng: Double
    ): ResponseEntity<String> {
        return try {
            val url = "https://nominatim.openstreetmap.org/reverse?format=json&lat=$lat&lon=$lng"

            val headers = HttpHeaders().apply {
                set("User-Agent", "PropertyApp/1.0 (your.email@example.com)")
            }

            val entity = HttpEntity<String>(headers)

            restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                String::class.java
            )
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("{\"error\": \"Geocoding service unavailable\"}")
        }
    }

    @GetMapping("/search")
    fun searchAddress(@RequestParam query: String): ResponseEntity<String> {
        return try {
            val url = "https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${query}"

            val headers = HttpHeaders().apply {
                set("User-Agent", "PropertyApp/1.0 (your.email@example.com)")
            }

            val entity = HttpEntity<String>(headers)

            restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                String::class.java
            )
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("[]")
        }
    }
}