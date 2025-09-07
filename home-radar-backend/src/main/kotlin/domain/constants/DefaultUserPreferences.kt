package com.home_radar.domain.constants

import com.home_radar.domain.enum.PerkType

val DEFAULT_PROPERTIES_PRICES_WEIGHT = 1.0
val DEFAULT_PERKS_WEIGHT = 0.6

val DEFAULT_RADIUS = 500.0

val DEFAULT_PERK_TYPES_WEIGHT: Map<PerkType, Double> = mapOf(
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