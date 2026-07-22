import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, switchMap, of } from 'rxjs';
import { AdminPharmacyService } from '@core/services/admin-pharmacy.service';
import { ErrorHandlerService } from '@core/services/error-handler.service';
import { MessageService } from 'primeng/api';
import { environment } from '@environments/environment';
import {
  AdminPharmacySummaryDto,
  AdminCreatePharmacyRequest,
  AdminUpdatePharmacyRequest,
  GetAdminPharmaciesQuery,
  PaginatedList,
  VerificationStatus,
  PharmacyOwnerResponseDto,
} from '@core/interfaces/admin-pharmacy.interface';

type DialogMode = 'create' | 'edit';

@Component({
  selector: 'app-admin-pharmacies',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-pharmacies.component.html',
  styleUrl: './admin-pharmacies.component.scss',
})
export class AdminPharmaciesComponent implements OnInit, OnDestroy {
  // ─── Injected services ──────────────────────────────────────────────────────
  private readonly service = inject(AdminPharmacyService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly messageService = inject(MessageService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  // ─── List state ─────────────────────────────────────────────────────────────
  pharmacies: AdminPharmacySummaryDto[] = [];
  isLoading = false;
  pageNumber = 1;
  pageSize = 10;
  totalPages = 1;
  hasPreviousPage = false;
  hasNextPage = false;

  // ─── Filters ────────────────────────────────────────────────────────────────
  searchTerm = '';
  selectedStatus: VerificationStatus | null = null;
  cityFilter = '';

  private readonly searchSubject = new Subject<string>();

  // ─── Status options ──────────────────────────────────────────────────────────
  readonly statusOptions: Array<{ label: string; value: VerificationStatus | null }> = [
    { label: 'جميع الحالات', value: null },
    { label: 'قيد الانتظار', value: VerificationStatus.Pending },
    { label: 'موثقة', value: VerificationStatus.Verified },
    { label: 'مرفوضة', value: VerificationStatus.Rejected },
  ];

  readonly VerificationStatus = VerificationStatus;

  // ─── Create/Edit Dialog ──────────────────────────────────────────────────────
  showFormDialog = false;
  dialogMode: DialogMode = 'create';
  editingPharmacyId: string | null = null;
  isSaving = false;
  logoPreview: string | null = null;
  selectedFile: File | null = null;

  pharmacyForm!: FormGroup;

  // ─── Delete Dialog ────────────────────────────────────────────────────────────
  showDeleteDialog = false;
  deletingPharmacy: AdminPharmacySummaryDto | null = null;
  isDeleting = false;

  // ─── Status Change Dialog ─────────────────────────────────────────────────────
  showStatusDialog = false;
  statusChangeTarget: AdminPharmacySummaryDto | null = null;
  pendingStatus: VerificationStatus | null = null;
  isChangingStatus = false;

  // ─── Assign Owner Dialog ──────────────────────────────────────────────────────
  showAssignOwnerDialog = false;
  assignOwnerPharmacy: AdminPharmacySummaryDto | null = null;
  ownerSearchTerm = '';
  ownerSearchResults: PharmacyOwnerResponseDto[] = [];
  isSearchingOwners = false;
  selectedOwner: PharmacyOwnerResponseDto | null = null;
  isAssigning = false;

  private readonly ownerSearchSubject = new Subject<string>();

  // ─── Computed helpers ────────────────────────────────────────────────────────
  get pagesArray(): number[] {
    const start = Math.max(1, this.pageNumber - 2);
    const end = Math.min(this.totalPages, this.pageNumber + 2);
    const pages: number[] = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  // ─── Lifecycle ───────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.initForm();
    this.setupSearchDebounce();
    this.setupOwnerSearchDebounce();
    this.loadPharmacies();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─── Form setup ──────────────────────────────────────────────────────────────
  private initForm(): void {
    this.pharmacyForm = this.fb.group({
      legalName: ['', [Validators.required, Validators.minLength(2)]],
      licenseNumber: ['', [Validators.required, Validators.minLength(3)]],
      verificationStatus: [VerificationStatus.Pending, Validators.required],
    });
  }

  // ─── Search debounce ─────────────────────────────────────────────────────────
  private setupSearchDebounce(): void {
    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.pageNumber = 1;
        this.loadPharmacies();
      });
  }

  private setupOwnerSearchDebounce(): void {
    this.ownerSearchSubject
      .pipe(
        debounceTime(350),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
        switchMap((term) => {
          if (!term.trim()) {
            this.ownerSearchResults = [];
            this.isSearchingOwners = false;
            this.cdr.markForCheck();
            return of(null);
          }
          this.isSearchingOwners = true;
          this.cdr.markForCheck();
          return this.service.getPharmacyOwners({ search: term, pageSize: 15 });
        }),
      )
      .subscribe({
        next: (res) => {
          if (res) {
            this.ownerSearchResults = res.items;
          }
          this.isSearchingOwners = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.isSearchingOwners = false;
          this.cdr.markForCheck();
        },
      });
  }

  // ─── Load pharmacies ─────────────────────────────────────────────────────────
  loadPharmacies(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    const query: GetAdminPharmaciesQuery = {
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      search: this.searchTerm || undefined,
      status: this.selectedStatus ?? undefined,
      city: this.cityFilter || undefined,
    };

    this.service
      .getPharmacies(query)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: PaginatedList<AdminPharmacySummaryDto>) => {
          this.pharmacies = res.items;
          this.pageNumber = res.pageNumber;
          this.totalPages = res.totalPages;
          this.hasPreviousPage = res.hasPreviousPage;
          this.hasNextPage = res.hasNextPage;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.isLoading = false;
          this.cdr.markForCheck();
          this.errorHandler.handleError(err, 'فشل في تحميل قائمة الصيدليات');
        },
      });
  }

  // ─── Filter handlers ─────────────────────────────────────────────────────────
  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.searchSubject.next(value);
  }

  onStatusChange(status: VerificationStatus | null): void {
    this.selectedStatus = status;
    this.pageNumber = 1;
    this.loadPharmacies();
  }

  onCityChange(city: string): void {
    this.cityFilter = city;
    this.pageNumber = 1;
    this.loadPharmacies();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = null;
    this.cityFilter = '';
    this.pageNumber = 1;
    this.loadPharmacies();
  }

  // ─── Pagination ───────────────────────────────────────────────────────────────
  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.pageNumber) return;
    this.pageNumber = page;
    this.loadPharmacies();
  }

  // ─── Create dialog ───────────────────────────────────────────────────────────
  openCreateDialog(): void {
    this.dialogMode = 'create';
    this.editingPharmacyId = null;
    this.pharmacyForm.reset({
      legalName: '',
      licenseNumber: '',
      verificationStatus: VerificationStatus.Pending,
    });
    this.logoPreview = null;
    this.selectedFile = null;
    this.showFormDialog = true;
    this.cdr.markForCheck();
  }

  // ─── Edit dialog ─────────────────────────────────────────────────────────────
  openEditDialog(pharmacy: AdminPharmacySummaryDto): void {
    this.dialogMode = 'edit';
    this.editingPharmacyId = pharmacy.pharmacyId;
    this.pharmacyForm.patchValue({
      legalName: pharmacy.legalName,
      licenseNumber: pharmacy.licenseNumber,
      verificationStatus: pharmacy.verificationStatus,
    });
    this.logoPreview = pharmacy.logoUrl || null;
    this.selectedFile = null;
    this.showFormDialog = true;
    this.cdr.markForCheck();
  }

  closeFormDialog(): void {
    this.showFormDialog = false;
    this.editingPharmacyId = null;
    this.selectedFile = null;
    this.logoPreview = null;
    this.cdr.markForCheck();
  }

  // ─── Logo file picker ─────────────────────────────────────────────────────────
  onLogoFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.logoPreview = e.target?.result as string;
      this.cdr.markForCheck();
    };
    reader.readAsDataURL(file);
  }

  clearLogoFile(): void {
    this.selectedFile = null;
    this.logoPreview = null;
    this.cdr.markForCheck();
  }

  // ─── Submit create/edit ───────────────────────────────────────────────────────
  submitPharmacyForm(): void {
    if (this.pharmacyForm.invalid) {
      this.pharmacyForm.markAllAsTouched();
      return;
    }
    const { legalName, licenseNumber, verificationStatus } = this.pharmacyForm.value;
    this.isSaving = true;
    this.cdr.markForCheck();

    if (this.dialogMode === 'create') {
      const payload: AdminCreatePharmacyRequest = {
        legalName,
        licenseNumber,
        verificationStatus: verificationStatus ?? VerificationStatus.Pending,
        logoFile: this.selectedFile ?? null,
      };
      this.service
        .createPharmacy(payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.isSaving = false;
            this.closeFormDialog();
            this.messageService.add({
              severity: 'success',
              summary: 'تم الإنشاء',
              detail: 'تم إنشاء الصيدلية بنجاح',
            });
            this.loadPharmacies();
          },
          error: (err) => {
            this.isSaving = false;
            this.cdr.markForCheck();
            this.errorHandler.handleError(err, 'فشل في إنشاء الصيدلية');
          },
        });
    } else {
      const payload: AdminUpdatePharmacyRequest = {
        legalName,
        licenseNumber,
        verificationStatus,
        logoFile: this.selectedFile ?? null,
        logoUrl: !this.selectedFile ? (this.logoPreview ?? undefined) : undefined,
      };
      this.service
        .updatePharmacy(this.editingPharmacyId!, payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.isSaving = false;
            this.closeFormDialog();
            this.messageService.add({
              severity: 'success',
              summary: 'تم التعديل',
              detail: 'تم تعديل بيانات الصيدلية بنجاح',
            });
            this.loadPharmacies();
          },
          error: (err) => {
            this.isSaving = false;
            this.cdr.markForCheck();
            this.errorHandler.handleError(err, 'فشل في تعديل الصيدلية');
          },
        });
    }
  }

  // ─── Delete dialog ────────────────────────────────────────────────────────────
  openDeleteDialog(pharmacy: AdminPharmacySummaryDto): void {
    this.deletingPharmacy = pharmacy;
    this.showDeleteDialog = true;
    this.cdr.markForCheck();
  }

  closeDeleteDialog(): void {
    this.showDeleteDialog = false;
    this.deletingPharmacy = null;
    this.cdr.markForCheck();
  }

  confirmDelete(): void {
    if (!this.deletingPharmacy) return;
    this.isDeleting = true;
    this.cdr.markForCheck();

    this.service
      .deletePharmacy(this.deletingPharmacy.pharmacyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isDeleting = false;
          this.closeDeleteDialog();
          this.messageService.add({
            severity: 'success',
            summary: 'تم الحذف',
            detail: 'تم حذف الصيدلية بنجاح',
          });
          this.loadPharmacies();
        },
        error: (err) => {
          this.isDeleting = false;
          this.cdr.markForCheck();
          this.errorHandler.handleError(err, 'فشل في حذف الصيدلية');
        },
      });
  }

  // ─── Status change dialog ─────────────────────────────────────────────────────
  openStatusDialog(pharmacy: AdminPharmacySummaryDto): void {
    this.statusChangeTarget = pharmacy;
    this.pendingStatus = pharmacy.verificationStatus;
    this.showStatusDialog = true;
    this.cdr.markForCheck();
  }

  closeStatusDialog(): void {
    this.showStatusDialog = false;
    this.statusChangeTarget = null;
    this.pendingStatus = null;
    this.cdr.markForCheck();
  }

  confirmStatusChange(): void {
    if (!this.statusChangeTarget || this.pendingStatus == null) return;
    this.isChangingStatus = true;
    this.cdr.markForCheck();

    this.service
      .changePharmacyStatus(this.statusChangeTarget.pharmacyId, this.pendingStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isChangingStatus = false;
          this.closeStatusDialog();
          this.messageService.add({
            severity: 'success',
            summary: 'تم التحديث',
            detail: 'تم تغيير حالة الصيدلية بنجاح',
          });
          this.loadPharmacies();
        },
        error: (err) => {
          this.isChangingStatus = false;
          this.cdr.markForCheck();
          this.errorHandler.handleError(err, 'فشل في تغيير حالة الصيدلية');
        },
      });
  }

  // ─── Assign Owner dialog ──────────────────────────────────────────────────────
  openAssignOwnerDialog(pharmacy: AdminPharmacySummaryDto): void {
    this.assignOwnerPharmacy = pharmacy;
    this.ownerSearchTerm = '';
    this.ownerSearchResults = [];
    this.selectedOwner = null;
    this.showAssignOwnerDialog = true;
    this.cdr.markForCheck();
  }

  closeAssignOwnerDialog(): void {
    this.showAssignOwnerDialog = false;
    this.assignOwnerPharmacy = null;
    this.selectedOwner = null;
    this.ownerSearchTerm = '';
    this.ownerSearchResults = [];
    this.cdr.markForCheck();
  }

  onOwnerSearchChange(value: string): void {
    this.ownerSearchTerm = value;
    this.ownerSearchSubject.next(value);
  }

  selectOwner(owner: PharmacyOwnerResponseDto): void {
    this.selectedOwner = owner;
    this.ownerSearchTerm = owner.fullName;
    this.ownerSearchResults = [];
    this.cdr.markForCheck();
  }

  confirmAssignOwner(): void {
    if (!this.assignOwnerPharmacy || !this.selectedOwner) return;
    this.isAssigning = true;
    this.cdr.markForCheck();

    this.service
      .assignOwner(this.assignOwnerPharmacy.pharmacyId, this.selectedOwner.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isAssigning = false;
          this.closeAssignOwnerDialog();
          this.messageService.add({
            severity: 'success',
            summary: 'تم التعيين',
            detail: `تم تعيين ${this.selectedOwner?.fullName ?? ''} مالكاً للصيدلية بنجاح`,
          });
          this.loadPharmacies();
        },
        error: (err) => {
          this.isAssigning = false;
          this.cdr.markForCheck();
          this.errorHandler.handleError(err, 'فشل في تعيين مالك الصيدلية');
        },
      });
  }

  // ─── Status helpers ───────────────────────────────────────────────────────────
  /**
   * Normalizes status coming from the API as either:
   *   - number  : 1 | 2 | 3 | 4  (System.Text.Json default for byte enums)
   *   - string  : "Pending" | "Verified" | "Rejected" | "Deleted" (Newtonsoft)
   */
  private normalizeStatus(status: any): VerificationStatus | null {
    const n = Number(status);
    if (!isNaN(n) && n >= 1 && n <= 4) return n as VerificationStatus;
    // String form fallback
    const s = String(status).toLowerCase();
    if (s === 'pending')  return VerificationStatus.Pending;
    if (s === 'verified') return VerificationStatus.Verified;
    if (s === 'rejected') return VerificationStatus.Rejected;
    if (s === 'deleted')  return VerificationStatus.Deleted;
    return null;
  }

  getStatusLabel(status: any): string {
    switch (this.normalizeStatus(status)) {
      case VerificationStatus.Pending:   return 'قيد الانتظار';
      case VerificationStatus.Verified:  return 'موثقة';
      case VerificationStatus.Rejected:  return 'مرفوضة';
      case VerificationStatus.Deleted:   return 'محذوفة';
      default:                           return 'غير محدد';
    }
  }

  getStatusClass(status: any): string {
    switch (this.normalizeStatus(status)) {
      case VerificationStatus.Verified:  return 'status-verified';
      case VerificationStatus.Pending:   return 'status-pending';
      case VerificationStatus.Rejected:  return 'status-rejected';
      case VerificationStatus.Deleted:   return 'status-deleted';
      default:                           return 'status-default';
    }
  }

  // ─── Navigation ──────────────────────────────────────────────────────────────
  navigateToDetail(pharmacy: AdminPharmacySummaryDto): void {
    this.router.navigate(['/admin/pharmacies', pharmacy.pharmacyId]);
  }

  /** Concatenates branch cities with ", " separator */
  getBranchLocations(pharmacy: AdminPharmacySummaryDto): string {
    if (!pharmacy.branches || pharmacy.branches.length === 0) return '—';
    const locations = pharmacy.branches.map((b) =>
      [b.city, b.governorate].filter(Boolean).join('، '),
    );
    return [...new Set(locations)].join('، ');
  }

  /** Resolves absolute logo URL using environment.localUrl server host */
  getLogoUrl(logoUrl?: string | null): string {
    if (!logoUrl) return '';
    if (
      logoUrl.startsWith('http://') ||
      logoUrl.startsWith('https://') ||
      logoUrl.startsWith('data:') ||
      logoUrl.startsWith('blob:')
    ) {
      return logoUrl;
    }
    const host = environment.localUrl.replace(/\/api\/v1\/?$/, '');
    const path = logoUrl.startsWith('/') ? logoUrl : `/${logoUrl}`;
    return `${host}${path}`;
  }

  /** Shortens a UUID for display */
  shortId(id: string): string {
    return id ? id.slice(0, 8).toUpperCase() : '—';
  }

  trackByPharmacyId(_: number, item: AdminPharmacySummaryDto): string {
    return item.pharmacyId;
  }

  trackByOwnerId(_: number, item: PharmacyOwnerResponseDto): string {
    return item.id;
  }
}
