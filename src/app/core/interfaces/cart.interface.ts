    export interface CartItemResponse {
    cartItemId: string;
    drugId: string;
    drugBrandName: string;
    drugGenericName: string;
    quantity: number;
    unitPriceSnapshot: number;
    lineTotal: number;
    }

    export interface CartResponse {
    cartId: string;
    patientUserId: string;
    createdAt: string;
    updatedAt: string;
    items: CartItemResponse[];
    grandTotal: number;
    }