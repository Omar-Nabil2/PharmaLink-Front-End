// Serialized as strings by the backend's JsonStringEnumConverter — send/expect the
// name, not the numeric value (e.g. "Delivery", not 1).
export type FulfillmentMode = 'Delivery' | 'Pickup';
export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Completed' | 'Cancelled';

export interface CreateOrderRequest {
    deliveryAddressId: string;
    fulfillmentMode: FulfillmentMode;
    }

export interface OrderCreatedResponse {
    orderId: string;
    status: OrderStatus;
    message: string;
    }

// ─── Patient Orders ───────────────────────────────────────────────────────────

export interface PatientOrderItem {
  orderItemId: string;
  drugId: string;
  drugName: string;
  genericName: string;
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