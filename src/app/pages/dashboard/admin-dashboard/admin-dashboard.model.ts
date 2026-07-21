/** Platform-wide KPI counts for the four stat cards. */
export interface AdminPlatformStatsDTO {
  totalPatients: number;
  totalPharmacies: number;
  totalOrders: number;
  totalMedicines: number;
}

/** Order count for a single calendar day. */
export interface AdminDailyOrderCountDTO {
  /** ISO date string e.g. "2026-06-22" */
  date: string;
  count: number;
}

/** Order analytics: 30-day daily trend + status distribution. */
export interface AdminOrderAnalyticsDTO {
  dailyOrdersLast30Days: AdminDailyOrderCountDTO[];
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  completedOrders: number;
  cancelledOrders: number;
}

/**
 * Numeric OrderStatus values from the backend Domain.Enums.OrderStatus byte enum.
 *  1 = Pending | 2 = Processing | 3 = Shipped | 4 = Completed | 5 = Cancelled
 */
export type OrderStatusValue = 1 | 2 | 3 | 4 | 5 | number;

/** Summary row in the Recent Orders table. */
export interface AdminRecentOrderDTO {
  orderId: string;
  orderNumber: string;
  patientName: string;
  totalAmount: number;
  status: OrderStatusValue;
  createdAt: string;
}

/** Entry in the Top Pharmacies list. */
export interface AdminTopPharmacyDTO {
  pharmacyId: string;
  pharmacyName: string;
  /** Computed star rating 0–5 */
  rating: number;
  primaryAddress: string;
  totalOrders: number;
}

/** Full admin dashboard response from GET /api/v1/admin/dashboard */
export interface AdminDashboardDTO {
  platformStats: AdminPlatformStatsDTO;
  orderAnalytics: AdminOrderAnalyticsDTO;
  recentOrders: AdminRecentOrderDTO[];
  topPharmacies: AdminTopPharmacyDTO[];
}

/** RFC 7807 problem details used for error handling. */
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  [key: string]: unknown;
}
