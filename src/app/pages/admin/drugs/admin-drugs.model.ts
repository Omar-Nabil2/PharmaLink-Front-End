export enum DrugAvailabilityStatus {
  OutOfStock = 1,
  LowStock = 2,
  InStock = 3,
}

export interface DrugCategoryDto {
  id: number;
  nameEn: string;
  nameAr: string;
  slug: string;
  level: number;
  parentId?: number;
}

export interface DrugSupplierDto {
  id: number;
  supplierId: number;
  nameAr: string;
  nameEn: string;
  discount: number;
  commercialPrice: number;
  price: number;
  quantity: number;
}

export interface DrugLandingPageDto {
  id: number;
  titleAr: string;
  titleEn: string;
  slug: string;
}

export interface DrugDto {
  drugId: string;
  genericName: string;
  brandName: string;
  imageUrl?: string;
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
  
  finalPrice: number;
  discount: number;
  costPrice: number;
  descriptionEn: string;
  descriptionAr: string;
  slug: string;
  brandEn: string;
  brandAr: string;
  brandSlug: string;
  brandImageUrl: string;
  status: string;
  type: string;
  flowType: string;
  fullUrl: string;
  metaKeywordsEn: string;
  metaKeywordsAr: string;
  metaDescriptionEn: string;
  metaDescriptionAr: string;
  sortingKeywordEn: string;
  sortingKeywordAr: string;
  bundleTagEn: string;
  bundleTagAr: string;
  couponDescriptionEn: string;
  couponDescriptionAr: string;
  inStock: boolean;
  outOfStock: boolean;
  lowStock: boolean;
  maxQuantity: number;
  quantity: number;
  purchaseCount: number;
  gameballPoints?: number;
  chefaaId?: number;

  categoryId?: number;
  category?: DrugCategoryDto;
  suppliers: DrugSupplierDto[];
  landingPages: DrugLandingPageDto[];

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
  categoryId?: number;
  requiresPrescription: boolean;
  
  finalPrice?: number;
  discount?: number;
  costPrice?: number;
  descriptionEn?: string;
  descriptionAr?: string;
  slug?: string;
  brandEn?: string;
  brandAr?: string;
  brandSlug?: string;
  brandImageUrl?: string;
  status?: string;
  type?: string;
  flowType?: string;
  fullUrl?: string;
  metaKeywordsEn?: string;
  metaKeywordsAr?: string;
  metaDescriptionEn?: string;
  metaDescriptionAr?: string;
  sortingKeywordEn?: string;
  sortingKeywordAr?: string;
  bundleTagEn?: string;
  bundleTagAr?: string;
  couponDescriptionEn?: string;
  couponDescriptionAr?: string;
  inStock?: boolean;
  outOfStock?: boolean;
  lowStock?: boolean;
  maxQuantity?: number;
  quantity?: number;
  purchaseCount?: number;
  gameballPoints?: number;
  chefaaId?: number;
}

export interface UpdateDrugDto extends CreateDrugDto {
  isActive: boolean;
}

export interface DrugSearchRequest {
  searchValue?: string;
  categoryId?: number | null;
  form?: string;
  sortColumn?: string;
  sortDirection?: string;
  pageNumber: number;
  pageSize: number;
}

export const DRUG_CATEGORY_LABELS: Record<number, string> = {};
