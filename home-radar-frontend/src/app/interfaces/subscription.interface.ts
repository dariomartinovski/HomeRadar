export interface CreateSubscriptionRequest {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  type: SubscriptionType;
}

export interface SubscriptionResponse {
  id: number;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  type: SubscriptionType;
}

export enum SubscriptionType {
  INSTANT = 'INSTANT',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY'
}
