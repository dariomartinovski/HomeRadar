import { PerkWeight } from "./perk-weight.interface";

export interface UserPreferences {
  radius: number;
  weightsBalance: number;
  perkPreferences: PerkWeight[];
}