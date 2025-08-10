package com.home_radar.repository

import com.home_radar.domain.Perk
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface PerkRepository: JpaRepository<Perk, Long>