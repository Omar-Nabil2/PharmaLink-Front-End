import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { CreateOrderRequest, OrderCreatedResponse } from '../interfaces/order.interface';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly baseUrl = environment.baseUrl;

  constructor(private readonly http: HttpClient) {}

  createOrder(data: CreateOrderRequest): Observable<OrderCreatedResponse> {
    return this.http.post<OrderCreatedResponse>(`${this.baseUrl}/Orders`, data);
  }
}