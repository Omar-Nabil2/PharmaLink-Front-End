import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { Cart } from '../interfaces/cart.interface';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly baseUrl = environment.baseUrl + '/Cart';
  
  private cartCountSubject = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  getCart(): Observable<Cart> {
    return this.http.get<any>(this.baseUrl).pipe(
      map(response => {
        if (!response) return response;
        return response.value !== undefined ? response.value : response;
      }),
      tap(cart => {
        if (cart && cart.items) {
          const totalItems = cart.items.length;
          this.cartCountSubject.next(totalItems);
        } else {
          this.cartCountSubject.next(0);
        }
      })
    );
  }

  updateCartCount(count: number) {
    this.cartCountSubject.next(count);
  }

  updateCartItem(itemId: string, quantity: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/items/${itemId}`, { quantity }).pipe(
      tap(() => this.getCart().subscribe({ error: () => {} }))
    );
  }

  removeCartItem(itemId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/items/${itemId}`).pipe(
      tap(() => this.getCart().subscribe({ error: () => {} }))
    );
  }
  addItem(drugId: string, quantity: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/items`, {
      drugId,
      quantity
    }).pipe(
      tap(() => this.getCart().subscribe({ error: () => {} }))
    );
  }
}
