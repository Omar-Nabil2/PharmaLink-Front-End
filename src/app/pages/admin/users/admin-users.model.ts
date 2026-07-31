export enum UserStatus {
  Active = 1,
  Inactive = 2,
  Suspended = 3
}

export interface AdminUserDto {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  registrationDate: string;
  status: UserStatus;
}

export interface AdminUserFilterDto {
  pageNumber: number;
  pageSize: number;
  search?: string;
  role?: string;
  status?: UserStatus;
  sortBy?: string;
  sortDirection?: string;
}

export interface UpdateUserStatusDto {
  status: UserStatus;
}

export interface PaginatedList<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
