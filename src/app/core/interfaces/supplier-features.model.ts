// ─── Models: أدويتي ───
export interface SupplierDrugDTO {
    drugId: string;
    brandName: string;
    genericName?: string;
}

export interface AvailableDrugDTO {
    drugId: string;
    brandName: string;
}

// ─── Models: الملف الشخصي ───
export interface SupplierProfileDTO {
    supplierId: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    address: string;
    contactPerson: string;
}

export interface UpdateSupplierProfileDTO {
    fullName: string;
    phoneNumber: string;
    address: string;
    contactPerson: string;
}


export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        currentPage: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
    };
}