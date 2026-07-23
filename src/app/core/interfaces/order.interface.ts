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