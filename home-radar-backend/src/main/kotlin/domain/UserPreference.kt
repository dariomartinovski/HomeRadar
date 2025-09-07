package com.home_radar.domain

import com.home_radar.domain.enum.PerkType
import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes

@Entity
@Table(name = "user_preferences")
data class UserPreference (
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    val radius: Double = 500.0,

    @Column(name = "perkPreferences", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    val perkPreferences: Map<String, Double> = emptyMap()
) {
    fun getPerkWeight(perkType: PerkType): Double? {
        return perkPreferences[perkType.name]
    }
}