package com.home_radar.domain.dto

import com.home_radar.domain.enum.PreferenceType

data class UserPropertyPreferenceSimpleDto (
    val id: Long,
    val propertyId: Long,
    val preferenceType: PreferenceType
)