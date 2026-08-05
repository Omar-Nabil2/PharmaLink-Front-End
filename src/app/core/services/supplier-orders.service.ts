import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { POStatus, SupplierOrderDTO, UpdateOrderStatusDTO } from '../interfaces/supplier-orders.model';

@Injectable({
    providedIn: 'root'
})
export class SupplierOrdersService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = `${environment.baseUrl}/SupplierOrders`;

    getMyOrders(status?: POStatus): Observable<SupplierOrderDTO[]> {
        let params = new HttpParams();
        if (status !== undefined && status !== null) {
            params = params.set('status', status.toString());
        }
        return this.http.get<SupplierOrderDTO[]>(this.baseUrl, { params });
    }

    acceptOrder(orderId: string): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.baseUrl}/${orderId}/accept`, null);
    }

    rejectOrder(orderId: string): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.baseUrl}/${orderId}/reject`, null);
    }

    updateOrderStatus(orderId: string, newStatus: POStatus): Observable<{ message: string }> {
        const payload: UpdateOrderStatusDTO = { newStatus };
        return this.http.put<{ message: string }>(`${this.baseUrl}/${orderId}/status`, payload);
    }
}