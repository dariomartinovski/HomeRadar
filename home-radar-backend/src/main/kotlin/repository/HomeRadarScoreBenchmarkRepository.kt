package com.home_radar.repository

import com.home_radar.domain.HomeRadarScoreBenchmark
import com.home_radar.domain.enum.PropertyCategory
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface HomeRadarScoreBenchmarkRepository : JpaRepository<HomeRadarScoreBenchmark, Long> {
    fun findTopByPropertyCategoryOrderByRawScoreDesc(propertyCategory: PropertyCategory): HomeRadarScoreBenchmark?
}