package com.home_radar.service

import com.home_radar.domain.Perk
import org.springframework.stereotype.Service
import com.home_radar.repository.PerkRepository

@Service
class PerkService(
    private val perkRepository : PerkRepository
) {
    fun findAllPerks(): List<Perk> = perkRepository.findAll()
}