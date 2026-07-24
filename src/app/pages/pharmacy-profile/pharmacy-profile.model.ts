export interface PharmacyProfileResponseDto {
  pharmacyId?: string;
  pharmacyName: string;
  logoUrl: string | null;
  licenseNumber: string;
  verificationStatus?: string;
}

export interface UpdatePharmacyProfileDto {
  PharmacyName: string;
  LogoFile: File | null;
}
