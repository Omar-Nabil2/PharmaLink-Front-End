export enum DrugCategory {
  PainRelievers = 1,
  Antibiotics = 2,
  DigestiveSystem = 3,
  Diabetes = 4,
  Cardiovascular = 5,
  BloodPressure = 6,
  AntiInflammatory = 7,
  Other = 8,
}

export enum DrugAvailabilityStatus {
  OutOfStock = 1,
  LowStock = 2,
  InStock = 3,
}

export interface DrugDto {
  drugId: string;
  genericName: string;
  brandName: string;
  drugBankId?: string;
  rxNormCui?: string;
  ndcCode?: string;
  strength: string;
  form: string;
  price: number;
  manufacturer: string;
  arabicName: string;
  drugClass: string;
  requiresPrescription: boolean;
  isActive: boolean;
  category: DrugCategory;
  availabilityStatus?: DrugAvailabilityStatus;
}

export interface CreateDrugDto {
  genericName: string;
  brandName: string;
  arabicName: string;
  strength: string;
  form: string;
  price: number;
  manufacturer: string;
  drugClass: string;
  category?: DrugCategory;
  requiresPrescription: boolean;
}

export interface UpdateDrugDto extends CreateDrugDto {
  isActive: boolean;
}

export interface DrugSearchRequest {
  searchValue?: string;
  category?: DrugCategory | null;
  form?: string;
  sortColumn?: string;
  sortDirection?: string;
  pageNumber: number;
  pageSize: number;
}

export const DRUG_CATEGORY_LABELS: Record<DrugCategory, string> = {
  [DrugCategory.PainRelievers]: 'مسكنات الألم',
  [DrugCategory.Antibiotics]: 'مضادات حيوية',
  [DrugCategory.DigestiveSystem]: 'الجهاز الهضمي',
  [DrugCategory.Diabetes]: 'السكري',
  [DrugCategory.Cardiovascular]: 'القلب والأوعية',
  [DrugCategory.BloodPressure]: 'ضغط الدم',
  [DrugCategory.AntiInflammatory]: 'مضادات الالتهاب',
  [DrugCategory.Other]: 'أخرى',
};
