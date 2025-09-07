package com.home_radar.repository

import com.home_radar.domain.Perk
import com.home_radar.domain.enum.PerkType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface PerkRepository: JpaRepository<Perk, Long> {
    fun findAllByTypeIn(categories: List<PerkType>): List<Perk>
    @Query(
        """
            SELECT pk FROM Perk pk
            WHERE (6371000 * acos(
              cos(radians(:lat)) * cos(radians(pk.latitude)) *
              cos(radians(pk.longitude) - radians(:lon)) +
              sin(radians(:lat)) * sin(radians(pk.latitude))
            )) <= :radius
        """
    )
    fun findWithinRadius(
        @Param("lat") lat: Double,
        @Param("lon") lon: Double,
        @Param("radius") radius: Double
    ): List<Perk>

}