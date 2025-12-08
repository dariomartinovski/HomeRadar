import {PerkType} from './perk-type.interface';

export interface Perk {
  id?: number;
  title: string;
  perkType: PerkType;
  latitude: number;
  longitude: number;
  openingHours?: string;
}
