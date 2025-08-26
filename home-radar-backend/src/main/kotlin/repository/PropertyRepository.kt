package com.home_radar.repository

import com.home_radar.domain.Property
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface PropertyRepository : JpaRepository<Property, Long> {
    fun findAllByTitleContainingIgnoreCase(name: String): List<Property>
    fun findAllByTitleContainingIgnoreCaseAndNeighborhoodContainingIgnoreCase(title: String, neighborsIgnoreCase: String): List<Property>
    fun findAllByNeighborhoodContainingIgnoreCase(neighborhoodIgnoreCase: String): List<Property>
}
