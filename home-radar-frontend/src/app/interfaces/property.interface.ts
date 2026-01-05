import { HeatingType } from "../enums/heating-type.enum";
import { PropertyCategory } from "../enums/property-category.enum";
import { PropertyType } from "../enums/property-type.enum";

export interface Property {
  id: number;
  title: string;
  latitude: number;
  longitude: number;

  category: PropertyCategory;
  description: string;
  address: string;
  contactNumber: string;

  parking: boolean;
  wifi: boolean;
  balcony: boolean;

  squareMeters: number;
  price: number;
  pricePrediction?: number;

  heating: HeatingType;
  type: PropertyType;

  floor?: number;
  elevator?: boolean;
  numberOfRooms: number;
  externalImageUrl?: string;
  internalImageId?: number;
}
