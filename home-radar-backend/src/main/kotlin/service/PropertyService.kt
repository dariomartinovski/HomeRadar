package com.home_radar.service

import com.home_radar.domain.ImageEntity
import com.home_radar.domain.Property
import com.home_radar.domain.enum.PropertyCategory
import com.home_radar.domain.events.PropertyCreatedEvent
import com.home_radar.repository.ImageRepository
import com.home_radar.repository.PropertyRepository
import com.home_radar.repository.UserRepository
import com.home_radar.web.extensions.toResponse
import com.home_radar.web.request.PropertyCreateRequest
import com.home_radar.web.request.PropertyFilterRequest
import com.home_radar.web.response.PropertyResponse
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import kotlin.NoSuchElementException
import org.springframework.data.jpa.domain.Specification
import jakarta.persistence.criteria.Predicate

@Service
class PropertyService(
    private val propertyRepository: PropertyRepository,
    private val userRepository: UserRepository,
    private val imageRepository: ImageRepository,
    private val eventPublisher: ApplicationEventPublisher
) {
    fun findAll(): List<Property> = propertyRepository.findAll()

    fun findById(id: Long): Property =
        propertyRepository.findById(id)
            .orElseThrow { NoSuchElementException("Property not found: $id") }

    fun create(request: PropertyCreateRequest, image: MultipartFile?): PropertyResponse {
        val owner = userRepository.findById(request.ownerId).orElseThrow { NoSuchElementException("User not found: $request.ownerId") }

        val imageEntity = image?.let {
            imageRepository.save(
                ImageEntity(image = it.bytes)
            )
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
            price = request.price,
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
            externalImageUrl = null,
            internalImageId = imageEntity?.id
        )

        propertyRepository.save(property)

        eventPublisher.publishEvent(PropertyCreatedEvent(property))

        return property.toResponse()
    }

    fun findFiltered(
        filter: PropertyFilterRequest
    ): List<Property> {
        with(filter) {
            val spec = Specification<Property> { root, query, cb ->
            val predicates = mutableListOf<Predicate>()

            title?.let {
                predicates.add(cb.like(cb.lower(root.get("title")), "%${it.lowercase()}%"))
            }

            area?.let {
                predicates.add(cb.like(cb.lower(root.get("neighborhood")), "%${it.lowercase()}%"))
            }

            propertyCategory?.let {
                predicates.add(cb.equal(root.get<PropertyCategory>("category"), it))
            }

            priceMin?.let {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), it))
            }

            priceMax?.let {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), it))
            }

            rooms?.let {
                predicates.add(cb.greaterThanOrEqualTo(root.get<Int>("numberOfRooms"), it))
            }

            bedrooms?.let {
                predicates.add(cb.greaterThanOrEqualTo(root.get<Int>("bedrooms"), it))
            }

            bathrooms?.let {
                predicates.add(cb.greaterThanOrEqualTo(root.get<Int>("bathrooms"), it))
            }

            sizeMin?.let {
                predicates.add(cb.greaterThanOrEqualTo(root.get<Double>("squareMeters"), it))
            }

            sizeMax?.let {
                predicates.add(cb.lessThanOrEqualTo(root.get<Double>("squareMeters"), it))
            }

            yearBuilt?.let {
                predicates.add(cb.greaterThanOrEqualTo(root.get<Int>("yearBuilt"), it))
            }

            parking?.let {
                predicates.add(cb.equal(root.get<Boolean>("parking"), it))
            }

            balcony?.let {
                predicates.add(cb.equal(root.get<Boolean>("balcony"), it))
            }

            elevator?.let {
                predicates.add(cb.equal(root.get<Boolean>("elevator"), it))
            }

            cb.and(*predicates.toTypedArray())
        }
            return propertyRepository.findAll(spec)
        }
    }

    fun findFilteredWithinRadius(filter: PropertyFilterRequest,
                                    lat: Double? = null,
                                    lon: Double? = null,
                                    radius: Double? = null): List<Property> {
        val spec = Specification<Property> { root, query, cb ->
            val predicates = mutableListOf<Predicate>()

            filter.title?.let {
                predicates.add(cb.like(cb.lower(root.get("title")), "%${it.lowercase()}%"))
            }

            filter.area?.let {
                predicates.add(cb.like(cb.lower(root.get("neighborhood")), "%${it.lowercase()}%"))
            }

            filter.propertyCategory?.let {
                predicates.add(cb.equal(root.get<PropertyCategory>("category"), it))
            }

            filter.priceMin?.let {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), it))
            }

            filter.priceMax?.let {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), it))
            }

            filter.rooms?.let {
                predicates.add(cb.greaterThanOrEqualTo(root.get<Int>("numberOfRooms"), it))
            }

            filter.bedrooms?.let {
                predicates.add(cb.greaterThanOrEqualTo(root.get<Int>("bedrooms"), it))
            }

            filter.bathrooms?.let {
                predicates.add(cb.greaterThanOrEqualTo(root.get<Int>("bathrooms"), it))
            }

            filter.sizeMin?.let {
                predicates.add(cb.greaterThanOrEqualTo(root.get<Double>("squareMeters"), it))
            }

            filter.sizeMax?.let {
                predicates.add(cb.lessThanOrEqualTo(root.get<Double>("squareMeters"), it))
            }

            filter.yearBuilt?.let {
                predicates.add(cb.greaterThanOrEqualTo(root.get<Int>("yearBuilt"), it))
            }

            filter.parking?.let {
                predicates.add(cb.equal(root.get<Boolean>("parking"), it))
            }

            filter.balcony?.let {
                predicates.add(cb.equal(root.get<Boolean>("balcony"), it))
            }

            filter.elevator?.let {
                predicates.add(cb.equal(root.get<Boolean>("elevator"), it))
            }

            if (lat != null && lon != null && radius != null) {
                val earthRadius = 6371000
                val latExpression = cb.toDouble(root.get<Double>("latitude"))
                val lonExpression = cb.toDouble(root.get<Double>("longitude"))

                val haversine = cb.prod(
                    earthRadius.toDouble(),
                    cb.function(
                        "acos",
                        Double::class.java,
                        cb.sum(
                            cb.prod(
                                cb.function("cos", Double::class.java, cb.function("radians", Double::class.java, cb.literal(lat))),
                                cb.prod(
                                    cb.function("cos", Double::class.java, cb.function("radians", Double::class.java, latExpression)),
                                    cb.function(
                                        "cos",
                                        Double::class.java,
                                        cb.diff(
                                            cb.function("radians", Double::class.java, lonExpression),
                                            cb.function("radians", Double::class.java, cb.literal(lon))
                                        )
                                    )
                                )
                            ),
                            cb.prod(
                                cb.function("sin", Double::class.java, cb.function("radians", Double::class.java, cb.literal(lat))),
                                cb.function("sin", Double::class.java, cb.function("radians", Double::class.java, latExpression))
                            )
                        )
                    )
                )

                predicates.add(cb.le(haversine, radius))
            }

            cb.and(*predicates.toTypedArray())
        }

        return propertyRepository.findAll(spec)
    }

    fun findAllAreas(): List<String> =
        propertyRepository
            .findAll()
            .mapNotNull { it.neighborhood }
            .sorted ()
            .toSet()
            .toList()
}