package com.home_radar.service

import com.home_radar.domain.PerkType
import org.springframework.stereotype.Service
import com.home_radar.repository.PerkRepository
import com.home_radar.web.extensions.toResponse
import com.home_radar.web.response.PerkResponse

@Service
class PerkService(
    private val perkRepository: PerkRepository
) {
    fun findAllPerks(): List<PerkResponse> = perkRepository.findAll().map { it.toResponse() }

    fun findAllPerksFiltered(categories: List<String>?): List<PerkResponse> {
        if(!categories.isNullOrEmpty()) {
            return perkRepository.findAllByPerkType_NameIn(categories).map { it.toResponse() }
        }
        return findAllPerks()
    }

    fun findPerkById(id: Long): PerkResponse? = perkRepository.findById(id)
    .orElseThrow {
        NoSuchElementException("Cannot find perk with id: [$id]")
    }.toResponse()

    fun findAllCategories(): List<PerkType> = perkRepository.findAll()
        .map { it.perkType }
        .toSet()
        .toList()
}
//package com.home_radar.service
//
//import com.home_radar.domain.Perk
//import com.home_radar.dto.CreatePerkRequest
//import com.home_radar.dto.PerkDto
//import com.home_radar.repository.PerkRepository
//import com.home_radar.repository.PerkTypeRepository
//import org.springframework.stereotype.Service
//import org.springframework.transaction.annotation.Transactional
//
//@Service
//class PerkService(
//    private val perkRepository: PerkRepository,
//    private val perkTypeRepository: PerkTypeRepository
//) {
//
//    @Transactional(readOnly = true)
//    fun getAllPerks(): List<PerkDto> {
//        return perkRepository.findAll().map { it.toDto() }
//    }
//
//    @Transactional(readOnly = true)
//    fun getPerkById(id: Long): PerkDto {
//        val perk = perkRepository.findById(id)
//            .orElseThrow { IllegalArgumentException("Perk not found with id: $id") }
//        return perk.toDto()
//    }
//
//    @Transactional
//    fun createPerk(request: CreatePerkRequest): PerkDto {
//        val perkType = perkTypeRepository.findById(request.perkTypeId)
//            .orElseThrow { IllegalArgumentException("PerkType not found with id: ${request.perkTypeId}") }
//
//        val perk = Perk(
//            title = request.title,
//            perkType = perkType,
//            latitude = request.latitude,
//            longitude = request.longitude,
//            openingHours = request.openingHours
//        )
//
//        val savedPerk = perkRepository.save(perk)
//        return savedPerk.toDto()
//    }
//
//    @Transactional
//    fun deletePerk(id: Long) {
//        if (!perkRepository.existsById(id)) {
//            throw IllegalArgumentException("Perk not found with id: $id")
//        }
//        perkRepository.deleteById(id)
//    }
//
//    private fun Perk.toDto() = PerkDto(
//        id = this.id,
//        title = this.title,
//        perkTypeId = this.perkType.id!!,
//        perkTypeName = this.perkType.name,
//        latitude = this.latitude,
//        longitude = this.longitude,
//        openingHours = this.openingHours
//    )
//}