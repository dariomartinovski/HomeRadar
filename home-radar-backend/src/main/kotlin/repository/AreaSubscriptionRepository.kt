package com.home_radar.repository

import com.home_radar.domain.AreaSubscription
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface AreaSubscriptionRepository : JpaRepository<AreaSubscription, Long> {

    @Query(
        """
        SELECT s FROM AreaSubscription s
        WHERE (6371000 * acos(
          cos(radians(:lat)) * cos(radians(s.latitude)) *
          cos(radians(s.longitude) - radians(:lon)) +
          sin(radians(:lat)) * sin(radians(s.latitude))
        )) <= s.radiusMeters
        """
    )
    fun findAllSubscriptionsCovering(
        @Param("lat") lat: Double,
        @Param("lon") lon: Double
    ): List<AreaSubscription>

    fun findByUserId(userId: Long): List<AreaSubscription>
}