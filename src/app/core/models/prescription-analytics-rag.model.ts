export interface PrescriptionAnalyticsRagRequest {
  question: string;
}

export interface PrescribedDrugMetric {
  medicineName: string;
  category?: string;
  mentionCount: number;
  totalQuantity: number;
  percentage: number;
}

export interface CategoryMetric {
  categoryName: string;
  count: number;
  percentage: number;
  colorHint?: string;
}

export interface PrescriptionAnalyticsMedicine {
  prescriptionReviewMedicineId: string;
  medicineName: string;
  strength?: string | null;
  dosageForm?: string | null;
  dose?: string | null;
  frequency?: string | null;
  quantity: number;
  matchedDrugId?: string | null;
  suggestedAlternativeDrugId?: string | null;
  canBeAddedToCart: boolean;
}

export interface PrescriptionAnalyticsSource {
  prescriptionId: string;
  doctorName?: string | null;
  specialty?: string | null;
  clinicOrHospital?: string | null;
  visitDate: string;
  diagnosisNotes?: string | null;
  patientAddress?: string | null;
  imageUrl: string;
  relevanceScore: number;
  medicines: PrescriptionAnalyticsMedicine[];
}

export interface PrescriptionAnalyticsRagResponse {
  answer: string;
  sources: PrescriptionAnalyticsSource[];
  hasMatches: boolean;
  totalPrescriptionsAnalyzed: number;
  topPrescribedDrugs: PrescribedDrugMetric[];
  mostRequestedCategories: CategoryMetric[];
}
