import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import {
  CreateOrderRequest,
  OrderCreatedResponse,
  PatientOrder,
  PatientOrdersFilter,
  PatientOrdersResponse,
} from '../interfaces/order.interface';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly baseUrl = environment.baseUrl;

  constructor(private readonly http: HttpClient) {}

  createOrder(data: CreateOrderRequest): Observable<OrderCreatedResponse> {
    return this.http.post<OrderCreatedResponse>(`${this.baseUrl}/Orders`, data);
  }

  getOrders(filter: PatientOrdersFilter): Observable<PatientOrdersResponse> {
    let params = new HttpParams()
      .set('pageNumber', filter.pageNumber.toString())
      .set('pageSize', filter.pageSize.toString());

    if (filter.search) params = params.set('search', filter.search);
    if (filter.status) params = params.set('status', filter.status);
    if (filter.fromDate) params = params.set('fromDate', filter.fromDate);
    if (filter.toDate) params = params.set('toDate', filter.toDate);
    if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
    if (filter.sortDir) params = params.set('sortDir', filter.sortDir);

    return this.http.get<any>(`${this.baseUrl}/Orders`, { params }).pipe(
      map(res => (res?.value !== undefined ? res.value : res))
    );
  }

  getOrderById(orderId: string): Observable<PatientOrder> {
    return this.http.get<any>(`${this.baseUrl}/Orders/${orderId}`).pipe(
      map(res => (res?.value !== undefined ? res.value : res))
    );
  }
}