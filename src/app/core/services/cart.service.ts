import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { CartResponse } from '../interfaces/cart.interface';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly baseUrl = environment.baseUrl;

  constructor(private readonly http: HttpClient) {}

  getCart(): Observable<CartResponse> {
    return this.http.get<CartResponse>(`${this.baseUrl}/Cart`);
  }
  addItem(drugId: string, quantity: number): Observable<CartResponse> {
  return this.http.post<CartResponse>(`${this.baseUrl}/Cart/items`, { drugId, quantity });
}
}