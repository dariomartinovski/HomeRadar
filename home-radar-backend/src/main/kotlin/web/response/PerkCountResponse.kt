package com.home_radar.web.response

import com.home_radar.domain.PerkType

data class PerkCountResponse (
    val perkType: PerkType,
    val count: Int
)