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
import {
  PharmacyOwnerResponseDto,
  CreatePharmacyOwnerRequest,
  UpdatePharmacyOwnerRequest,
  GetPharmacyOwnersQuery,
  PaginatedList,
  UserStatus,
  AdminPharmacySummaryDto,
} from '@core/interfaces/admin-pharmacy.interface';

type DialogMode = 'create' | 'edit';

@Component({
  selector: 'app-admin-pharmacy-owners',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-pharmacy-owners.component.html',
  styleUrl: './admin-pharmacy-owners.component.scss',
})
export class AdminPharmacyOwnersComponent implements OnInit, OnDestroy {
  // ─── Injected services ──────────────────────────────────────────────────────
  private readonly service = inject(AdminPharmacyService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly messageService = inject(MessageService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  // ─── List state ─────────────────────────────────────────────────────────────
  owners: PharmacyOwnerResponseDto[] = [];
  isLoading = false;
  pageNumber = 1;
  pageSize = 10;
  totalPages = 1;
  hasPreviousPage = false;
  hasNextPage = false;

  // ─── Filters ────────────────────────────────────────────────────────────────
  searchTerm = '';
  selectedStatus: UserStatus | null = null;
  private readonly searchSubject = new Subject<string>();

  readonly UserStatus = UserStatus;

  readonly statusOptions: Array<{ label: string; value: UserStatus | null }> = [
    { label: 'جميع الحالات', value: null },
    { label: 'نشط (Active)', value: UserStatus.Active },
    { label: 'غير نشط (Inactive)', value: UserStatus.Inactive },
    { label: 'موقوف (Suspended)', value: UserStatus.Suspended },
  ];

  // ─── Create/Edit Dialog ──────────────────────────────────────────────────────
  showFormDialog = false;
  dialogMode: DialogMode = 'create';
  editingOwnerId: string | null = null;
  isSaving = false;
  ownerForm!: FormGroup;

  // Available Pharmacies for selection in Create/Edit Dialog
  availablePharmacies: AdminPharmacySummaryDto[] = [];
  isLoadingPharmacies = false;

  // ─── Delete Dialog ────────────────────────────────────────────────────────────
  showDeleteDialog = false;
  deletingOwner: PharmacyOwnerResponseDto | null = null;
  isDeleting = false;

  // ─── Status Change Dialog ─────────────────────────────────────────────────────
  showStatusDialog = false;
  statusTarget: PharmacyOwnerResponseDto | null = null;
  pendingStatus: UserStatus | null = null;
  isChangingStatus = false;

  // ─── Assign Pharmacy Dialog ───────────────────────────────────────────────────
  showAssignPharmacyDialog = false;
  assignTargetOwner: PharmacyOwnerResponseDto | null = null;
  pharmacySearchTerm = '';
  pharmacySearchResults: AdminPharmacySummaryDto[] = [];
  isSearchingPharmacies = false;
  selectedPharmacy: AdminPharmacySummaryDto | null = null;
  isAssigning = false;
  private readonly pharmacySearchSubject = new Subject<string>();

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
    this.setupPharmacySearchDebounce();
    this.loadOwners();
    this.loadAvailablePharmacies();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─── Form Setup ──────────────────────────────────────────────────────────────
  private initForm(): void {
    this.ownerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9+ ]{8,15}$/)]],
      password: [''],
      pharmacyId: [''],
      status: [UserStatus.Active, Validators.required],
    });
  }

  // ─── Search Debounce ─────────────────────────────────────────────────────────
  private setupSearchDebounce(): void {
    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.pageNumber = 1;
        this.loadOwners();
      });
  }

  private setupPharmacySearchDebounce(): void {
    this.pharmacySearchSubject
      .pipe(
        debounceTime(350),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
        switchMap((term) => {
          if (!term.trim()) {
            this.pharmacySearchResults = [];
            this.isSearchingPharmacies = false;
            this.cdr.markForCheck();
            return of(null);
          }
          this.isSearchingPharmacies = true;
          this.cdr.markForCheck();
          return this.service.getPharmacies({ search: term, pageSize: 15 });
        }),
      )
      .subscribe({
        next: (res) => {
          if (res) {
            this.pharmacySearchResults = res.items;
          }
          this.isSearchingPharmacies = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.isSearchingPharmacies = false;
          this.cdr.markForCheck();
        },
      });
  }

  // ─── Load Owners ─────────────────────────────────────────────────────────────
  loadOwners(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    const query: GetPharmacyOwnersQuery = {
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      search: this.searchTerm || undefined,
      status: this.selectedStatus ?? undefined,
    };

    this.service
      .getPharmacyOwners(query)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: PaginatedList<PharmacyOwnerResponseDto>) => {
          this.owners = res.items;
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
          this.errorHandler.handleError(err, 'فشل في تحميل قائمة مالكي الصيدليات');
        },
      });
  }

  private loadAvailablePharmacies(): void {
    this.isLoadingPharmacies = true;
    this.service
      .getPharmacies({ pageSize: 100 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.availablePharmacies = res.items;
          this.isLoadingPharmacies = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.isLoadingPharmacies = false;
          this.cdr.markForCheck();
        },
      });
  }

  // ─── Filter handlers ─────────────────────────────────────────────────────────
  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.searchSubject.next(value);
  }

  onStatusFilterChange(status: UserStatus | null): void {
    this.selectedStatus = status;
    this.pageNumber = 1;
    this.loadOwners();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = null;
    this.pageNumber = 1;
    this.loadOwners();
  }

  // ─── Pagination ───────────────────────────────────────────────────────────────
  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.pageNumber) return;
    this.pageNumber = page;
    this.loadOwners();
  }

  // ─── Create Dialog ───────────────────────────────────────────────────────────
  openCreateDialog(): void {
    this.dialogMode = 'create';
    this.editingOwnerId = null;
    this.ownerForm.reset({
      fullName: '',
      email: '',
      phoneNumber: '',
      password: '',
      pharmacyId: '',
      status: UserStatus.Active,
    });
    this.ownerForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.ownerForm.get('password')?.updateValueAndValidity();
    this.showFormDialog = true;
    this.cdr.markForCheck();
  }

  // ─── Edit Dialog ─────────────────────────────────────────────────────────────
  openEditDialog(owner: PharmacyOwnerResponseDto): void {
    this.dialogMode = 'edit';
    this.editingOwnerId = owner.id;
    this.ownerForm.reset({
      fullName: owner.fullName,
      email: owner.email,
      phoneNumber: owner.phoneNumber,
      password: '',
      pharmacyId: owner.pharmacyId || '',
      status: this.normalizeStatus(owner.status) ?? UserStatus.Active,
    });
    this.ownerForm.get('password')?.clearValidators();
    this.ownerForm.get('password')?.updateValueAndValidity();
    this.showFormDialog = true;
    this.cdr.markForCheck();
  }

  closeFormDialog(): void {
    this.showFormDialog = false;
    this.editingOwnerId = null;
    this.cdr.markForCheck();
  }

  // ─── Submit Create / Edit ─────────────────────────────────────────────────────
  submitOwnerForm(): void {
    if (this.ownerForm.invalid) {
      this.ownerForm.markAllAsTouched();
      return;
    }

    const { fullName, email, phoneNumber, password, pharmacyId, status } = this.ownerForm.value;
    this.isSaving = true;
    this.cdr.markForCheck();

    if (this.dialogMode === 'create') {
      const payload: CreatePharmacyOwnerRequest = {
        fullName: fullName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        password: password ? password.trim() : '',
        pharmacyId: pharmacyId || undefined,
      };

      this.service
        .createPharmacyOwner(payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.isSaving = false;
            this.closeFormDialog();
            this.messageService.add({
              severity: 'success',
              summary: 'تم الإنشاء',
              detail: 'تم إنشاء حساب مالك الصيدلية بنجاح',
            });
            this.loadOwners();
          },
          error: (err) => {
            this.isSaving = false;
            this.cdr.markForCheck();
            this.errorHandler.handleError(err, 'فشل في إنشاء حساب المالك');
          },
        });
    } else {
      const payload: UpdatePharmacyOwnerRequest = {
        fullName: fullName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        pharmacyId: pharmacyId || null,
        status: status ?? UserStatus.Active,
        password: password ? password.trim() : null,
      };

      this.service
        .updatePharmacyOwner(this.editingOwnerId!, payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.isSaving = false;
            this.closeFormDialog();
            this.messageService.add({
              severity: 'success',
              summary: 'تم التعديل',
              detail: 'تم تعديل بيانات مالك الصيدلية بنجاح',
            });
            this.loadOwners();
          },
          error: (err) => {
            this.isSaving = false;
            this.cdr.markForCheck();
            this.errorHandler.handleError(err, 'فشل في تعديل بيانات المالك');
          },
        });
    }
  }

  // ─── Delete Dialog ────────────────────────────────────────────────────────────
  openDeleteDialog(owner: PharmacyOwnerResponseDto): void {
    this.deletingOwner = owner;
    this.showDeleteDialog = true;
    this.cdr.markForCheck();
  }

  closeDeleteDialog(): void {
    this.showDeleteDialog = false;
    this.deletingOwner = null;
    this.cdr.markForCheck();
  }

  confirmDelete(): void {
    if (!this.deletingOwner) return;
    this.isDeleting = true;
    this.cdr.markForCheck();

    this.service
      .deletePharmacyOwner(this.deletingOwner.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isDeleting = false;
          this.closeDeleteDialog();
          this.messageService.add({
            severity: 'success',
            summary: 'تم إلغاء التفعيل',
            detail: 'تم تغيير حالة المالك إلى غير نشط بنجاح',
          });
          this.loadOwners();
        },
        error: (err) => {
          this.isDeleting = false;
          this.cdr.markForCheck();
          this.errorHandler.handleError(err, 'فشل في إيقاف حساب المالك');
        },
      });
  }

  // ─── Status Change Dialog ─────────────────────────────────────────────────────
  openStatusDialog(owner: PharmacyOwnerResponseDto): void {
    this.statusTarget = owner;
    this.pendingStatus = this.normalizeStatus(owner.status) ?? UserStatus.Active;
    this.showStatusDialog = true;
    this.cdr.markForCheck();
  }

  closeStatusDialog(): void {
    this.showStatusDialog = false;
    this.statusTarget = null;
    this.pendingStatus = null;
    this.cdr.markForCheck();
  }

  confirmStatusChange(): void {
    if (!this.statusTarget || this.pendingStatus == null) return;
    this.isChangingStatus = true;
    this.cdr.markForCheck();

    this.service
      .changePharmacyOwnerStatus(this.statusTarget.id, this.pendingStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isChangingStatus = false;
          this.closeStatusDialog();
          this.messageService.add({
            severity: 'success',
            summary: 'تم التحديث',
            detail: 'تم تغيير حالة حساب المالك بنجاح',
          });
          this.loadOwners();
        },
        error: (err) => {
          this.isChangingStatus = false;
          this.cdr.markForCheck();
          this.errorHandler.handleError(err, 'فشل في تغيير حالة حساب المالك');
        },
      });
  }

  // ─── Assign Pharmacy Dialog ───────────────────────────────────────────────────
  openAssignPharmacyDialog(owner: PharmacyOwnerResponseDto): void {
    this.assignTargetOwner = owner;
    this.pharmacySearchTerm = '';
    this.pharmacySearchResults = [];
    this.selectedPharmacy = null;
    this.showAssignPharmacyDialog = true;
    this.cdr.markForCheck();
  }

  closeAssignPharmacyDialog(): void {
    this.showAssignPharmacyDialog = false;
    this.assignTargetOwner = null;
    this.selectedPharmacy = null;
    this.pharmacySearchTerm = '';
    this.pharmacySearchResults = [];
    this.cdr.markForCheck();
  }

  onPharmacySearchChange(value: string): void {
    this.pharmacySearchTerm = value;
    this.pharmacySearchSubject.next(value);
  }

  selectPharmacy(pharmacy: AdminPharmacySummaryDto): void {
    this.selectedPharmacy = pharmacy;
    this.pharmacySearchTerm = pharmacy.legalName;
    this.pharmacySearchResults = [];
    this.cdr.markForCheck();
  }

  confirmAssignPharmacy(): void {
    if (!this.assignTargetOwner || !this.selectedPharmacy) return;
    this.isAssigning = true;
    this.cdr.markForCheck();

    this.service
      .assignPharmacyToOwner(this.assignTargetOwner.id, this.selectedPharmacy.pharmacyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isAssigning = false;
          this.closeAssignPharmacyDialog();
          this.messageService.add({
            severity: 'success',
            summary: 'تم التعيين',
            detail: `تم تعيين صيدلية «${this.selectedPharmacy?.legalName}» للمالك بنجاح`,
          });
          this.loadOwners();
        },
        error: (err) => {
          this.isAssigning = false;
          this.cdr.markForCheck();
          this.errorHandler.handleError(err, 'فشل في تعيين الصيدلية للمالك');
        },
      });
  }

  // ─── Status Helpers ───────────────────────────────────────────────────────────
  normalizeStatus(status: any): UserStatus | null {
    const n = Number(status);
    if (!isNaN(n) && n >= 1 && n <= 3) return n as UserStatus;
    const s = String(status).toLowerCase();
    if (s === 'active')    return UserStatus.Active;
    if (s === 'inactive')  return UserStatus.Inactive;
    if (s === 'suspended') return UserStatus.Suspended;
    return null;
  }

  getStatusLabel(status: any): string {
    switch (this.normalizeStatus(status)) {
      case UserStatus.Active:    return 'نشط';
      case UserStatus.Inactive:  return 'غير نشط';
      case UserStatus.Suspended: return 'موقوف';
      default:                   return 'غير محدد';
    }
  }

  getStatusClass(status: any): string {
    switch (this.normalizeStatus(status)) {
      case UserStatus.Active:    return 'status-active';
      case UserStatus.Inactive:  return 'status-inactive';
      case UserStatus.Suspended: return 'status-suspended';
      default:                   return 'status-default';
    }
  }

  trackByOwnerId(_: number, item: PharmacyOwnerResponseDto): string {
    return item.id;
  }

  trackByPharmacyId(_: number, item: AdminPharmacySummaryDto): string {
    return item.pharmacyId;
  }
}
