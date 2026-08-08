export interface PrescriptionAnalyticsRagRequest {
  question: string;
  branchId?: string | null;
  city?: string | null;
  governorate?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

export interface PrescribedDrugMetric {
  medicineName: string;
  genericName?: string;
  mentionCount: number;
  totalQuantity: number;
  percentage: number;
  isPediatric: boolean;
  trend: 'up' | 'stable' | 'down';
}

export interface CategoryMetric {
  categoryName: string;
  count: number;
  percentage: number;
  colorHint: string;
}

export type UrgencyLevel = 'Critical' | 'High' | 'Medium';

export interface ShortageWarning {
  drugName: string;
  highDemandReason: string;
  availableStock: number;
  recommendation: string;
  urgencyLevel: UrgencyLevel;
}

export interface PrescriptionRef {
  prescriptionReviewId: string;
  city: string;
  governorate: string;
  createdAt: string;
  similarityScore: number;
}

export interface PrescriptionAnalyticsRagResponse {
  answer: string;
  totalPrescriptionsAnalyzed: number;
  topPrescribedDrugs: PrescribedDrugMetric[];
  mostRequestedCategories: CategoryMetric[];
  shortageWarnings: ShortageWarning[];
  demandForecastingInsights: string[];
  matchedPrescriptions: PrescriptionRef[];
  analysisScope: string;
  analysisTimeRange: string;
  usedProvider: string;
  executionTimeMs: number;
}
