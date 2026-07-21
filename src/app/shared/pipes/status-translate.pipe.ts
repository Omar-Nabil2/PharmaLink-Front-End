import { Pipe, PipeTransform } from '@angular/core';

const STATUS_ARABIC_MAP: Record<string, string> = {
  // ── LegStatus ──────────────────────────────────────────────
  Assigned: 'تم القبول',
  Preparing: 'قيد التحضير',
  ReadyForPickup: 'جاهز للاستلام',
  PickedUpByCourier: 'خرج للتوصيل',
  Completed: 'مكتمل',
  // ── OrderStatus ────────────────────────────────────────────
  Pending: 'قيد الانتظار',
  Processing: 'قيد المعالجة',
  Shipped: 'تم الشحن',
  // ── Common delivery aliases ────────────────────────────────
  InDelivery: 'قيد التوصيل',
  OutForDelivery: 'خرج للتوصيل',
  Delivered: 'تم التسليم',
  // ── Shared terminal state ──────────────────────────────────
  Cancelled: 'ملغي',
  // ── ItemStatus ─────────────────────────────────────────────
  Fulfilled: 'تم التوفير',
  Awarded: 'تمت الإحالة',
  Unavailable: 'غير متوفر',
  // ── VerificationStatus ─────────────────────────────────────
  Verified: 'موثّق',
  Rejected: 'مرفوض',
  // ── UserStatus ─────────────────────────────────────────────
  Active: 'نشط',
  Inactive: 'غير نشط',
  Suspended: 'موقوف',
  // ── FulfillmentMode ────────────────────────────────────────
  Delivery: 'توصيل',
  Pickup: 'استلام',
  // ── PrescriptionReviewStatus ───────────────────────────────
  PendingReview: 'بانتظار المراجعة',
  Approved: 'مقبول',
  OrderCreated: 'تم إنشاء الطلب',
};

const ENUM_ORDINAL_MAPS: Record<string, Record<number, string>> = {
  UserStatus: { 1: 'Active', 2: 'Inactive', 3: 'Suspended' },
  VerificationStatus: { 1: 'Pending', 2: 'Verified', 3: 'Rejected' },
  FulfillmentMode: { 1: 'Delivery', 2: 'Pickup' },
  OrderStatus: { 1: 'Pending', 2: 'Processing', 3: 'Shipped', 4: 'Completed', 5: 'Cancelled' },
  ItemStatus: { 1: 'Pending', 2: 'Fulfilled', 3: 'Cancelled', 4: 'Awarded', 5: 'Unavailable' },
  LegStatus: {
    1: 'Assigned',
    2: 'Preparing',
    3: 'ReadyForPickup',
    4: 'PickedUpByCourier',
    5: 'Completed',
    6: 'Cancelled',
  },
  PrescriptionReviewStatus: {
    1: 'PendingReview',
    2: 'Approved',
    3: 'Rejected',
    4: 'OrderCreated',
  },
};

@Pipe({
  name: 'statusTranslate',
  standalone: true,
})
export class StatusTranslatePipe implements PipeTransform {
  transform(value: string | number | null | undefined, enumName?: string): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    // Resolve numeric enum values to their member name first (if we know the enum).
    let key: string;
    if (typeof value === 'number') {
      key = (enumName && ENUM_ORDINAL_MAPS[enumName]?.[value]) ?? String(value);
    } else {
      key = value.trim();
    }

    // Direct match on the member name.
    if (STATUS_ARABIC_MAP[key]) {
      return STATUS_ARABIC_MAP[key];
    }

    // Case-insensitive fallback match.
    const matchKey = Object.keys(STATUS_ARABIC_MAP).find(
      (k) => k.toLowerCase() === key.toLowerCase(),
    );

    return matchKey ? STATUS_ARABIC_MAP[matchKey] : key;
  }
}
