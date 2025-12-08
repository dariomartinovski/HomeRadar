import {PerkCount} from './perk-count.interface';

export interface HomeRadarScore {
  rentScore: number;
  saleScore: number;
  averageRentPrice?: number;
  averageSalePrice?: number;
  averageRentSize?: number;
  averageSaleSize?: number;
  perkCounts?: PerkCount[];
}
