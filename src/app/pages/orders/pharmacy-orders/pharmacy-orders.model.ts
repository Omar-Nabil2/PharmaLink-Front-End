/**
 * Pharmacy Orders feature DTOs & enums — mirroring the backend C# contracts for
 * `/api/v1/pharmacy/orders`. All monetary + item data is branch-scoped by the API
 * to the authenticated pharmacy (only this pharmacy's awarded items/legs are returned).
 */

/**
 * Numeric OrderStatus values (Domain.Enums.OrderStatus).
 * 1 = Pending | 2 = Processing | 3 = Shipped | 4 = Completed | 5 = Cancelled
 */
export enum OrderStatus {
  Pending = 1,
  Processing = 2,
  Shipped = 3,
  Completed = 4,
  Cancelled = 5,
  PendingPrescriptionReview = 6,
  PrescriptionRejected = 7,
}

/**
 * Numeric FulfillmentMode values (Domain.Enums.FulfillmentMode).
 * 1 = Delivery | 2 = Pickup
 */
export enum FulfillmentMode {
  Delivery = 1,
  Pickup = 2,
}

/**
 * Numeric LegStatus values (Domain.Enums.LegStatus).
 * 1 = Assigned | 2 = Preparing | 3 = ReadyForPickup | 4 = PickedUpByCourier
 * 5 = Completed | 6 = Cancelled
 */
export enum LegStatus {
  Assigned = 1,
  Preparing = 2,
  ReadyForPickup = 3,
  PickedUpByCourier = 4,
  Completed = 5,
  Cancelled = 6,
}

/** Numeric LegType values (Domain.Enums.LegType). */
export enum LegType {
  Delivery = 1,
  Pickup = 2,
}

/** Numeric ItemStatus values (Domain.Enums.ItemStatus). */
export enum ItemStatus {
  Pending = 1,
  Fulfilled = 2,
  Cancelled = 3,
  Awarded = 4,
  Unavailable = 5,
}

/**
 * Server-side sort options (Application `PharmacyOrderSort` enum). Sent as the
 * member name; ASP.NET Core model binding resolves it to the enum value.
 */
export enum PharmacyOrderSort {
  NewestFirst = 'NewestFirst',
  OldestFirst = 'OldestFirst',
  HighestAmount = 'HighestAmount',
  LowestAmount = 'LowestAmount',
}

/** A single row in the paginated orders list (`PharmacyOrderSummaryDTO`). */
export interface PharmacyOrderSummaryDTO {
  orderId: string;
  orderNumber: string;
  patientName: string;
  orderDate: string;
  deliveryDate: string | null;
  totalAmount: number;
  legStatus?: LegStatus;
  orderStatus?: LegStatus;
  fulfillmentMode: FulfillmentMode;
  itemsCount: number;
}

/** Patient block within the order detail (`PharmacyOrderPatientDTO`). */
export interface PharmacyOrderPatientDTO {
  patientUserId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
}

/** Delivery address block within the order detail (`PharmacyOrderAddressDTO`). */
export interface PharmacyOrderAddressDTO {
  addressLine: string;
  city: string;
  governorate: string;
}

/** A single ordered medicine line, scoped to this pharmacy (`PharmacyOrderItemDTO`). */
export interface PharmacyOrderItemDTO {
  orderItemId: string;
  drugId: string;
  drugName: string;
  brandName?: string;
  arabicName?: string;
  genericName: string;
  strength: string;
  form: string;
  quantity: number;
  unitPrice: number;
  itemStatus: ItemStatus;
}

/** A fulfillment leg belonging to this pharmacy (`PharmacyOrderLegDTO`). */
export interface PharmacyOrderLegDTO {
  legId: string;
  branchId: string;
  branchName: string;
  legType: LegType;
  legStatus: LegStatus;
  readyByEstimate: string | null;
  completedAt: string | null;
}

