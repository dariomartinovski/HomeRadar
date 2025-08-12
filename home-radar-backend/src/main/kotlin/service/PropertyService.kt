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
//    fun create(property: Property): Property = propertyRepository.save(property)
//
//    fun update(id: Long, updated: Property): Property {
//        val existing = getById(id)
//        return propertyRepository.save(
//            updated.copy(id = existing.id)
//        )
//    }
//
//    fun delete(id: Long) = propertyRepository.deleteById(id)
}