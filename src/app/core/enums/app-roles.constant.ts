export const AppRoles = {
  Patient: 'Patient',
  Pharmacist: 'Pharmacist',
  Admin: 'Admin',
  PharmacyAdmin: 'PharmacyAdmin',
} as const;

export type AppRole = (typeof AppRoles)[keyof typeof AppRoles];

export interface UserAuthData {
  accessToken: string;
  userId: string;
  fullName: string;
  email: string;
  roleName: AppRole;
  refreshToken?: string;
}
