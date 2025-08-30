package com.home_radar.service

import com.home_radar.domain.Property
import com.home_radar.domain.enum.PerkType
import com.home_radar.domain.enum.PropertyCategory
import com.home_radar.repository.PerkRepository
import com.home_radar.repository.PropertyRepository
import com.home_radar.web.response.LocationScoreResponse
import org.springframework.stereotype.Service

@Service
class LocationScoreService(
    private val propertyRepository: PropertyRepository,
    private val perkRepository: PerkRepository
) {
    companion object {
        const val PRICE_WEIGHT = 1.0
        const val PERK_WEIGHT = 0.6
    }

    val defaultPerkWeights: Map<PerkType, Double> = mapOf(
        PerkType.GYM to 0.6,
        PerkType.MIDDLE_SCHOOL to 0.9,
        PerkType.PRE_SCHOOL to 0.8,
        PerkType.HIGH_SCHOOL to 0.9,
        PerkType.KINDERGARDEN to 0.8,
        PerkType.FACULTY to 0.7,
        PerkType.GROCERY_STORE to 1.0,
        PerkType.RESTAURANT to 0.6,
        PerkType.COFFEE_SHOP to 0.5,
        PerkType.PARK to 0.7,
        PerkType.BAR to 0.4
    )

    fun calculateCircleScore(latitude: Double, longitude: Double, radius: Double): LocationScoreResponse {
        val properties = propertyRepository.findWithinRadius(latitude, longitude, radius)
        if (properties.isEmpty()) return LocationScoreResponse(0.0, 0.0)

        val forRent = properties.filter { it.category == PropertyCategory.FOR_RENT }
        val forSale = properties.filter { it.category == PropertyCategory.FOR_SALE }
        val perks = perkRepository.findWithinRadius(latitude, longitude, radius)

        //TODO
        // 1. Group the perks by type
        // 2. Get the base weight for that type, has to be .first() because its a list
        // 3. Sum the total heuristic distance where distance over the radius does not matter
        // 4. Apply sqrt to reduce impact of very high counts of perks of certain type
        val perkScore = perks.groupBy { it.type }.values.sumOf { perksOfType ->
            val baseWeight = defaultPerkWeights[perksOfType.first().type] ?: 0.5
            val totalDistWeight = perksOfType.sumOf { perk -> distanceWeight(
                haversineDistance(latitude, longitude, perk.latitude, perk.longitude), radius
            )}
            baseWeight * kotlin.math.sqrt(totalDistWeight)
        }

        // beta = 0.4, maximum density boost is 40%
        return LocationScoreResponse(
            rentScore = calculateBoostedPriceScore(forRent, beta = 0.4) + PERK_WEIGHT * perkScore,
            saleScore = calculateBoostedPriceScore(forSale, beta = 0.4) + PERK_WEIGHT * perkScore
        )
    }

    // TODO
    //  1. Gets the average, min, max prices
    //  2. Normalizes the prices
    //  3. Calculates PRICE_WEIGHT * normalized price and multiplies by the densityBoost
    //  4. Density boost uses ln to boost the score, based on how many properties are there,
    //  with max of 40% boost
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

        return PRICE_WEIGHT * normalized * densityBoostLog(properties.size, nMax, beta)
    }

    // TODO
    //  Logarithmic boost (beta controls max extra)
    //  beta is the maximum relative boost (e.g. beta = 0.4 → at most +40%).
    //  nMax is used to normalize the log so the boost doesn’t exceed 1 + beta.

    //  The log boost gives a gentle, capped density effect and is easy to reason about.
    //  Below I give you the exact Kotlin function, how to plug it into calculateCategoryScore,
    //  recommended defaults, and a small example table so you can see the boost for different
    //  property counts.
    // TODO
    //  Ex. factor ∈ (0, 1], since ln(1+n) ≤ ln(1+nMax).
    //  When n=0 -> returns 1.0 boost (no boost)
    //  When n=nMax -> factor 1 -> boost = 1.0+beta (max boost, for example 35%)
    private fun densityBoostLog(n: Int, nMax: Int = 120, beta: Double = 0.35): Double {
        if (n <= 0) return 1.0
        // ln(1+n) / ln(1+nMax) -> in (0,1], so boost ∈ [1, 1 + beta]
        val factor = kotlin.math.ln(1.0 + n) / kotlin.math.ln(1.0 + nMax)
        return 1.0 + beta * factor
    }

    // Disregards those that are further away than specified meters
    fun distanceWeight(distanceMeters: Double, maxDistanceMeters: Double = 2000.0): Double {
        return (1 - distanceMeters / maxDistanceMeters).coerceAtLeast(0.0)
    }

    // Takes into consideration the curvature of the Earth, unlike Euclidean distance
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
