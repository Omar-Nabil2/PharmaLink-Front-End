import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment'; // تأكد من مسار بيئة العمل عندك
import {
    ForecastReportResponse,
    TriggerForecastResponse,
    PurchaseOrderDTO
} from '../interfaces/inventory-forecasting.model';

@Injectable({
    providedIn: 'root'
})
export class InventoryForecastingService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = `${environment.baseUrl}/inventory`;

    /**
     * جلب تقرير التنبؤ الخاص بفرع معين
     */
    getBranchForecastReport(branchId: string, pageNumber: number = 1, pageSize: number = 5): Observable<ForecastReportResponse> {
        let params = new HttpParams()
            .set('pageNumber', pageNumber.toString())
            .set('pageSize', pageSize.toString());

        return this.http.get<ForecastReportResponse>(`${this.baseUrl}/branches/${branchId}/forecast-report`, { params });
    }

    /**
     * تشغيل التنبؤ يدوياً (لفرع معين أو كل الفروع)
     */
    triggerForecast(branchId?: string, analysisDays: number = 30): Observable<TriggerForecastResponse> {
        let params = new HttpParams().set('analysisDays', analysisDays.toString());

        if (branchId) {
            params = params.set('branchId', branchId);
        }

        return this.http.post<TriggerForecastResponse>(`${this.baseUrl}/trigger-forecast`, null, { params });
    }

    /**
     * اعتماد أمر الشراء المُنشأ بواسطة الذكاء الاصطناعي
     */
    approvePurchaseOrder(orderId: string): Observable<{ success: boolean; message: string }> {
        return this.http.put<{ success: boolean; message: string }>(`${this.baseUrl}/purchase-orders/${orderId}/approve`, null);
    }

    /**
     * (ملحوظة: هنحتاج الـ API ده من الباك إند عشان نجيب الطلبات المعلقة)
     * جلب أوامر الشراء المعلقة للفرع
     */
    getPendingPurchaseOrders(branchId: string): Observable<PurchaseOrderDTO[]> {
        return this.http.get<PurchaseOrderDTO[]>(`${this.baseUrl}/${branchId}/pending-purchase-orders`);
    }

    // جلب الموردين المتاحين لدواء معين
    getSuppliersForDrug(drugId: string) {
        return this.http.get<any[]>(`${this.baseUrl}/drugs/${drugId}/suppliers`);
    }

    // إرسال أمر الشراء لمورد معين
    assignSupplierToOrder(orderId: string, supplierId: string, branchId: string) {
        // لاحظ إن branchId غالباً مبعوت كـ Query Parameter حسب كود الـ C# بتاعك
        return this.http.post<any>(`${this.baseUrl}/${orderId}/assign-supplier/${supplierId}?branchId=${branchId}`, {});
    }


}