/** Full order detail response (`PharmacyOrderDetailDTO`). */
export interface PharmacyOrderDetailDTO {
  orderId: string;
  orderNumber: string;
  legStatus?: LegStatus;
  orderStatus?: LegStatus;
  fulfillmentMode: FulfillmentMode;
  orderDate: string;
  deliveryDate: string | null;
  totalAmount: number;
  patient: PharmacyOrderPatientDTO;
  deliveryAddress: PharmacyOrderAddressDTO;
  items: PharmacyOrderItemDTO[];
  fulfillmentLegs: PharmacyOrderLegDTO[];
}

/** Query params for the orders list request (`OrderQueryParametersDto`). */
export interface PharmacyOrderQueryParams {
  search?: string | null;
  status?: LegStatus | null;
  orderDateFrom?: string | null;
  orderDateTo?: string | null;
  deliveryDateFrom?: string | null;
  deliveryDateTo?: string | null;
  sortBy?: PharmacyOrderSort;
  pageNumber?: number;
  pageSize?: number;
}

/** Generic paginated envelope (`PaginatedList<T>`). */
export interface PaginatedList<T> {
  items: T[];
  pageNumber: number;
  totalCount: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}

/** RFC 7807 problem details, as returned by the API on errors. */
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>;
}

// ── Presentation helpers ──────────────────────────────────────

/** Arabic label + soft pill badge classes for an order status. */
export interface StatusPresentation {
  label: string;
  badgeClasses: string;
}

/**
 * OrderStatus badge palette, matching the dashboard status colors:
 * Pending → warning, Processing/Shipped → info, Completed → accent, Cancelled → destructive.
 */
export const ORDER_STATUS_PRESENTATION: Record<number, StatusPresentation> = {
  [OrderStatus.Pending]: { label: 'قيد الانتظار', badgeClasses: 'bg-warning/20 text-warning-foreground' },
  [OrderStatus.Processing]: { label: 'جاري التجهيز', badgeClasses: 'bg-info/15 text-info' },
  [OrderStatus.Shipped]: { label: 'جاري التوصيل', badgeClasses: 'bg-info/15 text-info' },
  [OrderStatus.Completed]: { label: 'مكتمل', badgeClasses: 'bg-accent/15 text-accent' },
  [OrderStatus.Cancelled]: { label: 'ملغى', badgeClasses: 'bg-destructive/15 text-destructive' },
  [OrderStatus.PendingPrescriptionReview]: { label: 'مراجعة الروشتة', badgeClasses: 'bg-warning/20 text-warning-foreground' },
  [OrderStatus.PrescriptionRejected]: { label: 'روشتة مرفوضة', badgeClasses: 'bg-destructive/15 text-destructive' },
};

const FALLBACK_STATUS: StatusPresentation = { label: '—', badgeClasses: 'bg-muted text-muted-foreground' };

const STRING_TO_ORDER_STATUS: Record<string, number> = {
  pending: OrderStatus.Pending,
  processing: OrderStatus.Processing,
  shipped: OrderStatus.Shipped,
  completed: OrderStatus.Completed,
  cancelled: OrderStatus.Cancelled,
  pendingprescriptionreview: OrderStatus.PendingPrescriptionReview,
  prescriptionrejected: OrderStatus.PrescriptionRejected,
};

export function getOrderStatusPresentation(status: OrderStatus | string | number): StatusPresentation {
  const ordinal = typeof status === 'number'
    ? status
    : STRING_TO_ORDER_STATUS[String(status).toLowerCase().replace(/\s/g, '')] ?? 0;
  return ORDER_STATUS_PRESENTATION[ordinal] ?? FALLBACK_STATUS;
}

const STRING_TO_FULFILLMENT_MODE: Record<string, number> = {
  delivery: FulfillmentMode.Delivery,
  pickup: FulfillmentMode.Pickup,
};

/** Arabic label for a fulfillment mode. */
export function getFulfillmentModeLabel(mode: FulfillmentMode | string | number): string {
  const ordinal = typeof mode === 'number'
    ? mode
    : STRING_TO_FULFILLMENT_MODE[String(mode).toLowerCase().replace(/\s/g, '')] ?? 0;
  return ordinal === FulfillmentMode.Delivery ? 'توصيل' : ordinal === FulfillmentMode.Pickup ? 'استلام' : '—';
}

