export interface CartItem {
  cartItemId: string;
  drugId: string;
  drugBrandName: string;
  drugGenericName: string;
  quantity: number;
  unitPriceSnapshot: number;
  lineTotal: number;
  // Extra UI field
  drugArabicName?: string;
  loading?: boolean;
}

export interface Cart {
  cartId: string;
  patientUserId: string;
  createdAt: string;
  updatedAt: string;
  items: CartItem[];
  grandTotal: number;
}
