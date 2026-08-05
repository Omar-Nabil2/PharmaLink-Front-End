import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PurchaseOrderService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.baseUrl}`;

    // جلب كل طلبات الفرع
    getBranchOrders(branchId: string) {
        return this.http.get<any[]>(`${this.apiUrl}/inventory/supplier-orders/${branchId}`);
    }

    // دالة الاستلام اللي لسه متكلمين عنها
    receiveOrder(orderId: string, branchId: string) {
        return this.http.post(`${this.apiUrl}/inventory/${orderId}/receive?branchId=${branchId}`, {});
    }
}