package com.home_radar.repository

import com.home_radar.domain.PerkType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface PerkTypeRepository : JpaRepository<PerkType, Long> {
    fun findByName(name: String): PerkType?
    fun existsByName(name: String): Boolean
}