import { PerkType } from "../enums/perk-type.enum";

export interface Perk {
  id?: number;
  title: string;
  type: PerkType;
  latitude: number;
  longitude: number;
  openingHours?: string;
}
