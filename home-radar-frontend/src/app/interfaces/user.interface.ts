import {UserPropertyPreference} from './user-property-preference.interface';
import {Subscription} from './subscription.interface';

export interface User {
  id: number,
  email: string,
  firstName: string,
  lastName: string,
  phoneNumber: string,
  role: string,
  ownedProperties: number[],
  subscription: Subscription,
  propertyPreferences: UserPropertyPreference[]
}
