package com.home_radar.service

import com.home_radar.domain.Property
import com.home_radar.domain.events.PropertyCreatedEvent
import com.home_radar.repository.PropertyRepository
import com.home_radar.repository.UserRepository
import com.home_radar.web.extensions.toResponse
import com.home_radar.web.request.PropertyCreateRequest
import com.home_radar.web.response.PropertyResponse
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.nio.file.Files
import java.nio.file.Paths
import java.nio.file.StandardCopyOption
import java.util.*
import kotlin.NoSuchElementException

@Service
class PropertyService(
    private val propertyRepository: PropertyRepository,
    private val userRepository: UserRepository,
    private val eventPublisher: ApplicationEventPublisher
) {
    fun findAll(): List<PropertyResponse> = propertyRepository.findAll().map { it.toResponse() }

    fun findById(id: Long): PropertyResponse =
        propertyRepository.findById(id)
            .orElseThrow { NoSuchElementException("Property not found: $id") }
            .toResponse()

    fun create(request: PropertyCreateRequest, image: MultipartFile?): PropertyResponse {
        val owner = userRepository.findById(request.ownerId).orElseThrow { NoSuchElementException("User not found: $request.ownerId") }
        val imageUrl = if (image != null && !image.isEmpty) {
            val filename = UUID.randomUUID().toString() + "_" + image.originalFilename
            val path = Paths.get("uploads/$filename")
            Files.copy(image.inputStream, path, StandardCopyOption.REPLACE_EXISTING)
            "/uploads/$filename"
        } else {
            null
        }
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
            price = request.price.toString(),
            parking = request.parking,
            wifi = request.wifi,
            balcony = request.balcony,
            elevator = request.elevator,
            yearBuilt = request.yearBuilt,
            bedrooms = request.bedrooms,
            bathrooms = request.bathrooms,
            neighborhood = request.neighborhood,
            latitude = request.latitude,
            longitude = request.longitude,
            owner = owner,
            imageUrl = imageUrl ?: ""
        )

        propertyRepository.save(property)

        eventPublisher.publishEvent(PropertyCreatedEvent(property))

        return property.toResponse()
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