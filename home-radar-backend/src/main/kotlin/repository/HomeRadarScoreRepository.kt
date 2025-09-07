package com.home_radar.repository

import com.home_radar.domain.HomeRadarScore
import com.home_radar.domain.enum.PropertyCategory
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface HomeRadarScoreRepository : JpaRepository<HomeRadarScore, Int> {
    fun findByPropertyCategory(category: PropertyCategory): List<HomeRadarScore>
    fun findTopByPropertyCategoryOrderByRawScoreDesc(propertyCategory: PropertyCategory): HomeRadarScore?
}