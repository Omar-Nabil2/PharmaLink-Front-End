import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';

import { MessageService } from 'primeng/api';

import { PharmacyService } from '../../../core/services/pharmacy.service';
import {
  NearbyPharmacyDto,
  NearbyPharmaciesRequest,
} from '../../../core/interfaces/nearby-pharmacy.interface';

@Component({
  selector: 'app-nearby-pharmacies',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    SelectButtonModule,
    PaginatorModule,
    SkeletonModule,
    ToastModule,
    TagModule,
  ],
  providers: [MessageService],
  templateUrl: './nearby-pharmacies.component.html',
  styleUrl: './nearby-pharmacies.component.scss',
})
export class NearbyPharmaciesComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject$ = new Subject<string>();

  // ── signals ────────────────────────────────────────────────────────────────
  isLocating = signal(false);
  isLoading = signal(false);
  locationError = signal<string | null>(null);
  apiError = signal<string | null>(null);

  pharmacies = signal<NearbyPharmacyDto[]>([]);
  totalCount = signal(0);

  latitude = signal<number | null>(null);
  longitude = signal<number | null>(null);

  searchTerm = '';
  selectedRadius = 10;
  isOpenFilter: boolean | undefined = undefined;
  currentPage = 1;
  pageSize = 12;

  readonly hasLocation = computed(() => this.latitude() !== null && this.longitude() !== null);
  readonly isEmpty = computed(
    () => !this.isLoading() && this.hasLocation() && this.pharmacies().length === 0,
  );

  readonly radiusOptions = [
    { label: '5 كم', value: 5 },
    { label: '10 كم', value: 10 },
    { label: '20 كم', value: 20 },
    { label: '50 كم', value: 50 },
  ];

  readonly openFilterOptions = [
    { label: 'الكل', value: undefined },
    { label: 'مفتوح الآن', value: true },
    { label: 'مغلق', value: false },
  ];

  skeletonArray = Array(8).fill(0);

  constructor(
    private readonly pharmacyService: PharmacyService,
    private readonly messageService: MessageService,
  ) {}

  ngOnInit(): void {
    // Debounced search
    this.searchSubject$
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage = 1;
        this.loadPharmacies();
      });

    this.requestLocation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── location ───────────────────────────────────────────────────────────────

  requestLocation(): void {
    if (!navigator.geolocation) {
      this.locationError.set('متصفحك لا يدعم تحديد الموقع الجغرافي.');
      return;
    }

    this.isLocating.set(true);
    this.locationError.set(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.latitude.set(position.coords.latitude);
        this.longitude.set(position.coords.longitude);
        this.isLocating.set(false);
        this.loadPharmacies();
      },
      (err) => {
        this.isLocating.set(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            this.locationError.set('لم يتم السماح بالوصول إلى موقعك. يرجى تفعيل الإذن من الإعدادات.');
            break;
          case err.POSITION_UNAVAILABLE:
            this.locationError.set('تعذّر تحديد موقعك حالياً. يرجى المحاولة مجدداً.');
            break;
          default:
            this.locationError.set('حدث خطأ أثناء تحديد الموقع.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  // ── data loading ───────────────────────────────────────────────────────────

  loadPharmacies(): void {
    const lat = this.latitude();
    const lng = this.longitude();
    if (lat === null || lng === null) return;

    this.isLoading.set(true);
    this.apiError.set(null);

    const request: NearbyPharmaciesRequest = {
      latitude: lat,
      longitude: lng,
      radiusKm: this.selectedRadius,
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      search: this.searchTerm || undefined,
      isOpen: this.isOpenFilter,
    };

    this.pharmacyService
      .getNearbyPharmacies(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.pharmacies.set(res.items);
          this.totalCount.set(res.totalCount);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.isLoading.set(false);
          const msg =
            err?.error?.errors?.message ?? 'حدث خطأ أثناء تحميل الصيدليات. يرجى المحاولة مجدداً.';
          this.apiError.set(msg);
          this.messageService.add({ severity: 'error', summary: 'خطأ', detail: msg });
        },
      });
  }

  // ── event handlers ─────────────────────────────────────────────────────────

  onSearch(value: string): void {
    this.searchTerm = value;
    this.searchSubject$.next(value);
  }

  onRadiusChange(): void {
    this.currentPage = 1;
    this.loadPharmacies();
  }

  onOpenFilterChange(): void {
    this.currentPage = 1;
    this.loadPharmacies();
  }

  onPageChange(event: PaginatorState): void {
    this.currentPage = (event.page ?? 0) + 1;
    this.pageSize = event.rows ?? 12;
    this.loadPharmacies();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── helpers ────────────────────────────────────────────────────────────────

  getGoogleMapsUrl(branch: NearbyPharmacyDto): string {
    if (branch.latitude && branch.longitude) {
      return `https://www.google.com/maps?q=${branch.latitude},${branch.longitude}`;
    }
    const addr = encodeURIComponent(`${branch.branchName} ${branch.city} ${branch.governorate}`);
    return `https://www.google.com/maps/search/${addr}`;
  }

  getNavigationUrl(branch: NearbyPharmacyDto): string {
    if (branch.latitude && branch.longitude) {
      return `https://www.google.com/maps/dir/?api=1&destination=${branch.latitude},${branch.longitude}`;
    }
    const addr = encodeURIComponent(`${branch.branchName} ${branch.city}`);
    return `https://www.google.com/maps/dir/?api=1&destination=${addr}`;
  }

  getDistanceSeverity(km: number): 'success' | 'info' | 'warn' | 'danger' {
    if (km <= 1) return 'success';
    if (km <= 5) return 'info';
    if (km <= 15) return 'warn';
    return 'danger';
  }

  trackByBranchId(_: number, branch: NearbyPharmacyDto): string {
    return branch.branchId;
  }
}
