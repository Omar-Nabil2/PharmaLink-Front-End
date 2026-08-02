export enum UserStatus {
  Active = 1,
  Inactive = 2,
  Suspended = 3,
}

export interface AssignmentDTO {
  pharmacistId: string;
  pharmacyId: string;
  branchId: string;
  assignedAt: string;
  endedAt?: string;
  assignedByPharmacyAdminId: string;
  isActive: boolean;
}

export interface PharmacistSummaryDTO {
  pharmacistId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  status: UserStatus | number | string;
  activeBranchName?: string;
  assignments: AssignmentDTO[];
}

export interface PharmacistResponseDTO {
  pharmacistId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  status: UserStatus | number | string;
  pharmacyLegalName: string;
  branchId: string;
  branchName?: string;
  branchCity?: string;
  branchAddress?: string;
  branchPhone?: string;
  createdAt: string;
}

export interface AssignmentHistoryItemDTO {
  assignmentId: string;
  pharmacistId: string;
  pharmacistFullName: string;
  pharmacyId: string;
  pharmacyLegalName: string;
  branchId: string;
  branchName: string;
  assignedAt: string;
  endedAt?: string;
  assignedByAdminId: string;
  assignedByAdminFullName: string;
  isActive: boolean;
}

export interface CreatePharmacistRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  branchId: string;
}

export interface UpdatePharmacistRequest {
  fullName: string;
  phoneNumber: string;
  password?: string;
}

export interface UpdatePharmacistStatusRequest {
  status: number;
}

export interface PharmacistFilterParams {
  search?: string;
  branchId?: string;
  userStatus?: number;
  pageNumber: number;
  pageSize: number;
}

export interface PaginatedList<T> {
  items: T[];
  pageNumber: number;
  totalCount: number;
  pageSize: number;
}
