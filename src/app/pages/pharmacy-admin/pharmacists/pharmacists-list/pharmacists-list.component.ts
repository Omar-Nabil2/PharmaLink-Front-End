import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, EMPTY } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil, catchError } from 'rxjs/operators';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { PharmacistManagementService } from '@core/services/pharmacist-management.service';
import { PharmacyBranchService } from '../../../branches/pharmacy-branch.service';
import {
  CreatePharmacistRequest,
  PharmacistSummaryDTO,
  UpdatePharmacistRequest,
  UserStatus,
} from '@core/models/pharmacist-management.model';
import { GetPharmacyBranchResponseDTO } from '../../../branches/pharmacy-branch.model';

/** Validation error map: field name → error message */
interface FieldErrors {
  [field: string]: string;
}

@Component({
  selector: 'app-pharmacists-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ToastModule, DialogModule],
  providers: [MessageService],
  templateUrl: './pharmacists-list.component.html',
  styleUrl: './pharmacists-list.component.scss',
})
export class PharmacistsListComponent implements OnInit, OnDestroy {
  private readonly svc = inject(PharmacistManagementService);
  private readonly branchSvc = inject(PharmacyBranchService);
  private readonly msg = inject(MessageService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject$ = new Subject<string>();

  // ── List state ─────────────────────────────────────────────────────
  pharmacists: PharmacistSummaryDTO[] = [];
  branches: GetPharmacyBranchResponseDTO[] = [];
  isLoading = false;
  totalCount = 0;
  pageNumber = 1;
  pageSize = 10;

  searchTerm = '';
  selectedBranchId: string | null = null;
  selectedStatus: number | null = null;

  // ── Create form ────────────────────────────────────────────────────
  showCreateModal = false;
  isSaving = false;
  createForm: CreatePharmacistRequest = {
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    branchId: '',
  };
  createErrors: FieldErrors = {};

  // ── Edit form ──────────────────────────────────────────────────────
  showEditModal = false;
  isUpdating = false;
  editingId = '';
  editForm: UpdatePharmacistRequest = { fullName: '', phoneNumber: '', password: '' };
  editErrors: FieldErrors = {};

  // ── Status change ──────────────────────────────────────────────────
  showStatusModal = false;
  isChangingStatus = false;
  statusTargetId = '';
  statusTargetName = '';
  newStatus: UserStatus = UserStatus.Active;

  // ── Delete ─────────────────────────────────────────────────────────
  showDeleteModal = false;
  isDeleting = false;
  deleteTargetId = '';
  deleteTargetName = '';

  // ── Assign Branch ──────────────────────────────────────────────────
  showAssignModal = false;
  isAssigningBranch = false;
  assignTargetId = '';
  assignTargetName = '';
  assignCurrentBranchId = '';
  assignSelectedBranchId = '';
  assignError = '';

  // ── Computed ───────────────────────────────────────────────────────
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalCount / this.pageSize));
  }

  get pagesArray(): number[] {
    const pages: number[] = [];
    for (
      let i = Math.max(1, this.pageNumber - 2);
      i <= Math.min(this.totalPages, this.pageNumber + 2);
      i++
    ) {
      pages.push(i);
    }
    return pages;
  }

  get hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.selectedBranchId || this.selectedStatus !== null);
  }

  // ── Lifecycle ──────────────────────────────────────────────────────
  ngOnInit(): void {
    this.searchSubject$
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.pageNumber = 1;
        this.loadPharmacists();
      });
    this.loadBranches();
    this.loadPharmacists();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Data loading ───────────────────────────────────────────────────
  loadBranches(): void {
    this.branchSvc
      .getBranches({ search: null, pageNumber: 1, pageSize: 100 })
      .pipe(catchError(() => EMPTY), takeUntil(this.destroy$))
      .subscribe((res) => {
        this.branches = res?.items ?? [];
        this.cdr.markForCheck();
      });
  }

  loadPharmacists(): void {
    this.isLoading = true;
    this.cdr.markForCheck();
    this.svc
      .getAllPharmacists({
        pageNumber: this.pageNumber,
        pageSize: this.pageSize,
        search: this.searchTerm || undefined,
        branchId: this.selectedBranchId ?? undefined,
        userStatus: this.selectedStatus ?? undefined,
      })
      .pipe(
        catchError(() => {
          this.isLoading = false;
          this.msg.add({ severity: 'error', summary: 'خطأ', detail: 'فشل تحميل قائمة الصيادلة' });
          this.cdr.markForCheck();
          return EMPTY;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((res) => {
        this.pharmacists = res?.items ?? [];
        this.totalCount = res?.totalCount ?? 0;
        this.isLoading = false;
        this.cdr.markForCheck();
      });
  }

  // ── Toolbar ────────────────────────────────────────────────────────
  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.searchSubject$.next(value);
  }

  onFilterChange(): void {
    this.pageNumber = 1;
    this.loadPharmacists();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedBranchId = null;
    this.selectedStatus = null;
    this.pageNumber = 1;
    this.loadPharmacists();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.pageNumber = page;
    this.loadPharmacists();
  }

  viewDetails(rawId: any): void {
    const id = typeof rawId === 'string'
      ? rawId
      : (rawId?.pharmacistId || rawId?.id || rawId?.Id || rawId?.PharmacistId);
    if (id) {
      this.router.navigate(['/owner/pharmacists', id]);
    } else {
      this.msg.add({ severity: 'warn', summary: 'تنبيه', detail: 'معرّف الصيدلي غير متاح' });
    }
  }

  // ════════════════════════════════════════════════════════════════════
  //  CREATE MODAL
  // ════════════════════════════════════════════════════════════════════
  openCreateModal(): void {
    this.createForm = {
      fullName: '',
      email: '',
      phoneNumber: '',
      password: '',
      branchId: this.branches[0]?.branchId ?? '',
    };
    this.createErrors = {};
    this.showCreateModal = true;
    this.cdr.markForCheck();
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.createErrors = {};
  }

  /** Returns true when all create fields are valid */
  private validateCreate(): boolean {
    const e: FieldErrors = {};
    const name = this.createForm.fullName.trim();
    const email = this.createForm.email.trim();
    const phone = this.createForm.phoneNumber.trim();
    const pass = this.createForm.password;
    const branch = this.createForm.branchId;

    if (!name) {
      e['fullName'] = 'الاسم الكامل مطلوب';
    } else if (name.length < 3) {
      e['fullName'] = 'الاسم يجب أن يكون 3 أحرف على الأقل';
    } else if (name.length > 100) {
      e['fullName'] = 'الاسم يجب ألا يتجاوز 100 حرف';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      e['email'] = 'البريد الإلكتروني مطلوب';
    } else if (!emailRegex.test(email)) {
      e['email'] = 'صيغة البريد الإلكتروني غير صحيحة';
    }

    const phoneRegex = /^(010|011|012|015)\d{8}$/;
    if (!phone) {
      e['phoneNumber'] = 'رقم الهاتف مطلوب';
    } else if (!phoneRegex.test(phone)) {
      e['phoneNumber'] = 'رقم الهاتف يجب أن يبدأ بـ 010/011/012/015 ويتكون من 11 رقماً';
    }

    if (!pass) {
      e['password'] = 'كلمة المرور مطلوبة';
    } else if (pass.length < 8) {
      e['password'] = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    } else if (!/[A-Z]/.test(pass)) {
      e['password'] = 'يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل';
    } else if (!/[a-z]/.test(pass)) {
      e['password'] = 'يجب أن تحتوي كلمة المرور على حرف صغير واحد على الأقل';
    } else if (!/\d/.test(pass)) {
      e['password'] = 'يجب أن تحتوي كلمة المرور على رقم واحد على الأقل';
    } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass)) {
      e['password'] = 'يجب أن تحتوي كلمة المرور على رمز خاص واحد على الأقل';
    }

    if (!branch) {
      e['branchId'] = 'يرجى اختيار الفرع المعين';
    }

    this.createErrors = e;
    this.cdr.markForCheck();
    return Object.keys(e).length === 0;
  }

  submitCreate(): void {
    if (!this.validateCreate()) return;

    this.isSaving = true;
    this.cdr.markForCheck();

    const payload: CreatePharmacistRequest = {
      fullName: this.createForm.fullName.trim(),
      email: this.createForm.email.trim().toLowerCase(),
      phoneNumber: this.createForm.phoneNumber.trim(),
      password: this.createForm.password,
      branchId: this.createForm.branchId,
    };

    this.svc
      .createPharmacist(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.showCreateModal = false;
          this.msg.add({ severity: 'success', summary: 'نجاح', detail: 'تم إنشاء حساب الصيدلي بنجاح' });
          this.loadPharmacists();
        },
        error: (err) => {
          this.isSaving = false;
          const detail = err.error?.detail || err.error?.title || 'فشل إنشاء حساب الصيدلي';
          // Map backend conflict errors to field errors
          if (err.status === 409) {
            const msg = (err.error?.detail || '').toLowerCase();
            if (msg.includes('email') || msg.includes('بريد')) {
              this.createErrors = { ...this.createErrors, email: 'البريد الإلكتروني مستخدم بالفعل' };
            } else if (msg.includes('phone') || msg.includes('هاتف')) {
              this.createErrors = { ...this.createErrors, phoneNumber: 'رقم الهاتف مستخدم بالفعل' };
            }
          }
          this.msg.add({ severity: 'error', summary: 'خطأ', detail });
          this.cdr.markForCheck();
        },
      });
  }

  // ════════════════════════════════════════════════════════════════════
  //  EDIT MODAL
  // ════════════════════════════════════════════════════════════════════
  openEditModal(p: PharmacistSummaryDTO, event: Event): void {
    event.stopPropagation();
    this.editingId = p.pharmacistId;
    this.editForm = { fullName: p.fullName, phoneNumber: p.phoneNumber, password: '' };
    this.editErrors = {};
    this.showEditModal = true;
    this.cdr.markForCheck();
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingId = '';
    this.editErrors = {};
  }

  private validateEdit(): boolean {
    const e: FieldErrors = {};
    const name = this.editForm.fullName.trim();
    const phone = this.editForm.phoneNumber.trim();
    const pass = this.editForm.password ?? '';

    if (!name) {
      e['fullName'] = 'الاسم الكامل مطلوب';
    } else if (name.length < 3) {
      e['fullName'] = 'الاسم يجب أن يكون 3 أحرف على الأقل';
    } else if (name.length > 100) {
      e['fullName'] = 'الاسم يجب ألا يتجاوز 100 حرف';
    }

    const phoneRegex = /^(010|011|012|015)\d{8}$/;
    if (!phone) {
      e['phoneNumber'] = 'رقم الهاتف مطلوب';
    } else if (!phoneRegex.test(phone)) {
      e['phoneNumber'] = 'رقم الهاتف يجب أن يبدأ بـ 010/011/012/015 ويتكون من 11 رقماً';
    }

    // Password is optional on edit, but if entered, must meet requirements
    if (pass.length > 0) {
      if (pass.length < 8) {
        e['password'] = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
      } else if (!/[A-Z]/.test(pass)) {
        e['password'] = 'يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل';
      } else if (!/[a-z]/.test(pass)) {
        e['password'] = 'يجب أن تحتوي كلمة المرور على حرف صغير واحد على الأقل';
      } else if (!/\d/.test(pass)) {
        e['password'] = 'يجب أن تحتوي كلمة المرور على رقم واحد على الأقل';
      } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass)) {
        e['password'] = 'يجب أن تحتوي كلمة المرور على رمز خاص واحد على الأقل';
      }
    }

    this.editErrors = e;
    this.cdr.markForCheck();
    return Object.keys(e).length === 0;
  }

  submitEdit(): void {
    if (!this.validateEdit()) return;

    this.isUpdating = true;
    this.cdr.markForCheck();

    const payload: UpdatePharmacistRequest = {
      fullName: this.editForm.fullName.trim(),
      phoneNumber: this.editForm.phoneNumber.trim(),
      password: this.editForm.password?.trim() || undefined,
    };

    this.svc
      .updatePharmacist(this.editingId, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isUpdating = false;
          this.showEditModal = false;
          this.msg.add({ severity: 'success', summary: 'نجاح', detail: 'تم تحديث بيانات الصيدلي بنجاح' });
          this.loadPharmacists();
        },
        error: (err) => {
          this.isUpdating = false;
          const detail = err.error?.detail || err.error?.title || 'فشل تحديث البيانات';
          if (err.status === 409) {
            this.editErrors = { ...this.editErrors, phoneNumber: 'رقم الهاتف مستخدم بالفعل' };
          }
          this.msg.add({ severity: 'error', summary: 'خطأ', detail });
          this.cdr.markForCheck();
        },
      });
  }

  // ════════════════════════════════════════════════════════════════════
  //  STATUS CHANGE MODAL
  // ════════════════════════════════════════════════════════════════════
  openStatusModal(p: PharmacistSummaryDTO, event: Event): void {
    event.stopPropagation();
    this.statusTargetId = p.pharmacistId;
    this.statusTargetName = p.fullName;
    this.newStatus = this.parseStatusNumber(p.status);
    this.showStatusModal = true;
    this.cdr.markForCheck();
  }

  closeStatusModal(): void {
    this.showStatusModal = false;
    this.statusTargetId = '';
  }

  submitStatusChange(): void {
    // Status dropdown always has a value, just verify it's valid
    if (![1, 2, 3].includes(Number(this.newStatus))) {
      this.msg.add({ severity: 'warn', summary: 'تنبيه', detail: 'يرجى اختيار حالة صالحة' });
      return;
    }

    this.isChangingStatus = true;
    this.cdr.markForCheck();

    this.svc
      .updatePharmacistStatus(this.statusTargetId, Number(this.newStatus))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isChangingStatus = false;
          this.showStatusModal = false;
          this.msg.add({ severity: 'success', summary: 'نجاح', detail: 'تم تغيير حالة الصيدلي بنجاح' });
          this.loadPharmacists();
        },
        error: (err) => {
          this.isChangingStatus = false;
          const detail = err.error?.detail || err.error?.title || 'فشل تغيير الحالة';
          this.msg.add({ severity: 'error', summary: 'خطأ', detail });
          this.cdr.markForCheck();
        },
      });
  }

  // ════════════════════════════════════════════════════════════════════
  //  DELETE MODAL
  // ════════════════════════════════════════════════════════════════════
  openDeleteModal(p: PharmacistSummaryDTO, event: Event): void {
    event.stopPropagation();
    this.deleteTargetId = p.pharmacistId;
    this.deleteTargetName = p.fullName;
    this.showDeleteModal = true;
    this.cdr.markForCheck();
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.deleteTargetId = '';
  }

  submitDelete(): void {
    if (!this.deleteTargetId) {
      this.msg.add({ severity: 'error', summary: 'خطأ', detail: 'لم يتم تحديد الصيدلي' });
      return;
    }

    this.isDeleting = true;
    this.cdr.markForCheck();

    this.svc
      .deletePharmacist(this.deleteTargetId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isDeleting = false;
          this.showDeleteModal = false;
          this.msg.add({ severity: 'success', summary: 'تم الحذف', detail: 'تم حذف حساب الصيدلي بنجاح' });
          if (this.pharmacists.length === 1 && this.pageNumber > 1) {
            this.pageNumber--;
          }
          this.loadPharmacists();
        },
        error: (err) => {
          this.isDeleting = false;
          const detail = err.error?.detail || err.error?.title || 'فشل حذف الصيدلي';
          this.msg.add({ severity: 'error', summary: 'خطأ', detail });
          this.cdr.markForCheck();
        },
      });
  }

  // ════════════════════════════════════════════════════════════════════
  //  ASSIGN BRANCH MODAL
  // ════════════════════════════════════════════════════════════════════
  openAssignModal(p: PharmacistSummaryDTO, event: Event): void {
    event.stopPropagation();
    this.assignTargetId = p.pharmacistId;
    this.assignTargetName = p.fullName;
    const activeAssignment = p.assignments?.find((a) => a.isActive);
    this.assignCurrentBranchId = activeAssignment?.branchId || '';
    this.assignSelectedBranchId = this.assignCurrentBranchId || (this.branches[0]?.branchId ?? '');
    this.assignError = '';
    this.showAssignModal = true;
    this.cdr.markForCheck();
  }

  closeAssignModal(): void {
    this.showAssignModal = false;
    this.assignError = '';
  }

  submitAssignBranch(): void {
    if (!this.assignSelectedBranchId) {
      this.assignError = 'يرجى اختيار الفرع المراد الإسناد إليه';
      this.cdr.markForCheck();
      return;
    }

    if (this.assignSelectedBranchId === this.assignCurrentBranchId) {
      this.assignError = 'الصيدلي مسند بالفعل إلى هذا الفرع.';
      this.msg.add({
        severity: 'warn',
        summary: 'تنبيه',
        detail: 'الصيدلي مسند بالفعل إلى هذا الفرع.',
      });
      this.cdr.markForCheck();
      return;
    }

    this.isAssigningBranch = true;
    this.cdr.markForCheck();

    this.svc
      .assignBranch(this.assignTargetId, this.assignSelectedBranchId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isAssigningBranch = false;
          this.msg.add({
            severity: 'success',
            summary: 'تم النجاح',
            detail: `تم إسناد الصيدلي "${this.assignTargetName}" للفرع بنجاح`,
          });
          this.closeAssignModal();
          this.loadPharmacists();
        },
        error: (err) => {
          this.isAssigningBranch = false;
          const detail = err.error?.detail || err.error?.title || 'الصيدلي مسند بالفعل إلى هذا الفرع.';
          this.assignError = detail;
          this.msg.add({
            severity: 'error',
            summary: 'خطأ في الإسناد',
            detail: detail,
          });
          this.cdr.markForCheck();
        },
      });
  }

  // ── Helpers ────────────────────────────────────────────────────────
  parseStatusNumber(s: any): number {
    if (s === 1 || s === '1' || String(s).toLowerCase() === 'active') return 1;
    if (s === 2 || s === '2' || String(s).toLowerCase() === 'inactive') return 2;
    if (s === 3 || s === '3' || String(s).toLowerCase() === 'suspended') return 3;
    return 1;
  }

  getStatusLabel(s: any): string {
    const num = this.parseStatusNumber(s);
    if (num === 1) return 'نشط';
    if (num === 2) return 'غير نشط';
    if (num === 3) return 'معلق';
    return 'غير محدد';
  }

  getStatusClass(s: any): string {
    const num = this.parseStatusNumber(s);
    if (num === 1) return 'status-badge badge-active';
    if (num === 2) return 'status-badge badge-inactive';
    if (num === 3) return 'status-badge badge-suspended';
    return 'status-badge badge-default';
  }

  getBranchName(p: PharmacistSummaryDTO): string {
    if (p.activeBranchName) return p.activeBranchName;
    const activeAss = p.assignments?.find((a) => a.isActive);
    if (!activeAss) return 'غير مسند لفرع';
    const match = this.branches.find((b) => b.branchId === activeAss.branchId);
    return match ? match.branchName : 'فرع';
  }

  trackById(_index: number, item: any): string {
    return item?.pharmacistId ?? String(_index);
  }
}
