package com.home_radar.service

import com.home_radar.domain.HomeRadarScore
import com.home_radar.domain.Property
import com.home_radar.domain.UserPreference
import com.home_radar.domain.constants.DEFAULT_PERK_TYPES_WEIGHT
import com.home_radar.domain.constants.DEFAULT_PROPERTIES_PRICES_WEIGHT
import com.home_radar.domain.constants.DEFAULT_RADIUS
import com.home_radar.domain.enum.PropertyCategory
import com.home_radar.repository.PerkRepository
import com.home_radar.repository.PropertyRepository
import com.home_radar.web.response.LocationScoreResponse
import com.home_radar.web.response.PerkCountResponse
import org.springframework.stereotype.Service

@Service
class LocationScoreManagingService(
    private val propertyRepository: PropertyRepository,
    private val perkRepository: PerkRepository,
    private val homeRadarScoreService: HomeRadarScoreService,
    private val userPreferenceService: UserPreferenceService
) {
    /**
        This is done because the scores would never reach 10, they went to most of 5.2 score
        Now we persist the raw scores in a table, and we calculate the 97.5th percentage each time
        (the top 5%) and count that as a 10, so there are no skews for outliers.
        Then we use the top 5% in order to scale the current raw score to a factored score
    */
    fun calculateAndPersistScore(lat: Double, lng: Double, percentile: Double = 0.975): LocationScoreResponse {
        val userPreference = userPreferenceService.getUserPreference(1)

        // Calculate raw scores
        val rawScores: LocationScoreResponse = this.calculateCircleScore(lat, lng, userPreference)

        // Persist raw scores for both categories
        val rentScoreEntry = HomeRadarScore(
            lat = lat,
            lng = lng,
            radius = userPreference?.radius ?: DEFAULT_RADIUS,
            rawScore = rawScores.rentScore,
            propertyCategory = PropertyCategory.FOR_RENT
        )
        homeRadarScoreService.saveScore(rentScoreEntry)

        val saleScoreEntry = HomeRadarScore(
            lat = lat,
            lng = lng,
            radius = userPreference?.radius ?: DEFAULT_RADIUS,
            rawScore = rawScores.saleScore,
            propertyCategory = PropertyCategory.FOR_SALE
        )
        homeRadarScoreService.saveScore(saleScoreEntry)

        // Fetch all raw scores for scaling
        val allRentScores = homeRadarScoreService.getScoresByCategory(PropertyCategory.FOR_RENT)
            .map { it.rawScore }
        val allSaleScores = homeRadarScoreService.getScoresByCategory(PropertyCategory.FOR_SALE)
            .map { it.rawScore }

        // Compute percentile-based max for scaling
        val rentBenchmark = calculatePercentile(allRentScores, percentile)
        val saleBenchmark = calculatePercentile(allSaleScores, percentile)

        // Scale scores to 0–10 based on percentile benchmark
        val rentScaleFactor = rentBenchmark.takeIf { it > 0 }?.let { 10.0 / it } ?: 1.0
        val saleScaleFactor = saleBenchmark.takeIf { it > 0 }?.let { 10.0 / it } ?: 1.0

        return rawScores.copy(
            rentScore = (rawScores.rentScore * rentScaleFactor).coerceAtMost(10.0),
            saleScore = (rawScores.saleScore * saleScaleFactor).coerceAtMost(10.0),
        )
    }

    // Helper function to compute percentile
    private fun calculatePercentile(values: List<Double>, percentile: Double): Double {
        if (values.isEmpty()) return 0.0
        val sorted = values.sorted()
        val index = ((sorted.size - 1) * percentile).toInt()
        return sorted[index]
    }

    fun calculateCircleScore(latitude: Double, longitude: Double, userPreferences: UserPreference?): LocationScoreResponse {
        val radius = userPreferences?.radius ?: DEFAULT_RADIUS
        val weightsBalance = userPreferences?.weightsBalance ?: DEFAULT_PROPERTIES_PRICES_WEIGHT

        val properties = propertyRepository.findWithinRadius(latitude, longitude, radius)
        if (properties.isEmpty() && weightsBalance > 0) return LocationScoreResponse(0.0, 0.0, 0.0, 0.0, emptyList())

        val forRent = properties.filter { it.category == PropertyCategory.FOR_RENT }
        val forSale = properties.filter { it.category == PropertyCategory.FOR_SALE }
        val perks = perkRepository.findWithinRadius(latitude, longitude, radius)

        /**
            1. Group the perks by type
            2. Get the base weight for that type, has to be .first() because its a list
            3. Sum the total heuristic distance where distance over the radius does not matter
            4. Apply sqrt to reduce impact of very high counts of perks of certain type
        */
        val perkScore = perks.groupBy { it.type }.values.sumOf { perksOfType ->
            val baseWeight = userPreferences?.getPerkWeight(perksOfType.first().type)
                ?: DEFAULT_PERK_TYPES_WEIGHT[perksOfType.first().type.name] ?: 0.5
            val totalDistWeight = perksOfType.sumOf { perk -> distanceWeight(
                haversineDistance(latitude, longitude, perk.latitude, perk.longitude), radius
            )}
            baseWeight * kotlin.math.sqrt(totalDistWeight)
        }

        // Calculate average prices
        val avgRentPrice = if (forRent.isNotEmpty()) forRent.map { it.price }.average() else 0.0
        val avgSalePrice = if (forSale.isNotEmpty()) forSale.map { it.price }.average() else 0.0

        // Count perks
        val perkCounts: List<PerkCountResponse> = perks.groupingBy { it.type }.eachCount()
            .map { PerkCountResponse(it.key, it.value) }

        // beta = 0.4, maximum density boost is 40%
        return LocationScoreResponse(
            rentScore = weightsBalance * calculateBoostedPriceScore(forRent, beta = 0.4) + (1 - weightsBalance) * perkScore,
            saleScore = weightsBalance * calculateBoostedPriceScore(forSale, beta = 0.4) + (1 - weightsBalance) * perkScore,
            averageRentPrice = avgRentPrice,
            averageSalePrice = avgSalePrice,
            perkCounts = perkCounts
        )
    }

    /**
          1. Gets the average, min, max prices
          2. Normalizes the prices
          3. Calculates PRICE_WEIGHT * normalized price and multiplies by the densityBoost
          4. Density boost uses ln to boost the score, based on how many properties are there,
          with max of 40% boost
    */
    private fun calculateBoostedPriceScore(
        properties: List<Property>,
        nMax: Int = 120,
        beta: Double = 0.35
    ): Double {
        if (properties.isEmpty()) return 0.0

        val prices = properties.map { it.price }
        val avg = prices.average()
        val min = prices.minOf { it }
        val max = prices.maxOf { it }

        val normalized = if (max > min) (avg - min) / (max - min) else 1.0

        return normalized * densityBoostLog(properties.size, nMax, beta)
    }

    /**
          Logarithmic boost (beta controls max extra)
          beta is the maximum relative boost (e.g. beta = 0.4 → at most +40%).
          nMax is used to normalize the log so the boost doesn’t exceed 1 + beta.

          The log boost gives a gentle, capped density effect and is easy to reason about.
          Below I give you the exact Kotlin function, how to plug it into calculateCategoryScore,
          recommended defaults, and a small example table so you can see the boost for different
          property counts.

          Ex. factor ∈ (0, 1], since ln(1+n) ≤ ln(1+nMax).
          When n=0 -> returns 1.0 boost (no boost)
          When n=nMax -> factor 1 -> boost = 1.0+beta (max boost, for example 40%)
    */
    private fun densityBoostLog(n: Int, nMax: Int = 120, beta: Double = 0.35): Double {
        if (n <= 0) return 1.0
        // ln(1+n) / ln(1+nMax) -> in (0,1], so boost ∈ [1, 1 + beta]
        val factor = kotlin.math.ln(1.0 + n) / kotlin.math.ln(1.0 + nMax)
        return 1.0 + beta * factor
    }

    /** Disregards those that are further away than specified meters */
    fun distanceWeight(distanceMeters: Double, maxDistanceMeters: Double = 2000.0): Double {
        return (1 - distanceMeters / maxDistanceMeters).coerceAtLeast(0.0)
    }

    /** Takes into consideration the curvature of the Earth, unlike Euclidean distance */
    fun haversineDistance(lat1: Double, lon1: Double, lat2: Double, lon2: Double): Double {
        val R = 6371000.0 // meters
        val dLat = Math.toRadians(lat2 - lat1)
        val dLon = Math.toRadians(lon2 - lon1)
        val a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2)
        val c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return R * c
    }
}
