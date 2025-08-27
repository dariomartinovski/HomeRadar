package com.home_radar.service

import com.home_radar.domain.Property
import com.home_radar.repository.PropertyRepository
import com.home_radar.web.extensions.toResponse
import com.home_radar.web.request.PropertyCreateRequest
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

    fun create(request: PropertyCreateRequest): PropertyResponse {
        val property = Property(
            title = request.title,
            category = request.category,
            description = request.description,
            address = request.address,
            contactNumber = request.contactNumber,
            type = request.type,
            squareMeters = request.squareMeters,
            numberOfRooms = request.numberOfRooms,
            floor = request.floor,
            heating = request.heating,
            price = request.price,
            parking = request.parking,
            wifi = request.wifi,
            balcony = request.balcony,
            elevator = request.elevator,
            yearBuilt = request.yearBuilt,
            bedrooms = request.bedrooms,
            bathrooms = request.bathrooms,
            imageUrl = request.imageUrl.toString(),
            neighborhood = request.neighborhood,
            latitude = request.latitude,
            longitude = request.longitude
        )

        return propertyRepository.save(property).toResponse()
    }
//    fun update(id: Long, updated: Property): Property {
//        val existing = getById(id)
//        return propertyRepository.save(
//            updated.copy(id = existing.id)
//        )
//    }
//
//    fun delete(id: Long) = propertyRepository.deleteById(id)

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