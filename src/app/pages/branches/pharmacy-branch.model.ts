export interface GetPharmacyBranchResponseDTO {
  branchId: string;
  pharmacyId: string;
  branchName: string;
  governorate: string;
  city: string;
  phoneNumber: string;
  supportsDelivery: boolean;
  supportsPickup: boolean;
}

export interface PaginatedList<T> {
  items: T[];
  pageNumber: number;
  totalCount: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}

export interface PharmacyBranchResponseDTO {
  branchId: string;
  pharmacyId: string;
  branchName: string;
  city: string;
  governorate: string;
  addressLine: string;
  phoneNumber: string;
  workingHours: string;
  latitude: number | null;
  longitude: number | null;
  serviceRadiusKm: number;
  supportsDelivery: boolean;
  supportsPickup: boolean;
}

export interface CreatePharmacyBranchDTO {
  branchName: string;
  city: string;
  governorate: string;
  addressLine: string;
  phoneNumber: string;
  workingHours: string;
  latitude: number | null;
  longitude: number | null;
  serviceRadiusKm: number;
  supportsDelivery: boolean;
  supportsPickup: boolean;
}

export interface UpdatePharmacyBranchDTO {
  branchName: string;
  city: string;
  governorate: string;
  addressLine: string;
  phoneNumber: string;
  workingHours: string;
  latitude: number | null;
  longitude: number | null;
  serviceRadiusKm: number;
  supportsDelivery: boolean;
  supportsPickup: boolean;
}

export interface PharmacyBranchSearchDTO {
  branchId: string;
  pharmacyId: string;
  branchName: string;
  addressLine: string;
}

export interface GetPharmacyBranchParamRequest {
  search: string | null;
  pageNumber: number;
  pageSize: number;
}
