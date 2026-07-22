import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize, switchMap } from 'rxjs/operators';

import { GetAllPrescriptionReviewDto, PrescriptionReviewQueryDto } from '@core/interfaces/prescription-review.interface';
import { PrescriptionReviewService } from '@core/services/prescription-review.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-prescription-queue',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule, RouterLink],
  templateUrl: './prescription-queue.html',
  styleUrl: './prescription-queue.scss',
})
export class PrescriptionQueue implements OnInit, OnDestroy {
  private readonly prescriptionService = inject(PrescriptionReviewService);
  private readonly cd = inject(ChangeDetectorRef);

  reviews: GetAllPrescriptionReviewDto[] = [];
  loading = true;

  totalRecords = 0;
  first = 0;
  rows = 10;

  status = '';
  searchTerm = '';
  searchTermInput = '';

  readonly filterOptions = [
    { label: 'الكل', value: '' },
    { label: 'قيد المراجعة', value: 'PendingReview' },
    { label: 'موافق عليها', value: 'Approved' },
    { label: 'مرفوضة', value: 'Rejected' },
  ];

  private readonly searchSubject = new Subject<string>();
  private readonly loadSubject = new Subject<void>();
  private readonly subs = new Subscription();

  ngOnInit(): void {
    this.subs.add(
      this.searchSubject
        .pipe(debounceTime(500), distinctUntilChanged())
        .subscribe((term) => {
          this.searchTerm = term;
          this.first = 0;
          this.loadSubject.next();
        }),
    );

    this.subs.add(
      this.loadSubject
        .pipe(
          switchMap(() => {
            this.loading = true;
            this.cd.markForCheck();

            const query: PrescriptionReviewQueryDto = {
              pageNumber: Math.floor(this.first / this.rows) + 1,
              pageSize: this.rows,
              status: this.status,
              searchTerm: this.searchTerm,
            };

            return this.prescriptionService.getAllPrescriptionReview(query).pipe(
              finalize(() => {
                this.loading = false;
                this.cd.markForCheck();
              }),
            );
          }),
        )
        .subscribe({
          next: (res) => {
            this.reviews = res.items;
            this.totalRecords = res.totalPages * this.rows;
            this.cd.markForCheck();
          },
          error: (err) => {
            console.error('Error fetching prescription reviews', err);
            this.reviews = [];
            this.totalRecords = 0;
            this.cd.markForCheck();
          },
        }),
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    if (event.first != null) {
      this.first = event.first;
    }
    if (event.rows != null) {
      this.rows = event.rows;
    }
    this.loadSubject.next();
  }

  onSearchChange(term: string): void {
    this.searchSubject.next(term);
  }

  setFilter(statusValue: string): void {
    if (this.status === statusValue) return;
    this.status = statusValue;
    this.first = 0;
    this.loadSubject.next();
  }

  getStatusArabicLabel(status: string): string {
    const labels: Record<string, string> = {
      'PendingReview': 'قيد المراجعة',
      'Approved': 'موافق عليها',
      'Rejected': 'مرفوضة'
    };
    return labels[status] || status;
  }

  getStatusClasses(status: string): string {
    const classes: Record<string, string> = {
      'PendingReview': 'bg-amber-100 text-amber-700',
      'Approved': 'bg-emerald-100 text-emerald-700',
      'Rejected': 'bg-rose-100 text-rose-700'
    };
    return classes[status] || 'bg-gray-100 text-gray-700';
  }

  getTimeAgo(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'منذ لحظات';
    if (diffInMinutes === 1) return 'منذ دقيقة';
    if (diffInMinutes === 2) return 'منذ دقيقتين';
    if (diffInMinutes > 2 && diffInMinutes <= 10) return `منذ ${diffInMinutes} دقائق`;
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    if (diffInHours === 1) return 'منذ ساعة';
    if (diffInHours === 2) return 'منذ ساعتين';
    if (diffInHours < 24) return `منذ ${diffInHours} ساعات`;
    if (diffInDays === 1) return 'منذ يوم';
    if (diffInDays === 2) return 'منذ يومين';
    return `منذ ${diffInDays} أيام`;
  }
}
