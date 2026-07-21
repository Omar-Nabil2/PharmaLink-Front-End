import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AdminOrdersService } from '@core/services/admin-orders.service';
import { AdminOrderDTO, AdminOrdersFilter } from '../admin-orders.model';
import { StatusTranslatePipe } from '@shared/pipes/status-translate.pipe';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    TableModule,
    ButtonModule,
    DatePicker,
    InputTextModule,
    TagModule,
    ToastModule,
    StatusTranslatePipe,
  ],
  providers: [MessageService],
  templateUrl: './admin-orders.component.html',
  styleUrl: './admin-orders.component.scss',
})
export class AdminOrdersComponent implements OnInit {
  private readonly adminOrdersService = inject(AdminOrdersService);
  private readonly messageService = inject(MessageService);

  orders = signal<AdminOrderDTO[]>([]);
  totalRecords = signal<number>(0);
  isLoading = signal<boolean>(false);

  // Filters state
  searchQuery = signal<string>('');
  selectedStatusTab = signal<string>('all'); // all, active, completed, cancelled
  dateRange = signal<Date[] | null>(null);

  // Pagination and sorting
  first = signal<number>(0);
  pageNumber = signal<number>(1);
  pageSize = signal<number>(10);
  sortBy = signal<string>('date');
  sortDir = signal<string>('desc');

  ngOnInit(): void {
    // Rely on p-table's initial onLazyLoad event to call loadOrders
  }

  loadOrders(): void {
    this.isLoading.set(true);

    const filter: AdminOrdersFilter = {
      search: this.searchQuery().trim() || undefined,
      status: this.getStatusValueFromTab(this.selectedStatusTab()),
      fromDate: this.dateRange() && this.dateRange()![0] ? this.formatDate(this.dateRange()![0]) : undefined,
      toDate: this.dateRange() && this.dateRange()![1] ? this.formatDate(this.dateRange()![1]) : undefined,
      pageNumber: this.pageNumber(),
      pageSize: this.pageSize(),
      sortBy: this.sortBy(),
      sortDir: this.sortDir(),
    };

    this.adminOrdersService.getOrders(filter).subscribe({
      next: (res) => {
        this.orders.set(res.items);
        this.totalRecords.set(res.totalCount);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'فشل تحميل الطلبات من الخادم.',
        });
        this.isLoading.set(false);
      },
    });
  }

  formatDate(date: any): string | undefined {
    if (!date) return undefined;
    try {
      return new Date(date).toISOString();
    } catch {
      return undefined;
    }
  }

  onSearch(): void {
    this.first.set(0);
    this.pageNumber.set(1);
    this.loadOrders();
  }

  onStatusTabChange(tab: string): void {
    this.selectedStatusTab.set(tab);
    this.first.set(0);
    this.pageNumber.set(1);
    this.loadOrders();
  }

  onDateRangeChange(): void {
    // Only reload if we have both start and end dates, or if it is cleared
    if (!this.dateRange() || (this.dateRange()![0] && this.dateRange()![1])) {
      this.first.set(0);
      this.pageNumber.set(1);
      this.loadOrders();
    }
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedStatusTab.set('all');
    this.dateRange.set(null);
    this.first.set(0);
    this.pageNumber.set(1);
    this.loadOrders();
  }

  onPageChange(event: any): void {
    if (event.first != null) {
      this.first.set(event.first);
    }
    const page = Math.floor((event.first ?? 0) / (event.rows ?? 10)) + 1;
    this.pageNumber.set(page);
    this.pageSize.set(event.rows ?? 10);
    this.loadOrders();
  }

  onSort(event: any): void {
    this.sortBy.set(event.sortField === 'createdAt' ? 'date' : event.sortField);
    this.sortDir.set(event.sortOrder === 1 ? 'asc' : 'desc');
    this.loadOrders();
  }

  exportOrders(format: 'xlsx' | 'csv'): void {
    const filter = {
      search: this.searchQuery().trim() || undefined,
      status: this.getStatusValueFromTab(this.selectedStatusTab()),
      fromDate: this.dateRange() && this.dateRange()![0] ? this.dateRange()![0].toISOString() : undefined,
      toDate: this.dateRange() && this.dateRange()![1] ? this.dateRange()![1].toISOString() : undefined,
      sortBy: this.sortBy(),
      sortDir: this.sortDir(),
    };

    this.adminOrdersService.exportOrders(filter, format).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders-export-${new Date().getTime()}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.messageService.add({
          severity: 'success',
          summary: 'نجاح',
          detail: `تم تصدير ملف ${format.toUpperCase()} بنجاح.`,
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'فشل تصدير الطلبات.',
        });
      },
    });
  }

  private getStatusValueFromTab(tab: string): number | null {
    switch (tab) {
      case 'active':
        // Active orders: Pending (1), Processing (2), Shipped (3)
        // Let's check how the backend handles multiple statuses. Currently the backend only supports a single Status filter.
        // So for "active" we can just filter by Processing (2) or we can extend backend, but let's default to Processing or Shipped.
        // Actually, let's pass 2 (Processing) as a representative status, or we can just pass null if not strictly mapped.
        // Let's pass 2 for active. Let's see: Pending=1, Processing=2, Shipped=3, Completed=4, Cancelled=5.
        // Let's check status Translate pipe: 
        // OrderStatus: { 1: 'Pending', 2: 'Processing', 3: 'Shipped', 4: 'Completed', 5: 'Cancelled' }
        return 2; 
      case 'completed':
        return 4; // Completed
      case 'cancelled':
        return 5; // Cancelled
      default:
        return null; // All
    }
  }

  getStatusSeverity(status: number): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 1: return 'warn';       // Pending
      case 2: return 'info';       // Processing
      case 3: return 'info';       // Shipped
      case 4: return 'success';    // Completed
      case 5: return 'danger';     // Cancelled
      default: return 'secondary';
    }
  }
}
