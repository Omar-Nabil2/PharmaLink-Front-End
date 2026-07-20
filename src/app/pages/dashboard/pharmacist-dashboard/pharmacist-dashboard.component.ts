import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-pharmacist-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule, TableModule, BadgeModule, TagModule, ButtonModule],
  templateUrl: './pharmacist-dashboard.component.html',
  styleUrl: './pharmacist-dashboard.component.scss',
})
export class pharmacistDashboardComponent {
  pendingOrders = 12;
  totalDrugs = 1450;
  completedLegsToday = 8;

  lowStockAlerts = [
    { id: 'INV-001', drugName: 'Amoxicillin 500mg', stockQuantity: 5, threshold: 20, batchNumber: 'BAT-10293' },
    { id: 'INV-002', drugName: 'Ibuprofen 400mg', stockQuantity: 12, threshold: 50, batchNumber: 'BAT-10294' },
    { id: 'INV-003', drugName: 'Lisinopril 10mg', stockQuantity: 2, threshold: 15, batchNumber: 'BAT-10295' },
    { id: 'INV-004', drugName: 'Metformin 1000mg', stockQuantity: 0, threshold: 30, batchNumber: 'BAT-10296' },
  ];

  pendingFulfillmentLegs = [
    { id: 'LEG-501', orderId: 'ORD-987', items: 3, readyByEstimate: '2026-07-16 14:00', status: 'Pending' },
    { id: 'LEG-502', orderId: 'ORD-988', items: 1, readyByEstimate: '2026-07-16 14:30', status: 'Packing' },
    { id: 'LEG-503', orderId: 'ORD-990', items: 5, readyByEstimate: '2026-07-16 15:15', status: 'Pending' },
  ];

  getSeverity(quantity: number, threshold: number): 'success' | 'info' | 'warn' | 'danger' {
    if (quantity === 0) return 'danger';
    if (quantity <= threshold / 2) return 'warn';
    return 'info';
  }

  getLegSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'Pending':
        return 'warn';
      case 'Packing':
        return 'info';
      case 'Ready':
        return 'success';
      default:
        return 'secondary';
    }
  }
}
