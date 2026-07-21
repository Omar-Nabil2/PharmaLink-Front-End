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