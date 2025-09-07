import { PerkType } from "../enums/perk-type.enum";
import { PerkWeight } from "../interfaces/perk-weight.interface";
import { UserPreferences } from "../interfaces/user-preferences.interface";

export const defaultUserPreferences = {
    radius: 500,
    perkPreferences: [
        { perkType: PerkType.GYM, weight: 0.6 },
        { perkType: PerkType.MIDDLE_SCHOOL, weight: 0.9 },
        { perkType: PerkType.PRE_SCHOOL, weight: 0.8 },
        { perkType: PerkType.HIGH_SCHOOL, weight: 0.9 },
        { perkType: PerkType.KINDERGARDEN, weight: 0.8 },
        { perkType: PerkType.FACULTY, weight: 0.7 },
        { perkType: PerkType.GROCERY_STORE, weight: 1.0 },
        { perkType: PerkType.RESTAURANT, weight: 0.6 },
        { perkType: PerkType.COFFEE_SHOP, weight: 0.5 },
        { perkType: PerkType.PARK, weight: 0.7 },
        { perkType: PerkType.BAR, weight: 0.4 },
    ]
} as UserPreferences;