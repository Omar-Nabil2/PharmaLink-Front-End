export interface DrugCategory {
  id: number;
  nameEn: string;
  nameAr: string;
  slug: string;
  imageUrl?: string;
  level: number;
  parentId?: number;
  subCategories?: DrugCategory[];
}

export interface DrugSupplier {
  id: number;
  supplierId: number;
  nameAr: string;
  nameEn: string;
  discount: number;
  commercialPrice: number;
  price: number;
  quantity: number;
}

export interface DrugLandingPage {
  id: number;
  titleAr: string;
  titleEn: string;
  slug: string;
}

export type DrugAvailabilityStatus = 'OutOfStock' | 'LowStock' | 'InStock';

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
  category?: DrugCategory;

  suppliers: DrugSupplier[];
  landingPages: DrugLandingPage[];

  availabilityStatus: DrugAvailabilityStatus | null;
}

export interface DrugSearchParams {
  searchValue?: string;
  categoryId?: number;
  sortColumn?: string;
  sortDirection?: string;
  pageNumber?: number;
  pageSize?: number;
  latitude?: number;
  longitude?: number;
  form?: string;
}

export interface PaginatedList<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}