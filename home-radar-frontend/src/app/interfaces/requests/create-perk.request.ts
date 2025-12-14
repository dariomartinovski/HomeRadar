export interface CreatePerkRequest {
  title: string;
  perkTypeId: number;
  latitude: number;
  longitude: number;
  openingHours?: string;
}
