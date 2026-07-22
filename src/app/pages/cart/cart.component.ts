import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../core/services/cart.service';
import { DrugService } from '../../core/services/drug.service';
import { Cart, CartItem } from '../../core/interfaces/cart.interface';
import { catchError, forkJoin, of, Subject, takeUntil, map, switchMap, finalize, defaultIfEmpty, timeout } from 'rxjs';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit, OnDestroy {
  cart: Cart | null = null;
  isLoading: boolean = true;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private cartService: CartService,
    private drugService: DrugService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    console.log('[Cart] ngOnInit called');
    this.loadCart();
  }

  loadCart(): void {
    console.log('[Cart] loadCart() started — isLoading set to true');
    this.isLoading = true;
    this.error = null;

    console.log('[Cart] Calling cartService.getCart()...');
    this.cartService.getCart().pipe(
      takeUntil(this.destroy$),
      switchMap(cart => {
        console.log('[Cart] getCart() RAW response:', cart);

        if (!cart) {
          console.warn('[Cart] cart is null/undefined — returning as-is');
          return of(cart);
        }

        console.log('[Cart] cart.items:', cart.items);
        console.log('[Cart] cart.items length:', cart.items?.length);

        if (!cart.items || cart.items.length === 0) {
          console.log('[Cart] Cart is empty — skipping drug fetch');
          return of(cart);
        }

        // Fetch drug details for each item to get the arabic name
        console.log(`[Cart] Fetching drug details for ${cart.items.length} item(s)...`);
        const itemObservables = cart.items.map((item, index) => {
          console.log(`[Cart] [Item ${index}] drugId: ${item.drugId} | cartItemId: ${item.cartItemId}`);
          return this.drugService.getDrugById(item.drugId).pipe(
            timeout(5000),
            map(drug => {
              console.log(`[Cart] [Item ${index}] getDrugById(${item.drugId}) response:`, drug);
              item.drugArabicName = drug?.arabicName || item.drugBrandName;
              return item;
            }),
            catchError((err) => {
              console.error(`[Cart] [Item ${index}] getDrugById(${item.drugId}) FAILED:`, err);
              // Fallback if drug fetch fails or times out
              item.drugArabicName = item.drugBrandName;
              return of(item);
            })
          );
        });

        console.log('[Cart] Running forkJoin for all drug fetches...');
        return forkJoin(itemObservables).pipe(
          defaultIfEmpty([]),
          map(items => {
            console.log('[Cart] forkJoin completed. Enriched items:', items);
            cart.items = items as CartItem[];
            return cart;
          })
        );
      }),
      catchError(err => {
        console.error('[Cart] Pipeline catchError — error:', err);
        throw err;
      })
    ).subscribe({
      next: (cart) => {
        console.log('[Cart] subscribe.next() called — final cart:', cart);
        this.ngZone.run(() => {
          this.cart = cart;
          this.isLoading = false;
          this.cdr.detectChanges();
          console.log('[Cart] isLoading set to FALSE, detectChanges() called');
        });
      },
      error: (err) => {
        console.error('[Cart] subscribe.error() called:', err);
        this.ngZone.run(() => {
          this.error = 'حدث خطأ أثناء تحميل سلة المشتريات.';
          this.isLoading = false;
          this.cdr.detectChanges();
          console.log('[Cart] isLoading set to FALSE (error path), detectChanges() called');
        });
      },
      complete: () => {
        console.log('[Cart] subscribe.complete() called');
      }
    });
  }

  increaseQuantity(item: CartItem): void {
    const currentQuantity = Number(item.quantity) || 1;
    const newQuantity = currentQuantity + 1;
    console.log(`[Cart] increaseQuantity — item: ${item.cartItemId}, from ${currentQuantity} to ${newQuantity}`);
    this.updateItemQuantity(item, newQuantity);
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      const newQuantity = item.quantity - 1;
      console.log(`[Cart] decreaseQuantity — item: ${item.cartItemId}, to ${newQuantity}`);
      this.updateItemQuantity(item, newQuantity);
    }
  }

  updateItemQuantity(item: CartItem, quantity: number): void {
    const itemId = item.cartItemId || (item as any).id;
    console.log(`[Cart] updateItemQuantity — itemId: ${itemId}, quantity: ${quantity}`);
    if (!itemId) {
      console.error('[Cart] updateItemQuantity: No item ID found!', item);
      return;
    }
    item.loading = true;
    this.cdr.detectChanges();
    console.log(`[Cart] Calling cartService.updateCartItem(${itemId}, ${quantity})...`);
    this.cartService.updateCartItem(itemId, quantity).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (res) => {
        console.log(`[Cart] updateCartItem SUCCESS. Response:`, res);
        this.ngZone.run(() => {
          item.quantity = quantity;
          item.lineTotal = item.unitPriceSnapshot * quantity;
          item.loading = false;
          this.recalculateTotal();
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        console.error(`[Cart] updateCartItem ERROR:`, err);
        this.ngZone.run(() => {
          item.loading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  removeItem(item: CartItem): void {
    const itemId = item.cartItemId || (item as any).id;
    console.log(`[Cart] removeItem — itemId: ${itemId}`);
    if (!itemId) {
      console.error('[Cart] removeItem: No item ID found!', item);
      return;
    }
    item.loading = true;
    this.cdr.detectChanges();
    console.log(`[Cart] Calling cartService.removeCartItem(${itemId})...`);
    this.cartService.removeCartItem(itemId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (res) => {
        console.log(`[Cart] removeCartItem SUCCESS. Response:`, res);
        this.ngZone.run(() => {
          if (this.cart) {
            this.cart.items = this.cart.items.filter(i => i.cartItemId !== item.cartItemId);
            this.recalculateTotal();
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        console.error(`[Cart] removeCartItem ERROR:`, err);
        this.ngZone.run(() => {
          item.loading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  trackByItemId(index: number, item: CartItem): string {
    return item.cartItemId;
  }

  private recalculateTotal(): void {
    if (this.cart) {
      this.cart.grandTotal = this.cart.items.reduce((sum, item) => sum + item.lineTotal, 0);
      console.log(`[Cart] recalculateTotal — new grandTotal: ${this.cart.grandTotal}`);
    }
  }

  ngOnDestroy(): void {
    console.log('[Cart] ngOnDestroy called');
    this.destroy$.next();
    this.destroy$.complete();
  }
}
