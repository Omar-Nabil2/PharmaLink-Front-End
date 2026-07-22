export enum VerificationStatus {
  Pending = 1,
  Verified = 2,
  Rejected = 3,
}

export interface PharmacyItem {
  pharmacyId: string;
  ownerUserId: string;
  legalName: string;
  licenseNumber: string;
  logoUrl?: string;
  verificationStatus: VerificationStatus | 'Verified' | 'Pending' | 'Rejected' | 'Suspended' | number | string;
}

export interface PagedPharmacyResponse {
  items: PharmacyItem[];
  pageNumber: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
