export interface User {
  id: number,
  email: string,
  firstName: string,
  lastName: string,
  phoneNumber: string,
  role: string,
  ownedProperties: number[]
}
