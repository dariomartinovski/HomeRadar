import {PlanType} from '../enums/plan-type.enum';

export interface Subscription {
  id: number;
  userId: number;
  planType: PlanType;
  status: string;
  startDate: string;
  endDate?: string;
}
