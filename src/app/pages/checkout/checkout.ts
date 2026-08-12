import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { forkJoin, of, catchError, map, switchMap, defaultIfEmpty, timeout } from 'rxjs';

import { CartService } from '../../../app/core/services/cart.service';
import { DrugService } from '../../../app/core/services/drug.service';
import { AddressService } from '../../../app/core/services/address.service';
import { OrderService } from '../../../app/core/services/order.service';
import { ErrorHandlerService } from '../../../app/core/services/error-handler.service';

import { Cart, CartItem } from '../../../app/core/interfaces/cart.interface';
import { AddressResponse } from '../../../app/core/interfaces/address.interface';
import { FulfillmentMode, OrderCreatedResponse, OrderRoutingPreviewRequest, OrderRoutingPlan } from '../../../app/core/interfaces/order.interface';

import { PrescriptionUploaderComponent } from '../../../app/shared/components/prescription-uploader/prescription-uploader';

const DELIVERY_FEE = 15;

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink, DialogModule, ButtonModule, PrescriptionUploaderComponent],
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
  isCancelling = false;
  error: string | null = null;
  createdOrder: OrderCreatedResponse | null = null;

  requiresPrescription = false;
  temporaryPrescriptionId: string | null = null;
  showPreviewModal = false;
  isPreviewing = false;
  routingPlan: OrderRoutingPlan | null = null;
  isLocating = false;

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
        
        if (this.cart && this.cart.items) {
          this.requiresPrescription = this.cart.items.some(i => i.requiresPrescription);
        }

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

  useCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'متصفحك لا يدعم تحديد الموقع' });
      return;
    }

    this.isLocating = true;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const addressData = {
          addressLine: 'الموقع الحالي من الخريطة',
          city: 'مدينة التوصيل',
          governorate: 'محافظة التوصيل',
          label: 'موقعي الحالي',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          isDefault: false
        };

        this.addressService.createAddress(addressData).subscribe({
          next: (res) => {
            this.addresses.push(res);
            this.selectedAddressId = res.addressId;
            this.isLocating = false;
            this.cdr.detectChanges();
            this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم تحديد موقعك بنجاح' });
          },
          error: (err) => {
            this.isLocating = false;
            this.cdr.detectChanges();
            this.errorHandler.handleError(err, 'فشل في حفظ الموقع الحالي');
          }
        });
      },
      (error) => {
        this.isLocating = false;
        this.cdr.detectChanges();
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'يرجى السماح بالوصول لموقعك الجغرافي' });
      }
    );
  }

  setFulfillmentMode(mode: FulfillmentMode): void {
    this.fulfillmentMode = mode;
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
    const hasPrescriptionIfNeeded = !this.requiresPrescription || !!this.temporaryPrescriptionId;
    return !!this.selectedAddressId && this.hasItems && !this.isSubmitting && hasPrescriptionIfNeeded;
  }

  trackByAddressId(index: number, address: AddressResponse): string {
    return address.addressId;
  }

  trackByItemId(index: number, item: CartItem): string {
    return item.cartItemId;
  }

  onPrescriptionUploaded(id: string): void {
    this.temporaryPrescriptionId = id || null;
  }
  showSuccessModal = false;

  confirmOrder(): void {
    if (!this.selectedAddressId) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'يرجى اختيار عنوان التوصيل.' });
      return;
    }
    if (!this.hasItems) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'سلة المشتريات فارغة.' });
      return;
    }
    if (this.requiresPrescription && !this.temporaryPrescriptionId) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'يرجى رفع الروشتة أولاً لإتمام الطلب.' });
      return;
    }

    const selectedAddress = this.addresses.find(a => a.addressId === this.selectedAddressId);
    if (!selectedAddress) return;

    this.showPreviewModal = true;
    this.isPreviewing = true;
    this.routingPlan = null;

    this.orderService.createOrder({
      deliveryAddressId: this.selectedAddressId,
      fulfillmentMode: this.fulfillmentMode,
      temporaryPrescriptionId: this.temporaryPrescriptionId ?? undefined
    }).subscribe({
      next: (order: OrderCreatedResponse) => {
        this.createdOrder = order;
        this.cartService.updateCartCount(0); // Update local cart icon immediately
        this.cartService.getCart().subscribe({ error: () => {} }); // Sync with backend

        // Build routingPlan from createdOrder to display in the preview modal
        this.routingPlan = {
          strategy: order.strategy ?? '',
          legs: order.fulfillmentGroups?.map(g => ({
            pharmacyId: g.pharmacyId,
            branchId: g.branchId,
            branchName: g.branchName,
            distanceKm: g.distanceKm,
            items: g.items.map(i => ({
              drugId: i.drugId,
              drugName: i.drugName,
              drugNameAr: i.drugNameAr,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              lineTotal: i.lineTotal
            })),
            legSubtotal: g.subtotal
          })) ?? [],
          unfulfillableItems: order.unavailableItems?.map(u => ({
            drugId: u.drugId,
            drugName: u.drugName,
            drugNameAr: u.drugNameAr,
            quantityRequested: u.quantityAvailable === 0 ? u.quantityNeeded : u.quantityNeeded - u.quantityAvailable
          })) ?? [],
          fulfillmentLegCount: order.fulfillmentGroups?.length ?? 0,
          totalDistanceKm: order.totalDistanceKm ?? 0,
          isFullyFulfilled: order.isFullyFulfilled ?? false,
          reasoning: ''
        };
        
        this.isPreviewing = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.showPreviewModal = false;
        this.isPreviewing = false;
        this.errorHandler.handleError(err, 'فشل إنشاء الطلب');
        this.cdr.detectChanges();
      }
    });
  }

  submitOrder(): void {
    // Order is already created, just show the success modal
    this.showPreviewModal = false;
    this.showSuccessModal = true;
  }

  cancelOrder(): void {
    if (this.createdOrder && this.createdOrder.orderId) {
      this.isCancelling = true;
      this.orderService.cancelOrder(this.createdOrder.orderId).subscribe({
        next: () => {
          this.isCancelling = false;
          this.showPreviewModal = false;
          this.routingPlan = null;
          this.isPreviewing = false;
          this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم إلغاء الطلب بنجاح.' });
          this.router.navigate(['/patient/dashboard']);
        },
        error: (err: any) => {
          this.isCancelling = false;
          this.showPreviewModal = false;
          this.routingPlan = null;
          this.isPreviewing = false;
          this.errorHandler.handleError(err, 'فشل إلغاء الطلب');
          this.router.navigate(['/patient/orders']);
        }
      });
    } else {
      this.showPreviewModal = false;
      this.routingPlan = null;
      this.isPreviewing = false;
      this.router.navigate(['/patient/dashboard']);
    }
  }

  goToOrders(): void {
    this.showSuccessModal = false;
    this.router.navigate(['/patient/orders']);
  }

  goToDashboard(): void {
    this.showSuccessModal = false;
    this.router.navigate(['/patient/dashboard']);
  }
}
