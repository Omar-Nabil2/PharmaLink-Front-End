export interface MedicineDTO {
    name: string;
    quantity: number;
}

export interface PreparationListDTO {
    legId: string;
    orderNumber: string;
    patientName: string;
    status: string;
    medcineDTOs: MedicineDTO[];
    selectedStatus?: string;
    isUpdating?: boolean;
    legType: number;
}

export interface PaginatedList<T> {
    items: T[];
    pageNumber: number;
    totalCount: number;
    pageSize: number;
}