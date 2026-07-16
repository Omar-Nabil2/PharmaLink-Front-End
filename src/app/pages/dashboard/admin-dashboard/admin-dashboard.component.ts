import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule, TableModule, BadgeModule, TagModule, ButtonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent {
  totalRegisteredUsers = 12450;
  totalPharmacies = 320;
  totalDrugsInSystem = 4500;

  pendingVerifications = [
    { id: 'PHARM-89', name: 'City Central Pharmacy', licenseNumber: 'LIC-099182', requestDate: '2026-07-16', status: 'Pending' },
    { id: 'PHARM-90', name: 'Wellness Meds Inc', licenseNumber: 'LIC-772819', requestDate: '2026-07-15', status: 'Under Review' },
    { id: 'PHARM-91', name: 'Downtown Care', licenseNumber: 'LIC-110023', requestDate: '2026-07-12', status: 'Pending' },
  ];

  recentAudits = [
    { id: 'AUD-5521', legId: 'LEG-501', previousStatus: 'Pending', newStatus: 'Packing', timestamp: '2026-07-16 14:02:10', modifiedBy: 'System' },
    { id: 'AUD-5520', legId: 'LEG-499', previousStatus: 'Packing', newStatus: 'Ready', timestamp: '2026-07-16 13:45:00', modifiedBy: 'user_pharma1' },
    { id: 'AUD-5519', legId: 'LEG-499', previousStatus: 'Pending', newStatus: 'Packing', timestamp: '2026-07-16 12:10:00', modifiedBy: 'System' },
    { id: 'AUD-5518', legId: 'LEG-495', previousStatus: 'Ready', newStatus: 'Completed', timestamp: '2026-07-16 11:30:25', modifiedBy: 'user_driver12' },
  ];

  getVerificationSeverity(status: string): 'info' | 'warn' | 'success' | 'danger' {
    switch (status) {
      case 'Pending':
        return 'warn';
      case 'Under Review':
        return 'info';
      case 'Approved':
        return 'success';
      case 'Rejected':
        return 'danger';
      default:
        return 'info';
    }
  }

  getAuditStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'Pending': return 'warn';
      case 'Packing': return 'info';
      case 'Ready': return 'success';
      case 'Completed': return 'success';
      case 'Failed': return 'danger';
      default: return 'secondary';
    }
  }
}
