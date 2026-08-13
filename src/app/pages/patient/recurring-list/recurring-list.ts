import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil, finalize } from 'rxjs';
import { RecurringPrescriptionsService, RecurringDto } from '../../../core/services/recurring-prescriptions.service';

@Component({
  selector: 'app-recurring-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './recurring-list.html',
  styleUrl: './recurring-list.scss',
})
export class RecurringList implements OnInit, OnDestroy {
  items: RecurringDto[] = [];
  isLoading = true;
  error: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(private svc: RecurringPrescriptionsService) {}

  ngOnInit() { this.load(); }

  load() {
    this.isLoading = true;
    this.error = null;
    this.svc.getAll().pipe(takeUntil(this.destroy$), finalize(() => this.isLoading = false)).subscribe({
      next: (data) => this.items = data,
      error: () => this.error = 'حدث خطأ أثناء تحميل الروشتات الدورية'
    });
  }

  pause(item: RecurringDto) {
    this.svc.pause(item.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => item.status = 'Paused',
      error: () => alert('حدث خطأ')
    });
  }

  resume(item: RecurringDto) {
    this.svc.resume(item.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => item.status = 'Active',
      error: () => alert('حدث خطأ')
    });
  }

  delete(item: RecurringDto) {
    if (!confirm(`هل تريد حذف "${item.name}"؟`)) return;
    this.svc.delete(item.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.items = this.items.filter(x => x.id !== item.id),
      error: () => alert('حدث خطأ أثناء الحذف')
    });
  }

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  getIntervalLabel(days: number): string {
    if (days === 7) return 'أسبوعياً';
    if (days === 14) return 'كل أسبوعين';
    if (days === 30) return 'شهرياً';
    if (days === 90) return 'كل 3 أشهر';
    return `كل ${days} يوم`;
  }

  getStatusBadge(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'paused': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'expired': return 'bg-slate-50 text-slate-500 border-slate-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  }

  getStatusLabel(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active': return 'نشطة';
      case 'paused': return 'موقوفة مؤقتاً';
      case 'expired': return 'منتهية';
      default: return status;
    }
  }

  getRunStatusLabel(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pendingconfirmation': return 'بانتظار تأكيدك';
      case 'confirmed': return 'مؤكد';
      case 'completed': return 'مكتمل';
      case 'skipped': return 'تم التخطي';
      case 'failed': return 'فشل';
      default: return status;
    }
  }

  getRunStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pendingconfirmation': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'confirmed': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'skipped': return 'bg-slate-50 text-slate-500 border-slate-100';
      case 'failed': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  }

  daysUntilNext(dateStr: string): string {
    const days = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
    if (days < 0) return 'متأخر!';
    if (days === 0) return 'اليوم';
    if (days === 1) return 'غداً';
    return `بعد ${days} يوم`;
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }
}
