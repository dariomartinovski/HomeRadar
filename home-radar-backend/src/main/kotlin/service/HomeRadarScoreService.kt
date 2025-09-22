package com.home_radar.service

import com.home_radar.domain.HomeRadarScore
import com.home_radar.domain.enum.PropertyCategory
import com.home_radar.repository.HomeRadarScoreRepository
import org.springframework.stereotype.Service

@Service
class HomeRadarScoreService(
    private val homeRadarScoreRepository: HomeRadarScoreRepository
) {

    fun saveScore(score: HomeRadarScore): HomeRadarScore {
        return homeRadarScoreRepository.save(score)
    }

    fun getScoresByCategory(category: PropertyCategory): List<HomeRadarScore> {
        return homeRadarScoreRepository.findByPropertyCategory(category)
    }

    fun getScoresByCategoryAndRadius(category: PropertyCategory, radius: Double, propertyCountLower: Int, propertyCountUpper: Int): List<HomeRadarScore> =
        homeRadarScoreRepository.findByPropertyCategoryAndRadiusAndPropertyCountBetween(category, radius, propertyCountLower, propertyCountUpper)

    fun getTopScore(propertyCategory: PropertyCategory): HomeRadarScore? {
        return homeRadarScoreRepository.findTopByPropertyCategoryOrderByRawScoreDesc(propertyCategory)
    }
}