export interface MedicineDto {
    id?: string;
    medicineName?: string;           // قادم من الـ API الجديد
    name?: string;                  // للحفاظ على التوافق مع الكود القديم
    originalMedicineName?: string;
    genericName?: string;
    strength?: string;
    dosageForm?: string;
    dose?: string;
    frequency?: string;
    duration?: string;
    quantity: number;
    route?: string;
    dosageInstructions?: string;    // للحفاظ على التوافق مع الكود القديم
    confidence?: number;
    matchedDrugId?: string | null;
    suggestedAlternativeDrugId?: string | null;
    matchStatus?: 'NotFound' | 'ExactMatch' | 'FuzzyMatch' | 'AlternativeSuggested' | 'Unavailable' | string;
    matchReason?: string | null;
    matchScore?: number | null;
    aiNote?: string | null;
    requiresPatientApproval?: boolean;
    patientApprovedAt?: string | null;
    isEdited?: boolean;
}

export interface PrescriptionReviewDto {
    reviewId: string;
    patientUserId?: string;
    patientName?: string;
    imageUrl: string;
    status: string;
    aiModel?: string;
    reviewNotes?: string;
    createdAt?: string;
    reviewedAt?: string | null;
    createdOrderId?: string;         // لرابط الطلب
    ocrResult?: string;
    processingStatus?: string;
    medicines: MedicineDto[];
}

export interface PrescriptionReviewUploadResponse {
  reviewId: string;
  prescriptionReviewId?: string;
  cartId?: string | null;
  status: string;
  processingStatus?: string;
  imageUrl: string;
  medicines: MedicineDto[];
  extractedItems?: MedicineDto[];
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


export interface PharmacistDailyMetrics {
  pendingPrescriptionReviews: number;
  completedReviewsToday: number;
  pendingFulfillmentOrders: number;
  completedOrdersToday: number;
}

export interface InventoryAlert {
  drugId: string;
  brandName: string;
  stockQuantity: number;
  expiryDate: string;
  alertType: string;
}

export interface FulfillmentTask {
  legId: string;
  orderId: string;
  readyByEstimate: string;
  totalAmount: number;
  itemsCount: number;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  value: T;
  error?: any;
}

export interface OrderItemDto {
  drugId: string;
  drugName: string;
  arabicName?: string;
  imageUrl: string;
  quantity: number;
  strength: string;
  dosageForm: string;
}

export interface OrderPatientDto {
  patientId: string;
  fullName: string;
  phoneNumber: string;
}

export interface AssignedLegDto {
  legId: string;
  orderId: string;
  branchId: string;
  legType: string;
  legStatus: string;
  readyByEstimate: string;
  completedAt: string;
}

export interface PharmacistOrderDetailsDto {
  orderId: string;
  orderNumber: string;
  createdAt: string;
  totalAmount: number;
  orderStatus: string;
  fulfillmentMode: string;
  patient: OrderPatientDto;
  items: OrderItemDto[];
  notes: string | null;
  assignedLeg: AssignedLegDto;
}
