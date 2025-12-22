export interface CreateAreaSubscriptionRequest {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  type: AreaSubscriptionType;
}

export interface AreaSubscriptionResponse {
  id: number;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  type: AreaSubscriptionType;
}

export enum AreaSubscriptionType {
  INSTANT = 'INSTANT',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY'
}
