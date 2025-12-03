import {PreferenceTypeEnum} from '../enums/preference-type.enum';

export interface UserPropertyPreference {
  id?: number;
  propertyId: number;
  preferenceType: PreferenceTypeEnum;
}
