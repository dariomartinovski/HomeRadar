package com.home_radar.service

import com.home_radar.domain.Perk
import com.home_radar.domain.PerkType
import org.springframework.stereotype.Service
import com.home_radar.repository.PerkRepository
import com.home_radar.repository.PerkTypeRepository
import com.home_radar.web.extensions.toResponse
import com.home_radar.web.request.CreatePerkRequest
import com.home_radar.web.response.PerkResponse
import jakarta.transaction.Transactional

@Service
class PerkService(
    private val perkRepository: PerkRepository,
    private val perkTypeRepository: PerkTypeRepository
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

    @Transactional
    fun createPerk(request: CreatePerkRequest): PerkResponse {
        val perkType = perkTypeRepository.findById(request.perkTypeId)
            .orElseThrow { IllegalArgumentException("PerkType not found with id: ${request.perkTypeId}") }

        val perk = Perk(
            title = request.title,
            perkType = perkType,
            latitude = request.latitude,
            longitude = request.longitude,
            openingHours = request.openingHours
        )

        val savedPerk = perkRepository.save(perk)
        return savedPerk.toResponse()
    }

    @Transactional
    fun deletePerk(id: Long) {
        if (!perkRepository.existsById(id)) {
            throw IllegalArgumentException("Perk not found with id: $id")
        }
        perkRepository.deleteById(id)
    }
}