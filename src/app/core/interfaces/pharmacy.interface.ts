export interface PharmacyItem {
  pharmacyId: string;
  ownerUserId: string;
  legalName: string;
  licenseNumber: string;
  logoUrl?: string;
  verificationStatus: 'Verified' | 'Pending' | 'Suspended' | string;
}

export interface PagedPharmacyResponse {
  items: PharmacyItem[];
  pageNumber: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
