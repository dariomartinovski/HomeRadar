package com.home_radar.service

import com.home_radar.domain.HomeRadarScoreBenchmark
import com.home_radar.domain.enum.PropertyCategory
import com.home_radar.repository.HomeRadarScoreBenchmarkRepository
import org.springframework.stereotype.Service

@Service
class HomeRadarScoreBenchmarkService(
    private val benchmarkRepository: HomeRadarScoreBenchmarkRepository
) {

    fun saveBenchmark(benchmark: HomeRadarScoreBenchmark): HomeRadarScoreBenchmark {
        return benchmarkRepository.save(benchmark)
    }

    fun getTopBenchmark(propertyCategory: PropertyCategory): HomeRadarScoreBenchmark? {
        return benchmarkRepository.findTopByPropertyCategoryOrderByRawScoreDesc(propertyCategory)
    }
}