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
  1: { label: 'تم القبول',    badgeClass: 'bg-warning/20 text-warning-foreground', dotClass: 'bg-warning' },
  2: { label: 'قيد التجهيز',   badgeClass: 'bg-info/15 text-info',   dotClass: 'bg-info' },
  3: { label: 'جاهز للاستلام', badgeClass: 'bg-info/15 text-info', dotClass: 'bg-info' },
  4: { label: 'جاري التوصيل',   badgeClass: 'bg-info/15 text-info',           dotClass: 'bg-info' },
  5: { label: 'تم التسليم',    badgeClass: 'bg-accent/15 text-accent', dotClass: 'bg-accent' },
  6: { label: 'ملغى',          badgeClass: 'bg-destructive/15 text-destructive',       dotClass: 'bg-destructive' },
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
  arabicSummary: string;
  brandSummary: string;
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
