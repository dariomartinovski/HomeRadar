package com.home_radar.service

import com.home_radar.domain.Perk
import org.springframework.stereotype.Service
import com.home_radar.repository.PerkRepository
import com.home_radar.web.extensions.toResponse
import com.home_radar.web.response.PerkResponse

@Service
class PerkService(
    private val perkRepository: PerkRepository
) {
    fun findAllPerks(): List<PerkResponse> = perkRepository.findAll().map { it.toResponse() }

    fun findPerkById(id: Long): PerkResponse? = perkRepository.findById(id)
    .orElseThrow {
        NoSuchElementException("Cannot find perk with id: [$id]")
    }.toResponse()
}