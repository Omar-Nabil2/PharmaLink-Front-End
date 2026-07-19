import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MessageService } from 'primeng/api';

import { CartService } from '../../core/services/cart.service';
import { AddressService } from '../../core/services/address.service';
import { OrderService } from '../../core/services/order.service';
import { ErrorHandlerService } from '../../core/services/error-handler.service';

import { CartResponse } from '../../core/interfaces/cart.interface';
import { AddressResponse } from '../../core/interfaces/address.interface';
import { FulfillmentMode, OrderCreatedResponse } from '../../core/interfaces/order.interface';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.html',
})
export class CartComponent implements OnInit {
  cart: CartResponse | null = null;
  addresses: AddressResponse[] = [];

  selectedAddressId: string | null = null;
  fulfillmentMode: FulfillmentMode = 'Delivery';

  isLoading = true;
  loadFailed = false;

  isSubmitting = false;
  orderResult: OrderCreatedResponse | null = null;

  constructor(
    private readonly cartService: CartService,
    private readonly addressService: AddressService,
    private readonly orderService: OrderService,
    private readonly errorHandlerService: ErrorHandlerService,
    private readonly messageService: MessageService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.loadCheckoutData();
  }

  loadCheckoutData(): void {
    this.isLoading = true;
    this.loadFailed = false;

    forkJoin({
      cart: this.cartService.getCart(),
      addresses: this.addressService.getMyAddresses(),
    }).subscribe({
      next: ({ cart, addresses }) => {
        this.cart = cart;
        this.addresses = addresses;
        this.isLoading = false;

        const defaultAddress = addresses.find((a) => a.isDefault);
        this.selectedAddressId = defaultAddress?.addressId ?? addresses[0]?.addressId ?? null;
      },
      error: (err) => {
        this.isLoading = false;
        this.loadFailed = true;
        this.errorHandlerService.handleError(err, 'Failed to Load Cart');
      },
    });
  }

  selectAddress(addressId: string): void {
    this.selectedAddressId = addressId;
  }

  setFulfillmentMode(mode: FulfillmentMode): void {
    this.fulfillmentMode = mode;
  }

  get hasItems(): boolean {
    return !!this.cart && this.cart.items.length > 0;
  }

  get canSubmit(): boolean {
    return this.hasItems && !!this.selectedAddressId && !this.isSubmitting;
  }

  placeOrder(): void {
    if (!this.canSubmit || !this.selectedAddressId) return;

    this.isSubmitting = true;

    this.orderService
      .createOrder({
        deliveryAddressId: this.selectedAddressId,
        fulfillmentMode: this.fulfillmentMode,
      })
      .subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.orderResult = response;

          this.messageService.add({
            severity: 'success',
            summary: 'Order Placed',
            detail: response.message || 'Your order has been created successfully.',
          });
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorHandlerService.handleError(err, 'Failed to Place Order');
        },
      });
  }

  goToOrderHistory(): void {
    this.router.navigate(['/patient/orders']);
  }

  goToCatalog(): void {
    this.router.navigate(['/patient/drugs']);
  }
}