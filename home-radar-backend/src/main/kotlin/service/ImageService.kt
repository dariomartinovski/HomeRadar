package com.home_radar.service

import com.home_radar.domain.Property
import com.home_radar.repository.ImageRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service

@Service
class ImageService(
    private val imageRepository: ImageRepository,
    private val propertyService: PropertyService
) {
    fun findImageById(id: Long): ByteArray? =
        imageRepository.findByIdOrNull(id)?.image

    fun getImage(id: Long, imageId: Long): ByteArray? {
        val property: Property = propertyService.findById(id)
        return imageRepository.findByIdOrNull(property.internalImageId)?.image
    }
}