/**
 * Inventory feature DTOs & enums — strictly mirroring the backend C# contracts
 * for `/api/v1/Inventory`.
 */

/**
 * Derived stock status returned by the server on each inventory row.
 * Numeric to match the C# enum ordinal values.
 */
export enum InventoryStockStatus {
  Available = 1,
  LowStock = 2,
  OutOfStock = 3,
}

/**
 * Query-param filter for stock status.
 * `0 = All`, `1 = Available`, `2 = LowStock`, `3 = OutOfStock`.
 */
export enum InventoryStatusFilter {
  All = 0,
  Available = 1,
  LowStock = 2,
  OutOfStock = 3,
}

/** A single row in the paginated inventory list (`GetPharmacyInventoryDTO`). */
export interface GetPharmacyInventoryDTO {
  inventoryId: string;
  branchId: string;
  branchName: string;
  drugId: string;
  drugName: string;
  arabicName: string;
  stockQuantity: number;
  reservedQuantity: number;
  unitPrice: number;
  expiryDate: string | null;
  stockStatus: InventoryStockStatus;
  stockStatusLabel: string;
}

/** Detailed single-item response (`PharmacyInventoryDto`). */
export interface PharmacyInventoryDto extends GetPharmacyInventoryDTO {
  genericName: string;
  availableQuantity: number;
  lastSyncedAt: string | null;
  /** Concurrency token (Base64 of the SQL rowversion byte array). */
  rowVersion?: string | null;
}

/** Payload to add a new medicine to a branch's inventory (`AddPharmacyInventoryDto`). */
export interface AddPharmacyInventoryDto {
  branchId: string;
  drugId: string;
  stockQuantity: number;
  unitPrice: number;
  expiryDate: string | null;
}

/** Payload to update an item / adjust stock (`UpdatePharmacyInventoryDto`). */
export interface UpdatePharmacyInventoryDto {
  stockQuantity: number;
  unitPrice: number;
  expiryDate: string | null;
  /** Concurrency token echoed back from the item read (Base64). */
  rowVersion: string | null;
}

/** Query params for the inventory list request (`GetPharmacyInventoryParamRequest`). */
export interface GetPharmacyInventoryParamRequest {
  search?: string | null;
  branchId?: string | null;
  statusFilter?: InventoryStatusFilter;
  pageNumber?: number;
  pageSize?: number;
}

/** Generic paginated envelope (`...PaginatedList`). */
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

/** Arabic label + design-token badge classes for a stock status. */
export interface StockStatusPresentation {
  label: string;
  badgeClasses: string;
}

/**
 * Badge presentation per stock status, following the dashboard palette:
 * - Available:   `bg-accent/15 text-accent`
 * - Low Stock:   `bg-warning/20 text-warning-foreground`
 * - Out of Stock:`bg-destructive/15 text-destructive`
 */
export const STOCK_STATUS_PRESENTATION: Record<InventoryStockStatus, StockStatusPresentation> = {
  [InventoryStockStatus.Available]: {
    label: 'متوفر',
    badgeClasses: 'bg-accent/15 text-accent',
  },
  [InventoryStockStatus.LowStock]: {
    label: 'كمية محدودة',
    badgeClasses: 'bg-warning/20 text-warning-foreground',
  },
  [InventoryStockStatus.OutOfStock]: {
    label: 'نفد',
    badgeClasses: 'bg-destructive/15 text-destructive',
  },
};

const FALLBACK_BADGE = 'bg-muted text-muted-foreground';

/**
 * Resolves the badge classes for a row. Prefers the server-provided
 * `stockStatus`; falls back gracefully to a neutral badge.
 */
export function getStockBadgeClasses(status: InventoryStockStatus): string {
  return STOCK_STATUS_PRESENTATION[status]?.badgeClasses ?? FALLBACK_BADGE;
}

/** Dropdown options for the status filter. */
export const INVENTORY_FILTER_OPTIONS: { label: string; value: InventoryStatusFilter }[] = [
  { label: 'كل الحالات', value: InventoryStatusFilter.All },
  { label: 'متوفر', value: InventoryStatusFilter.Available },
  { label: 'كمية محدودة', value: InventoryStatusFilter.LowStock },
  { label: 'نفد', value: InventoryStatusFilter.OutOfStock },
];
