// Serialized as strings by the backend's JsonStringEnumConverter — send/expect the
// name, not the numeric value (e.g. "Delivery", not 1).
export type FulfillmentMode = 'Delivery' | 'Pickup';
export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Completed' | 'Cancelled' | 'ReadyForPickup' | 'OutForDelivery' | 'Delivered' | 'Active' | 'مكتمل' | string;

export interface CreateOrderRequest {
    deliveryAddressId: string;
    fulfillmentMode: FulfillmentMode;
}

export interface OrderItemLine {
    drugId: string;
    drugName: string;
    drugNameAr: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
}

export interface UnavailableItem {
    drugId: string;
    drugName: string;
    drugNameAr: string;
    quantityNeeded: number;
    quantityAvailable: number;
}

export interface OrderFulfillmentGroup {
    pharmacyId: string;
    branchId: string;
    branchName: string;
    distanceKm: number;
    subtotal: number;
    items: OrderItemLine[];
}

export interface OrderCreatedResponse {
    orderId: string;
    status: OrderStatus;
    message: string;
    strategy?: string;
    isFullyFulfilled?: boolean;
    totalDistanceKm?: number;
    fulfillmentGroups?: OrderFulfillmentGroup[];
    unavailableItems?: UnavailableItem[];
}

// ─── Patient Orders ───────────────────────────────────────────────────────────

export interface PatientOrderItem {
  orderItemId: string;
  drugId: string;
  drugName: string;
  genericName?: string;
  arabicName?: string;
  imageUrl?: string;
  quantityNeeded: number;
  itemStatus: string;
  strength: string;
  dosageForm: string;
  unitPrice: number;
}

export interface FulfillmentLeg {
  legId: string;
  legStatus: string;
  legType: string;
  readyByEstimate: string;
  branchId: string;
  branchName: string;
  pharmacyId: string;
  pharmacyName: string;
  pharmacyLogoUrl: string;
  branchAddressLine: string;
  city: string;
  governorate: string;
  phoneNumber: string;
  workingHours: string;
  isOpenNow: boolean;
  latitude: number;
  longitude: number;
  distanceKm: number;
  googleMapsUrl: string;
  supportsDelivery: boolean;
  supportsPickup: boolean;
  isReady: boolean;
  isCompleted: boolean;
  estimatedPreparationMinutes: number | null;
  pickupVerificationCode: string;
  items: PatientOrderItem[];
}

export interface OrderSummary {
  totalBranches: number;
  fulfilledItems: number;
  pendingItems: number;
  estimatedReadyAt: string | null;
  estimatedPreparationMinutes: number | null;
}

export interface PatientOrder {
  orderId: string;
  deliveryAddressId: string;
  fulfillmentMode: FulfillmentMode;
  orderStatus: OrderStatus;
  totalAmount: number;
  summary: OrderSummary;
  fulfillmentLegs: FulfillmentLeg[];
  pendingAssignmentItems: PatientOrderItem[];
  aiRoutingDescription?: string;
  // computed client-side (short order ref)
  orderNumber?: string;
  createdAt?: string;
}

export interface PatientOrdersResponse {
  items: PatientOrder[];
  pageNumber: number;
  totalCount: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PatientOrdersFilter {
  search?: string;
  status?: OrderStatus | null;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortDir?: string;
  pageNumber: number;
  pageSize: number;
}

// ─── Routing Preview ──────────────────────────────────────────────────────────

export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export interface OrderRoutingPreviewRequest {
  patientLocation: GeoLocation;
  cartItems: { drugId: string; quantity: number; drugName?: string; drugNameAr?: string }[];
  fulfillmentMode: FulfillmentMode;
}

export interface MissingItem {
  drugId: string;
  drugName: string;
  drugNameAr: string;
  quantityRequested: number;
}

export interface FulfilledLineItem {
  drugId: string;
  drugName: string;
  drugNameAr: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderFulfillmentLegPlan {
  pharmacyId: string;
  branchId: string;
  branchName: string;
  distanceKm: number;
  items: FulfilledLineItem[];
  legSubtotal: number;
}

export interface OrderRoutingPlan {
  strategy: string;
  legs: OrderFulfillmentLegPlan[];
  unfulfillableItems: MissingItem[];
  fulfillmentLegCount: number;
  totalDistanceKm: number;
  isFullyFulfilled: boolean;
  reasoning: string;
}