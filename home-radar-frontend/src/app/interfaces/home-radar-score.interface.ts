import { PerkType } from "../enums/perk-type.enum";

export interface HomeRadarScore {
  rentScore: number;
  saleScore: number;
  averageRentPrice?: number;
  averageSalePrice?: number;
  averageRentSize?: number;
  averageSaleSize?: number;
  perkCounts?: PerkCount[];
}