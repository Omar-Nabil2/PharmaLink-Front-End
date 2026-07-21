export type LegStatus =
  | 'Assigned'
  | 'Preparing'
  | 'ReadyForPickup'
  | 'OutForDelivery'
  | 'Delivered'
  | 'Cancelled'
  | string
  | number;

/** @deprecated Use {@link LegStatus}. Kept as an alias for backward compatibility. */
export type OrderStatus = LegStatus;

export interface PharmacyKpiDTO {
  totalMedicines: number;
  lowStockMedicinesCount: number;
  todaysOrdersCount: number;
  todaysOrdersChangePercent: number | null;
  monthlyRevenue: number;
  monthlyRevenueChangePercent: number | null;
}

export interface LowStockAlertDTO {
  lowStockCount: number;
  threshold: number;
  restockNeeded: boolean;
}

export interface DailySalesDTO {
  date: string;
  salesAmount: number;
}

export interface PharmacyRecentOrderDTO {
  legId: string;
  orderId: string;
  orderNumber: string;
  patientName: string;
  orderedMedicinesCount: number;
  summary: string;
  totalAmount: number;
  orderDate: string;
  legStatus: LegStatus;
  legStatusLabel: string;
}

export interface BranchesDTO {
  branchId: string;
  branchName: string;
}

export interface PharmacyDashboardDTO {
  branches: BranchesDTO[];
  kpis: PharmacyKpiDTO;
  lowStockAlert: LowStockAlertDTO;
  salesTrend: DailySalesDTO[];
  recentOrders: PharmacyRecentOrderDTO[];
}

export interface BranchOption {
  id: string;
  name: string;
}

export const ALL_BRANCHES = 'ALL';

export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  [key: string]: unknown;
}
