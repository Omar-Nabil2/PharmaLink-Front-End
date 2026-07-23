// Serialized as strings by the backend's JsonStringEnumConverter.
export type DrugCategory =
  | 'PainRelievers'
  | 'Antibiotics'
  | 'DigestiveSystem'
  | 'Diabetes'
  | 'Cardiovascular'
  | 'BloodPressure'
  | 'AntiInflammatory'
  | 'Other';

export type DrugAvailabilityStatus = 'OutOfStock' | 'LowStock' | 'InStock';

export interface DrugDto {
  drugId: string;
  genericName: string;
  brandName: string;
  strength: string;
  form: string;
  price: number;
  manufacturer: string;
  arabicName: string;
  drugClass: string;
  category: DrugCategory;
  availabilityStatus: DrugAvailabilityStatus | null;
  requiresPrescription: boolean;
  isActive: boolean;
}

export interface DrugSearchParams {
  searchValue?: string;
  category?: DrugCategory;
  pageNumber?: number;
  pageSize?: number;
  latitude?: number;
  longitude?: number;
}

export interface PaginatedList<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}