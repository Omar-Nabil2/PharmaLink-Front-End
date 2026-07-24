import { OrderStatusValue } from '@pages/dashboard/admin-dashboard/admin-dashboard.model';

export interface PaginatedList<T> {
  items: T[];
  pageNumber: number;
  totalCount: number;
  pageSize: number;
}

export type FulfillmentModeValue = 1 | 2 | string | number; // 1 = Delivery, 2 = Pickup

export interface AdminOrderDTO {
  orderId: string;
  orderNumber: string;
  patientName: string;
  primaryPharmacyName: string;
  medicineNames: string[];
  totalAmount: number;
  orderStatus: OrderStatusValue;
  fulfillmentMode: FulfillmentModeValue;
  createdAt: string;
  itemCount: number;
}

export interface AdminOrderItemDTO {
  orderItemId: string;
  drugId: string;
  drugName: string;
  genericName?: string;
  strength: string;
  dosageForm: string;
  quantityNeeded: number;
  unitPrice: number;
  lineTotal: number;
  itemStatus: number; // ItemStatus enum
}

export interface AdminOrderLegDTO {
  legId: string;
  legType: number; // LegType enum
  legStatus: number; // LegStatus enum
  pharmacyName: string;
  branchName: string;
  city: string;
  readyByEstimate: string;
  medicineNames: string[];
  completedAt: string;
}

export interface AdminOrderDetailDTO {
  orderId: string;
  orderNumber: string;
  patientName: string;
  patientEmail: string;
  totalAmount: number;
  orderStatus: OrderStatusValue;
  fulfillmentMode: FulfillmentModeValue;
  createdAt: string;
  deliveredAt?: string;
  deliveryAddress: string;
  items: AdminOrderItemDTO[];
  fulfillmentLegs: AdminOrderLegDTO[];
}

export interface AdminOrdersFilter {
  search?: string;
  status?: OrderStatusValue | null;
  fulfillmentMode?: number | null;
  legStatus?: number | null;
  fromDate?: string;
  toDate?: string;
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDir: string;
}
