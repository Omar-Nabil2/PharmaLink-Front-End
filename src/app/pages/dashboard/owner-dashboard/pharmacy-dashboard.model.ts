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

export interface LegStatusConfig {
  label: string;
  badgeClass: string;
  dotClass: string;
}

export const LEG_STATUS_CONFIG: Record<number, LegStatusConfig> = {
  1: { label: 'تم التوجيه',    badgeClass: 'bg-indigo-100/80 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400', dotClass: 'bg-indigo-500' },
  2: { label: 'قيد التجهيز',   badgeClass: 'bg-amber-100/80 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',   dotClass: 'bg-amber-500' },
  3: { label: 'جاهز للاستلام', badgeClass: 'bg-purple-100/80 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400', dotClass: 'bg-purple-500' },
  4: { label: 'قيد التوصيل',   badgeClass: 'bg-sky-100/90 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400',           dotClass: 'bg-sky-500' },
  5: { label: 'تم التسليم',    badgeClass: 'bg-emerald-100/90 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400', dotClass: 'bg-emerald-500' },
  6: { label: 'ملغى',          badgeClass: 'bg-rose-100/90 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400',       dotClass: 'bg-rose-500' },
};

const STRING_TO_ORDINAL: Record<string, number> = {
  assigned: 1, preparing: 2, readyforpickup: 3, outfordelivery: 4, delivered: 5, cancelled: 6,
};

export function getLegStatusConfig(status: LegStatus): LegStatusConfig {
  const ordinal = typeof status === 'number'
    ? status
    : STRING_TO_ORDINAL[String(status).toLowerCase().replace(/\s/g, '')] ?? 0;
  return LEG_STATUS_CONFIG[ordinal] ?? {
    label: String(status),
    badgeClass: 'bg-muted text-muted-foreground border border-border',
    dotClass: 'bg-muted-foreground',
  };
}

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
