import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../core/services/cart.service';
import { DrugService } from '../../core/services/drug.service';
import { Cart, CartItem } from '../../core/interfaces/cart.interface';
import { catchError, forkJoin, of, Subject, takeUntil, map, switchMap, defaultIfEmpty, timeout } from 'rxjs';
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
    this.loadCart();
  }

  loadCart(): void {
    this.isLoading = true;
    this.error = null;

    this.cartService.getCart().pipe(
      takeUntil(this.destroy$),
      switchMap(cart => {
        if (!cart || !cart.items || cart.items.length === 0) {
          return of(cart);
        }

        const itemObservables = cart.items.map(item =>
          this.drugService.getDrugById(item.drugId).pipe(
            timeout(5000),
            map(drug => {
              item.drugArabicName = drug?.arabicName || item.drugBrandName;
              return item;
            }),
            catchError(() => {
              item.drugArabicName = item.drugBrandName;
              return of(item);
            })
          )
        );

        return forkJoin(itemObservables).pipe(
          defaultIfEmpty([]),
          map(items => {
            cart.items = items as CartItem[];
            return cart;
          })
        );
      }),
      catchError(err => {
        throw err;
      })
    ).subscribe({
      next: (cart) => {
        this.ngZone.run(() => {
          this.cart = cart;
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.error = 'حدث خطأ أثناء تحميل سلة المشتريات.';
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  increaseQuantity(item: CartItem): void {
    const currentQuantity = Number(item.quantity) || 1;
    this.updateItemQuantity(item, currentQuantity + 1);
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      this.updateItemQuantity(item, item.quantity - 1);
    }
  }

  updateItemQuantity(item: CartItem, quantity: number): void {
    const itemId = item.cartItemId || (item as any).id;
    if (!itemId) return;

    item.loading = true;
    this.cdr.detectChanges();

    this.cartService.updateCartItem(itemId, quantity).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.ngZone.run(() => {
          item.quantity = quantity;
          item.lineTotal = item.unitPriceSnapshot * quantity;
          item.loading = false;
          this.recalculateTotal();
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.ngZone.run(() => {
          item.loading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  removeItem(item: CartItem): void {
    const itemId = item.cartItemId || (item as any).id;
    if (!itemId) return;

    item.loading = true;
    this.cdr.detectChanges();

    this.cartService.removeCartItem(itemId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.ngZone.run(() => {
          if (this.cart) {
            this.cart.items = this.cart.items.filter(i => i.cartItemId !== item.cartItemId);
            this.recalculateTotal();
            this.cdr.detectChanges();
          }
        });
      },
      error: () => {
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
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
