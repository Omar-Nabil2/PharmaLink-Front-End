export enum POStatus {
    PendingPharmacyApproval = 0,
    RejectedByPharmacy = 1,
    SentToSupplier = 2,
    AcceptedBySupplier = 3,
    RejectedBySupplier = 4,
    ProcessingBySupplier = 5,
    Shipped = 6,
    Delivered = 7
}

export interface SupplierOrderDTO {
    orderId: string;
    pharmacyBranchName: string;
    drugId: string;
    drugName: string;
    requestedQuantity: number;
    currentStatus: string; // بيجي من الباك إند كـ String أو بنعمله Map
    orderedAt: string;
}

export interface UpdateOrderStatusDTO {
    newStatus: POStatus;
}