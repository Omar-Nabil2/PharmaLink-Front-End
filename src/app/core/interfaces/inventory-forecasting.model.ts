export interface ForecastLogDTO {
    drugId: string;
    drugName?: string; // هنحتاج الباك اند يرجع اسم الدواء عشان نعرضه في الجدول
    forecastDate: string;
    predictedStockoutDate: string | null;
    aiRationale: string;
}

export interface PaginationData {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}

export interface ForecastReportResponse {
    success: boolean;
    message?: string;
    data: ForecastLogDTO[];
    pagination?: PaginationData; // 👈 ضفنا الجزء ده هنا
}

export interface TriggerForecastResponse {
    success: boolean;
    message: string;
    timestamp: string;
}

export interface PurchaseOrderDTO {
    id: string;
    drugId: string;
    drugName: string;
    branchName: string;
    orderedQuantity: number;
    status: string | number;
    aiRationale: string;
    createdAt: string;
}