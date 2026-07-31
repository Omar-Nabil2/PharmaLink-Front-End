export interface NearbyPharmacyDto {
  branchId: string;
  branchName: string;
  pharmacyName: string;
  logoUrl: string | null;
  addressLine: string;
  city: string;
  governorate: string;
  phoneNumber: string;
  distanceKm: number;
  workingHours: string;
  isOpen: boolean;
  supportsDelivery: boolean;
  supportsPickup: boolean;
  latitude: number | null;
  longitude: number | null;
  serviceRadiusKm: number;
}

export interface NearbyPharmaciesRequest {
  latitude: number;
  longitude: number;
  radiusKm?: number;
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  isOpen?: boolean;
}

export interface NearbyPharmaciesResponse {
  items: NearbyPharmacyDto[];
  pageNumber: number;
  totalCount: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
