package com.home_radar.repository

import com.home_radar.domain.Property
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface PropertyRepository : JpaRepository<Property, Long> {
    fun findAllByTitleContainingIgnoreCase(name: String): List<Property>
    fun findAllByTitleContainingIgnoreCaseAndNeighborhoodContainingIgnoreCase(title: String, neighborsIgnoreCase: String): List<Property>
    fun findAllByNeighborhoodContainingIgnoreCase(neighborhoodIgnoreCase: String): List<Property>
    @Query(
        """
        SELECT p FROM Property p
        WHERE (6371000 * acos(
          cos(radians(:lat)) * cos(radians(p.latitude)) *
          cos(radians(p.longitude) - radians(:lon)) +
          sin(radians(:lat)) * sin(radians(p.latitude))
        )) <= :radius
        """
    )
    fun findWithinRadius(
        @Param("lat") lat: Double,
        @Param("lon") lon: Double,
        @Param("radius") radius: Double
    ): List<Property>
}
