export interface ForecastLogDTO {
    drugId: string;
    drugName?: string; // هنحتاج الباك اند يرجع اسم الدواء عشان نعرضه في الجدول
    forecastDate: string;
    predictedStockoutDate: string | null;
    aiRationale: string;
}

export interface ForecastReportResponse {
    success: boolean;
    message?: string;
    data: ForecastLogDTO[];
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
    status: string | number; // حسب لو باعتها Enum Number ولا String
    aiRationale: string;
    createdAt: string;
}