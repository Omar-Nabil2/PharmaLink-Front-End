export interface PrescriptionHistoryQuestionRequest { question: string; }

export interface PrescriptionHistoryMedicine {
  prescriptionReviewMedicineId: string;
  medicineName: string;
  strength?: string | null;
  dosageForm?: string | null;
  frequency?: string | null;
  quantity: number;
  canBeAddedToCart: boolean;
}

export interface PrescriptionHistorySource {
  prescriptionId: string;
  doctorName?: string | null;
  specialty?: string | null;
  clinicOrHospital?: string | null;
  imageError?: boolean;
  visitDate: string;
  diagnosisNotes?: string | null;
  imageUrl: string;
  relevanceScore: number;
  medicines: PrescriptionHistoryMedicine[];
}

export interface PrescriptionHistoryAnswer {
  answer: string;
  sources: PrescriptionHistorySource[];
  hasMatches: boolean;
}
