import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { Cart } from '../interfaces/cart.interface';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly baseUrl = environment.localUrl + '/Cart';

  constructor(private http: HttpClient) {}

  getCart(): Observable<Cart> {
    return this.http.get<any>(this.baseUrl).pipe(
      map(response => {
        if (!response) return response;
        return response.value !== undefined ? response.value : response;
      })
    );
  }

  updateCartItem(itemId: string, quantity: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/items/${itemId}`, { quantity });
  }

  removeCartItem(itemId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/items/${itemId}`);
  }
}
