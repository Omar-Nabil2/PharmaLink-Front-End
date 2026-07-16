import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule, TableModule, BadgeModule, TagModule, ButtonModule],
  templateUrl: './patient-dashboard.component.html',
  styleUrl: './patient-dashboard.component.scss',
})
export class PatientDashboardComponent {
  itemsInCart = 3;
  activeOrders = 1;

  recentOrders = [
    { id: 'ORD-10023', status: 'In Transit', deliveryAddress: '123 Health Ave, NY', totalAmount: 45.99, date: '2026-07-16' },
    { id: 'ORD-10022', status: 'Delivered', deliveryAddress: '123 Health Ave, NY', totalAmount: 12.50, date: '2026-07-10' },
    { id: 'ORD-10021', status: 'Cancelled', deliveryAddress: '123 Health Ave, NY', totalAmount: 89.00, date: '2026-07-01' },
  ];

  prescriptionReviews = [
    { id: 'PR-901', medication: 'Amoxicillin 500mg', reviewStatus: 'Approved', doctor: 'Dr. Sarah Smith', date: '2026-07-15' },
    { id: 'PR-902', medication: 'Lisinopril 10mg', reviewStatus: 'Pending', doctor: 'Dr. John Doe', date: '2026-07-16' },
    { id: 'PR-903', medication: 'Metformin 1000mg', reviewStatus: 'Rejected', doctor: 'Dr. Sarah Smith', date: '2026-07-12' },
  ];

  getSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (status) {
      case 'Delivered':
      case 'Approved':
        return 'success';
      case 'In Transit':
      case 'Pending':
        return 'info';
      case 'Cancelled':
      case 'Rejected':
        return 'danger';
      default:
        return 'info';
    }
  }
}
