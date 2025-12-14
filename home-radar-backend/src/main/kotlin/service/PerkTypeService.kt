package com.home_radar.service

import com.home_radar.domain.ImageEntity
import com.home_radar.domain.PerkType
import com.home_radar.repository.ImageRepository
import com.home_radar.web.request.CreatePerkTypeRequest
import com.home_radar.repository.PerkTypeRepository
import com.home_radar.web.extensions.toResponse
import com.home_radar.web.response.PerkTypeResponse
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile

@Service
class PerkTypeService(
    private val perkTypeRepository: PerkTypeRepository,
    private val imageRepository: ImageRepository
) {

    @Transactional(readOnly = true)
    fun getAllPerkTypes(): List<PerkTypeResponse> {
        return perkTypeRepository.findAll().map { it.toResponse() }
    }

    @Transactional(readOnly = true)
    fun getPerkTypeById(id: Long): PerkTypeResponse {
        val perkType = perkTypeRepository.findById(id)
            .orElseThrow { IllegalArgumentException("PerkType not found with id: $id") }
        return perkType.toResponse()
    }

    @Transactional
    fun createPerkType(request: CreatePerkTypeRequest, image: MultipartFile): PerkTypeResponse {
        if (perkTypeRepository.existsByName(request.name)) {
            throw IllegalArgumentException("PerkType with name '${request.name}' already exists")
        }

        val imageEntity = imageRepository.save(ImageEntity(image = image.bytes))

        val perkType = PerkType(
            name = request.name,
            description = request.description,
            defaultPerkTypeWeight = request.defaultPerkTypeWeight,
            iconImageId = imageEntity.id
        )

        val savedPerkType = perkTypeRepository.save(perkType)
        return savedPerkType.toResponse()
    }

    @Transactional
    fun deletePerkType(id: Long) {
        if (!perkTypeRepository.existsById(id)) {
            throw IllegalArgumentException("PerkType not found with id: $id")
        }
        perkTypeRepository.deleteById(id)
    }
}