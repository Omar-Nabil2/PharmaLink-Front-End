import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { AdminOrderDTO, AdminOrderDetailDTO, AdminOrdersFilter, PaginatedList } from '@pages/orders/admin-orders.model';


@Injectable({ providedIn: 'root' })
export class AdminOrdersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.localUrl;

  getOrders(filter: AdminOrdersFilter): Observable<any> {
    let params = new HttpParams()
      .set('pageNumber', filter.pageNumber.toString())
      .set('pageSize', filter.pageSize.toString())
      .set('sortBy', filter.sortBy)
      .set('sortDir', filter.sortDir);

    if (filter.search) {
      params = params.set('search', filter.search);
    }
    if (filter.status !== undefined && filter.status !== null) {
      params = params.set('status', filter.status.toString());
    }
    if (filter.fulfillmentMode !== undefined && filter.fulfillmentMode !== null) {
      params = params.set('fulfillmentMode', filter.fulfillmentMode.toString());
    }
    if (filter.legStatus !== undefined && filter.legStatus !== null) {
      params = params.set('legStatus', filter.legStatus.toString());
    }
    if (filter.fromDate) {
      params = params.set('fromDate', filter.fromDate);
    }
    if (filter.toDate) {
      params = params.set('toDate', filter.toDate);
    }

    return this.http.get<any>(`${this.baseUrl}/AdminOrders`, { params });
  }

  getOrderDetails(orderId: string): Observable<AdminOrderDetailDTO> {
    return this.http.get<AdminOrderDetailDTO>(`${this.baseUrl}/AdminOrders/${orderId}`);
  }

  resplitOrder(orderId: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/AdminOrders/${orderId}/resplit`, {});
  }

  exportOrders(filter: Omit<AdminOrdersFilter, 'pageNumber' | 'pageSize'>, format: 'xlsx' | 'csv'): Observable<Blob> {
    let params = new HttpParams()
      .set('format', format);

    if (filter.search) {
      params = params.set('search', filter.search);
    }
    if (filter.status !== undefined && filter.status !== null) {
      params = params.set('status', filter.status.toString());
    }
    if (filter.fulfillmentMode !== undefined && filter.fulfillmentMode !== null) {
      params = params.set('fulfillmentMode', filter.fulfillmentMode.toString());
    }
    if (filter.legStatus !== undefined && filter.legStatus !== null) {
      params = params.set('legStatus', filter.legStatus.toString());
    }
    if (filter.fromDate) {
      params = params.set('fromDate', filter.fromDate);
    }
    if (filter.toDate) {
      params = params.set('toDate', filter.toDate);
    }

    const responseType = format === 'xlsx' 
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      : 'text/csv';

    return this.http.get(`${this.baseUrl}/AdminOrders/export`, {
      params,
      responseType: 'blob'
    });
  }

  /** GET /api/v1/OrderFulfillmentLegs/{legId} — full leg detail */
  getLegDetail(legId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/OrderFulfillmentLegs/${legId}`);
  }

  /** PATCH /api/v1/FulfillmentLeg/{legId}/status — admin override with audit reason */
  updateLegStatus(legId: string, status: number, auditReason: string): Observable<any> {
    return this.http.patch<any>(
      `${this.baseUrl}/FulfillmentLeg/${legId}/status`,
      { status, auditReason }
    );
  }
}
