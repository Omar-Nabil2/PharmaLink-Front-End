export interface PaginatedResponse<T> {
    items: T[];
    pageNumber: number;
    totalCount: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

export interface InventoryItem {
    inventoryId: string;
    branchId: string;
    drugId: string;
    drugName: string;
    arabicName: string;
    stockQuantity: number;
    reservedQuantity: number;
    unitPrice: number;
    expiryDate: string;
    stockStatus: string;
    stockStatusLabel: string;
}

export enum InventoryStatusFilter {
    All = 0,
    Available = 1,
    LowStock = 2,
    OutOfStock = 3
}