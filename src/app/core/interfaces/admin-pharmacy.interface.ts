// ─── Enums ──────────────────────────────────────────────────────────────────

export enum VerificationStatus {
  Pending = 1,
  Verified = 2,
  Rejected = 3,
  Deleted = 4,
}

// ─── Pharmacy Interfaces ────────────────────────────────────────────────────

/** Embedded owner info returned inside pharmacy DTOs */
export interface PharmacyOwnerEmbeddedDto {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
}

/** A single branch row returned in pharmacy list / detail */
export interface AdminPharmacyBranchDto {
  branchId: string;
  branchName: string;
  city: string;
  governorate: string;
  phoneNumber: string;
  workingHours: string;
  latitude: number;
  longitude: number;
  serviceRadiusKm: number;
  supportsDelivery: boolean;
  supportsPickup: boolean;
}

/** Summary row from GET /admin/pharmacies (paginated list) */
export interface AdminPharmacySummaryDto {
  pharmacyId: string;
  legalName: string;
  licenseNumber: string;
  logoUrl: string;
  verificationStatus: VerificationStatus;
  branchesCount: number;
  drugsCount: number;
  owner: PharmacyOwnerEmbeddedDto | null;
  branches: AdminPharmacyBranchDto[];
}

/** Detail from GET /admin/pharmacies/:id */
export interface AdminPharmacyDetailDto {
  pharmacyId: string;
  legalName: string;
  licenseNumber: string;
  logoUrl: string;
  verificationStatus: VerificationStatus;
  branchesCount: number;
  drugsCount: number;
  owner: PharmacyOwnerEmbeddedDto | null;
  branches: AdminPharmacyBranchDto[];
}

/** Query params for GET /admin/pharmacies */
export interface GetAdminPharmaciesQuery {
  search?: string;
  status?: VerificationStatus | null;
  city?: string;
  pageNumber?: number;
  pageSize?: number;
}

/** Paginated response wrapper */
export interface PaginatedList<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/** POST /admin/pharmacies — create pharmacy (multipart/form-data) */
export interface AdminCreatePharmacyRequest {
  legalName: string;
  licenseNumber: string;
  logoUrl?: string;
  logoFile?: File | null;
  verificationStatus?: VerificationStatus;
}

/** PUT /admin/pharmacies/:id — update pharmacy (multipart/form-data) */
export interface AdminUpdatePharmacyRequest {
  legalName: string;
  licenseNumber: string;
  logoUrl?: string;
  logoFile?: File | null;
  verificationStatus: VerificationStatus;
}

export enum UserStatus {
  Active = 1,
  Inactive = 2,
  Suspended = 3,
}

// ─── Pharmacy Owner Interfaces ───────────────────────────────────────────────

/** Nested pharmacy info inside owner response */
export interface PharmacyOwnerDetailsDto {
  pharmacyId: string;
  legalName: string;
  licenseNumber: string;
  logoUrl: string;
}

/** Single pharmacy owner row from GET /pharmacy-owners */
export interface PharmacyOwnerResponseDto {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  status: UserStatus | string;
  createdAt: string;
  pharmacyId: string | null;
  isSuperAdmin: boolean | null;
  pharmacy: PharmacyOwnerDetailsDto | null;
}

/** Query params for GET /pharmacy-owners */
export interface GetPharmacyOwnersQuery {
  search?: string;
  status?: UserStatus | null;
  pharmacyId?: string;
  pageNumber?: number;
  pageSize?: number;
}

/** POST /pharmacy-owners — create owner */
export interface CreatePharmacyOwnerRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  pharmacyId: string;
}

/** PUT /pharmacy-owners/:id — update owner */
export interface UpdatePharmacyOwnerRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  pharmacyId?: string | null;
  status: UserStatus;
  password?: string | null;
}