/** Soft pill classes for a fulfillment mode (delivery → accent, pickup → info). */
export function getFulfillmentModeClasses(mode: FulfillmentMode | string | number): string {
  const ordinal = typeof mode === 'number'
    ? mode
    : STRING_TO_FULFILLMENT_MODE[String(mode).toLowerCase().replace(/\s/g, '')] ?? 0;
  return ordinal === FulfillmentMode.Delivery ? 'bg-accent/15 text-accent' : 'bg-info/15 text-info';
}

/** Arabic labels for fulfillment leg statuses. */
export const LEG_STATUS_LABELS: Record<number, string> = {
  [LegStatus.Assigned]: 'تم القبول',
  [LegStatus.Preparing]: 'قيد التجهيز',
  [LegStatus.ReadyForPickup]: 'جاهز للاستلام',
  [LegStatus.PickedUpByCourier]: 'جاري التوصيل',
  [LegStatus.Completed]: 'تم التسليم',
  [LegStatus.Cancelled]: 'ملغى',
};

const STRING_TO_LEG_STATUS: Record<string, number> = {
  assigned: LegStatus.Assigned,
  pending: LegStatus.Assigned,
  preparing: LegStatus.Preparing,
  processing: LegStatus.Preparing,
  readyforpickup: LegStatus.ReadyForPickup,
  pickedupbycourier: LegStatus.PickedUpByCourier,
  outfordelivery: LegStatus.PickedUpByCourier,
  shipped: LegStatus.PickedUpByCourier,
  completed: LegStatus.Completed,
  delivered: LegStatus.Completed,
  cancelled: LegStatus.Cancelled,
};

export function getLegStatusLabel(status: LegStatus | string | number): string {
  const ordinal = typeof status === 'number'
    ? status
    : STRING_TO_LEG_STATUS[String(status).toLowerCase().replace(/\s/g, '')] ?? 0;
  return LEG_STATUS_LABELS[ordinal] ?? '—';
}

export function getLegStatusClasses(status: LegStatus | string | number): string {
  const ordinal = typeof status === 'number'
    ? status
    : STRING_TO_LEG_STATUS[String(status).toLowerCase().replace(/\s/g, '')] ?? 0;
  switch (ordinal) {
    case LegStatus.Completed:
      return 'bg-accent/15 text-accent';
    case LegStatus.Cancelled:
      return 'bg-destructive/15 text-destructive';
    case LegStatus.Assigned:
      return 'bg-warning/20 text-warning-foreground';
    default:
      return 'bg-info/15 text-info';
  }
}

const STRING_TO_LEG_TYPE: Record<string, number> = {
  delivery: LegType.Delivery,
  pickup: LegType.Pickup,
};

export function getLegTypeLabel(type: LegType | string | number): string {
  const ordinal = typeof type === 'number'
    ? type
    : STRING_TO_LEG_TYPE[String(type).toLowerCase().replace(/\s/g, '')] ?? 0;
  return ordinal === LegType.Delivery ? 'توصيل' : ordinal === LegType.Pickup ? 'استلام' : '—';
}

/** Dropdown options for the status filter. */
export const ORDER_STATUS_FILTER_OPTIONS: { label: string; value: LegStatus | null }[] = [
  { label: 'كل الحالات', value: null },
  { label: 'تم القبول', value: LegStatus.Assigned },
  { label: 'قيد التجهيز', value: LegStatus.Preparing },
  { label: 'جاهز للاستلام', value: LegStatus.ReadyForPickup },
  { label: 'جاري التوصيل', value: LegStatus.PickedUpByCourier },
  { label: 'تم التسليم', value: LegStatus.Completed },
  { label: 'ملغى', value: LegStatus.Cancelled },
];

/** Dropdown options for the sort selector. */
export const ORDER_SORT_OPTIONS: { label: string; value: PharmacyOrderSort }[] = [
  { label: 'الأحدث أولاً', value: PharmacyOrderSort.NewestFirst },
  { label: 'الأقدم أولاً', value: PharmacyOrderSort.OldestFirst },
  { label: 'الأعلى قيمة', value: PharmacyOrderSort.HighestAmount },
  { label: 'الأقل قيمة', value: PharmacyOrderSort.LowestAmount },
];
