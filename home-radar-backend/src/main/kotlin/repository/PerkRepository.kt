package com.home_radar.repository

import com.home_radar.domain.Perk
import com.home_radar.domain.enum.PerkType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface PerkRepository: JpaRepository<Perk, Long> {
    fun findAllByTypeIn(categories: List<PerkType>): List<Perk>
}