export interface MedicalInquiry {
  medicalInquiryId: string;
  patientUserId: string;
  patientName: string;
  question: string;
  answer?: string | null;
  status: 'Pending' | 'Answered' | 'Closed' | string;
  answeredByName?: string | null;
  createdAt: string;
  answeredAt?: string | null;
}

export interface CreateMedicalInquiryRequest {
  question: string;
}

export interface AnswerMedicalInquiryRequest {
  answer: string;
}

export interface MedicalInquiryMetrics {
  totalInquiries: number;
  pendingInquiries: number;
  answeredInquiries: number;
  closedInquiries: number;
  answeredToday: number;
}
