import {UserPropertyPreference} from './user-property-preference.interface';

export interface User {
  id: number,
  email: string,
  firstName: string,
  lastName: string,
  phoneNumber: string,
  role: string,
  ownedProperties: number[],
  propertyPreferences: UserPropertyPreference[]
}
