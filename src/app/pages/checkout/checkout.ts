import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { forkJoin, of, catchError, map, switchMap, defaultIfEmpty, timeout } from 'rxjs';

import { CartService } from '../../../app/core/services/cart.service';
import { DrugService } from '../../../app/core/services/drug.service';
import { AddressService } from '../../../app/core/services/address.service';
import { OrderService } from '../../../app/core/services/order.service';
import { ErrorHandlerService } from '../../../app/core/services/error-handler.service';

import { Cart, CartItem } from '../../../app/core/interfaces/cart.interface';
import { AddressResponse } from '../../../app/core/interfaces/address.interface';
import { FulfillmentMode, OrderCreatedResponse } from '../../../app/core/interfaces/order.interface';

const DELIVERY_FEE = 15;

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.scss'],
})
export class CheckoutComponent implements OnInit {
  cart: Cart | null = null;
  addresses: AddressResponse[] = [];
  selectedAddressId: string | null = null;
  fulfillmentMode: FulfillmentMode = 'Delivery';
  paymentMethod: 'cod' | 'card' = 'cod';

  isLoading = true;
  isSubmitting = false;
  error: string | null = null;
  createdOrder: OrderCreatedResponse | null = null;

  constructor(
    private readonly cartService: CartService,
    private readonly drugService: DrugService,
    private readonly addressService: AddressService,
    private readonly orderService: OrderService,
    private readonly errorHandler: ErrorHandlerService,
    private readonly messageService: MessageService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.error = null;

    forkJoin({
      cart: this.cartService.getCart().pipe(
        switchMap((cart: Cart | null) => {
          if (!cart || !cart.items || cart.items.length === 0) {
            return of(cart);
          }

          const itemObservables = cart.items.map((item: CartItem) =>
            this.drugService.getDrugById(item.drugId).pipe(
              timeout(5000),
              map((drug: any) => {
                item.drugArabicName = drug?.arabicName || item.drugBrandName;
                return item;
              }),
              catchError(() => {
                item.drugArabicName = item.drugBrandName;
                return of(item);
              }),
            ),
          );

          return forkJoin(itemObservables).pipe(
            defaultIfEmpty([]),
            map((items: any) => {
              cart.items = items as CartItem[];
              return cart;
            }),
          );
        }),
        catchError(() => of(null)),
      ),
      addresses: this.addressService.getMyAddresses().pipe(
        catchError((err: any) => {
          this.errorHandler.handleError(err, 'فشل تحميل العناوين');
          return of([]);
        }),
      ),
    }).subscribe({
      next: ({ cart, addresses }) => {
        this.cart = cart;
        this.addresses = addresses || [];

        const defaultAddress = this.addresses.find((a) => a.isDefault) || this.addresses[0];
        this.selectedAddressId = defaultAddress ? defaultAddress.addressId : null;

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'حدث خطأ أثناء تحميل بيانات الطلب.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  selectAddress(addressId: string): void {
    this.selectedAddressId = addressId;
  }

  selectPaymentMethod(method: 'cod' | 'card'): void {
    if (method === 'card') {
      this.messageService.add({
        severity: 'info',
        summary: 'قريباً',
        detail: 'الدفع بالبطاقة غير متاح حالياً، يرجى استخدام الدفع عند الاستلام.',
      });
      return;
    }
    this.paymentMethod = method;
  }

  get subtotal(): number {
    return this.cart?.grandTotal || 0;
  }

  get deliveryFee(): number {
    return this.fulfillmentMode === 'Delivery' ? DELIVERY_FEE : 0;
  }

  get total(): number {
    return this.subtotal + this.deliveryFee;
  }

  get hasItems(): boolean {
    return !!this.cart && !!this.cart.items && this.cart.items.length > 0;
  }

  get canConfirm(): boolean {
    return !!this.selectedAddressId && this.hasItems && !this.isSubmitting;
  }

  trackByAddressId(index: number, address: AddressResponse): string {
    return address.addressId;
  }

  trackByItemId(index: number, item: CartItem): string {
    return item.cartItemId;
  }

  confirmOrder(): void {
    if (!this.selectedAddressId) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'يرجى اختيار عنوان التوصيل.' });
      return;
    }
    if (!this.hasItems) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'سلة المشتريات فارغة.' });
      return;
    }

    this.isSubmitting = true;
    this.orderService
      .createOrder({
        deliveryAddressId: this.selectedAddressId,
        fulfillmentMode: this.fulfillmentMode,
      })
      .subscribe({
        next: (order: OrderCreatedResponse) => {
          this.isSubmitting = false;
          this.createdOrder = order;
          this.messageService.add({
            severity: 'success',
            summary: 'تم تأكيد الطلب',
            detail: order.message || 'تم إنشاء طلبك بنجاح.',
          });
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.isSubmitting = false;
          this.errorHandler.handleError(err, 'فشل تأكيد الطلب');
          this.cdr.detectChanges();
        },
      });
  }

  goToDashboard(): void {
    this.router.navigate(['/patient/dashboard']);
  }
}