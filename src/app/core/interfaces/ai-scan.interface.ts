export interface MedicineImageExtraction {
  medicineName: string;
  strength?: string | null;
  dosageForm?: string | null;
  manufacturer?: string | null;
  confidence?: number | null;
  rawText?: string | null;
}

export interface MedicineImageScanResponse {
  extraction: MedicineImageExtraction;
  matchedDrugId?: string | null;
  suggestedAlternativeDrugId?: string | null;
  cartDrugId?: string | null;
  matchStatus: 'NotFound' | 'ExactMatch' | 'FuzzyMatch' | 'AlternativeSuggested' | string;
  matchScore: number;
  matchReason?: string | null;
  canBeAddedToCart: boolean;
}
