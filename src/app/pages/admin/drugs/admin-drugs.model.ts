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
  brandName: string;
  imageUrl?: string;
  form: string;
  price: number;
  manufacturer: string;
  arabicName: string;
  requiresPrescription: boolean;
  isActive: boolean;
  
  finalPrice: number;
  discount: number;
  costPrice: number;
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
  inStock: boolean;
  outOfStock: boolean;
  lowStock: boolean;
  maxQuantity: number;
  quantity: number;
  purchaseCount: number;
  chefaaId?: number;

  categoryId?: number;
  category?: DrugCategoryDto;
  suppliers: DrugSupplierDto[];
  landingPages: DrugLandingPageDto[];

  availabilityStatus?: DrugAvailabilityStatus;
}

export interface CreateDrugDto {
  brandName: string;
  arabicName: string;
  form: string;
  price: number;
  manufacturer: string;
  categoryId?: number;
  requiresPrescription: boolean;
  
  finalPrice?: number;
  discount?: number;
  costPrice?: number;
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
  inStock?: boolean;
  outOfStock?: boolean;
  lowStock?: boolean;
  maxQuantity?: number;
  quantity?: number;
  purchaseCount?: number;
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
