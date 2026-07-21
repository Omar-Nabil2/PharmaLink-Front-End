export interface MedicineDto {
    id?: string;
    name: string;
    quantity: number;
    dosageInstructions: string;
}

export interface PrescriptionReviewDto {
    reviewId: string; // كان اسمها id
    imageUrl: string; // كان اسمها prescriptionImageUrl
    status: string;
    reviewNotes?: string; // كان اسمها notes
    medicines: MedicineDto[];
    patientName?: string;
    aiModel?: string;
    ocrResult?: string;
}

export interface GetAllPrescriptionReviewDto {
  reviewId: string;
  patientName: string;
  imageUrl: string;
  status: string;
  medicineCount: number;
  createdAt: string;
  reviewedAt: string | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PrescriptionReviewQueryDto {
  status?: string;
  searchTerm?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface BranchOrderRowDto {
  orderId: string;
  orderNumber: string;
  patientName: string;
  drugsSummary: string;
  totalAmount: number;
  status: string;
  date: string;
}

export interface PaginatedList<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface Result<T> {
  value: PaginatedList<T>;
  isSuccess: boolean;
  isFailure: boolean;
  error: any;
}
