export interface DashboardStatistics {
  totalOrders: number;
  pendingPrescriptionReviews: number;
  savedAddresses: number;
  rewardPoints: number;
}

export interface ProgressTimeline {
  fulfillmentLegId: string;
  legType: string;
  status: string;
  pharmacyName: string;
  estimatedCompletionTime: string;
}

export interface CurrentOrder {
  orderId: string;
  status: string;
  progressTimeline: ProgressTimeline[];
}

export interface OrderMedicine {
  drugId: string;
  drugName: string;
  quantity: number;
}

export interface RecentOrder {
  orderId: string;
  orderNumber: string;
  orderDate: string;
  medicines: OrderMedicine[];
  totalAmount: number;
  status: string;
}

export interface PatientDashboardData {
  statistics?: DashboardStatistics;
  currentOrder?: CurrentOrder | null;
  recentOrders?: RecentOrder[];
  hasMoreOrders?: boolean;
  medicines?: { drugName: string; quantity: number }[];
  orders?: { 
    id: number | string; 
    status: string; 
    [key: string]: any; 
  }[];
  [key: string]: any; // This acts as a fallback for any other unexpected data
}