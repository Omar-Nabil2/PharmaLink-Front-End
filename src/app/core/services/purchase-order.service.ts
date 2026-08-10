import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PurchaseOrderService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.baseUrl}`;

    // جلب كل طلبات الفرع
    getBranchOrders(branchId: string, page: number = 1, pageSize: number = 10, searchTerm?: string, status?: string) {
        let params = new HttpParams()
            .set('PageNumber', page.toString())
            .set('PageSize', pageSize.toString());

        if (searchTerm) params = params.set('SearchTerm', searchTerm);
        if (status) params = params.set('Status', status);

        return this.http.get<any>(`${this.apiUrl}/inventory/supplier-orders/${branchId}`, { params });
    }

    // دالة الاستلام اللي لسه متكلمين عنها
    receiveOrder(orderId: string, branchId: string) {
        return this.http.post(`${this.apiUrl}/inventory/${orderId}/receive?branchId=${branchId}`, {});
    }
}