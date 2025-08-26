package com.home_radar.service

import com.home_radar.repository.PropertyRepository
import com.home_radar.web.extensions.toResponse
import com.home_radar.web.response.PropertyResponse
import org.springframework.stereotype.Service

@Service
class PropertyService(
    private val propertyRepository: PropertyRepository
) {
    fun findAll(): List<PropertyResponse> = propertyRepository.findAll().map { it.toResponse() }

    fun findById(id: Long): PropertyResponse =
        propertyRepository.findById(id)
            .orElseThrow { NoSuchElementException("Property not found: $id") }
            .toResponse()

    fun findFiltered(title: String?, area: String?): List<PropertyResponse> {
        if (area != null && title != null) {
            return propertyRepository.findAllByTitleContainingIgnoreCaseAndNeighborhoodContainingIgnoreCase(title, area).map { it.toResponse() }
        }
        if (title != null) {
            return propertyRepository.findAllByTitleContainingIgnoreCase(title).map { it.toResponse() }
        }
        if (area != null) {
            return propertyRepository.findAllByNeighborhoodContainingIgnoreCase(area).map { it.toResponse() }
        }
        return propertyRepository.findAll().map { it.toResponse() }
    }

    fun findAllAreas(): List<String> =
        propertyRepository
            .findAll()
            .mapNotNull { it.neighborhood }
            .sortedDescending()
            .toSet()
            .toList()
}