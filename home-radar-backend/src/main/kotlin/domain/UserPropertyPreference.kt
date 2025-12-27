package com.home_radar.domain

import com.home_radar.domain.dto.UserPropertyPreferenceSimpleDto
import com.home_radar.domain.enum.PreferenceType
import jakarta.persistence.*

@Entity
@Table(
    name = "user_property_preferences",
    uniqueConstraints = [
        UniqueConstraint(columnNames = ["user_id", "property_id"])
    ]
)
class UserPropertyPreference (
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,

    @ManyToOne
    @JoinColumn(name = "property_id", nullable = false)
    val property: Property,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var preferenceType: PreferenceType
) {
    fun toSimpleDto(): UserPropertyPreferenceSimpleDto {
        return UserPropertyPreferenceSimpleDto(
            id = this.id,
            propertyId = this.property.id,
            preferenceType = this.preferenceType
        )
    }
}