package com.home_radar.web.response

import com.home_radar.domain.enum.PerkType

data class PerkCountResponse (
    val perkType: PerkType,
    val count: Int
)