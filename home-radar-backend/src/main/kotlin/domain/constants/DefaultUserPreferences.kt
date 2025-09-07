package com.home_radar.domain.constants

import com.home_radar.domain.enum.PerkType

val DEFAULT_PROPERTIES_PRICES_WEIGHT = 1.0
val DEFAULT_PERKS_WEIGHT = 0.6

val DEFAULT_RADIUS = 500.0

val DEFAULT_PERK_TYPES_WEIGHT: Map<String, Double> = mapOf(
    PerkType.GYM.name to 0.6,
    PerkType.MIDDLE_SCHOOL.name to 0.9,
    PerkType.PRE_SCHOOL.name to 0.8,
    PerkType.HIGH_SCHOOL.name to 0.9,
    PerkType.KINDERGARDEN.name to 0.8,
    PerkType.FACULTY.name to 0.7,
    PerkType.GROCERY_STORE.name to 1.0,
    PerkType.RESTAURANT.name to 0.6,
    PerkType.COFFEE_SHOP.name to 0.5,
    PerkType.PARK.name to 0.7,
    PerkType.BAR.name to 0.4
)