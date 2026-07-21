// Actual backend values — note "PendingReview" not "Pending", and an extra
// "OrderCreated" state (after approval, once the order is placed) not called
// out in the original AC. Handle both explicitly in the UI.
export type PrescriptionReviewStatus = 'PendingReview' | 'Approved' | 'Rejected' | 'OrderCreated';

export interface ExtractedMedicine {
    id: string;
    medicineName: string;
    originalMedicineName: string | null;
    genericName: string | null;
    strength: string | null;
    dosageForm: string;
    dose: string;
    frequency: string;
    duration: string;
    quantity: number;
    route: string;
    confidence: number;
    isEdited: boolean;
}

export interface PrescriptionReviewDetail {
    reviewId: string;
    patientUserId: string;
    patientName: string;
    imageUrl: string;
    status: PrescriptionReviewStatus;
    aiModel: string;
    reviewNotes: string | null;
    createdAt: string;
    reviewedAt: string | null;
    createdOrderId: string | null;
    medicines: ExtractedMedicine[];
}