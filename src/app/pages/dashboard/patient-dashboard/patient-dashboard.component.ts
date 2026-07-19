import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TimelineModule } from 'primeng/timeline';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageModule } from 'primeng/message';
import { finalize } from 'rxjs';

import { PatientDashboardService } from '../../../core/services/patient-dashboard.service';
import { PatientDashboardData } from '../../../core/interfaces/patient-dashboard.interface';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterLink, CardModule, TableModule, BadgeModule,
    TagModule, ButtonModule, TimelineModule, SkeletonModule, MessageModule
  ],
  templateUrl: './patient-dashboard.component.html',
  styleUrl: './patient-dashboard.component.scss',
})
export class PatientDashboardComponent implements OnInit {
  private dashboardService = inject(PatientDashboardService);
  private cdr = inject(ChangeDetectorRef); // لإجبار Angular على تحديث الواجهة

  dashboardData: PatientDashboardData | null = null;
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;
    
    this.dashboardService.getDashboardData()
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.markForCheck(); // التأكد من إيقاف الـ loading في الواجهة
      }))
      .subscribe({
        next: (data) => {
          console.log('API Response Data:', data); // فحص البيانات هنا
          this.dashboardData = data;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error fetching dashboard data:', err);
          this.error = 'Failed to load dashboard data. Please try again later.';
          this.cdr.markForCheck();
        }
      });
  }

  getMedicineNames(medicines: { drugName: string; quantity: number }[] | undefined): string {
    if (!medicines || medicines.length === 0) return 'No medicines';
    return medicines.map(m => `${m.drugName} (x${m.quantity})`).join(', ');
  }

  getSeverity(status: string | undefined): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    if (!status) return 'secondary';
    switch (status.toLowerCase()) {
      case 'delivered': case 'completed': case 'approved': return 'success';
      case 'pending': case 'assigned': case 'preparation': return 'info';
      case 'in transit': case 'shipped': return 'warn';
      case 'cancelled': case 'rejected': return 'danger';
      default: return 'secondary';
    }
  }
}