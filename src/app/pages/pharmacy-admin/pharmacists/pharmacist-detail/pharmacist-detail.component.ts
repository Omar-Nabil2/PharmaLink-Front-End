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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, EMPTY } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { PharmacistManagementService } from '@core/services/pharmacist-management.service';

import { EnumTranslatePipe } from '@core/pipes/enum-translate.pipe';
import {
  AssignmentHistoryItemDTO,
  PharmacistResponseDTO,
  UpdatePharmacistRequest,
  UserStatus,
} from '@core/models/pharmacist-management.model';

/** Validation error map */
interface FieldErrors {
  [field: string]: string;
}

@Component({
  selector: 'app-pharmacist-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EnumTranslatePipe, CommonModule, FormsModule, RouterLink, ToastModule, DialogModule],
  providers: [MessageService],
  templateUrl: './pharmacist-detail.component.html',
  styleUrl: './pharmacist-detail.component.scss',
})
export class PharmacistDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly svc = inject(PharmacistManagementService);
  private readonly msg = inject(MessageService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  pharmacistId = '';
  pharmacist: PharmacistResponseDTO | null = null;
  history: AssignmentHistoryItemDTO[] = [];
  isLoading = true;
  isLoadingHistory = false;

  // ── Edit modal ─────────────────────────────────────────────────────
  showEditModal = false;
  isUpdating = false;
  editForm: UpdatePharmacistRequest = { fullName: '', phoneNumber: '', password: '' };
  editErrors: FieldErrors = {};

  // ── Status modal ───────────────────────────────────────────────────
  showStatusModal = false;
  isChangingStatus = false;
  newStatus: UserStatus = UserStatus.Active;

  // ── Delete modal ───────────────────────────────────────────────────
  showDeleteModal = false;
  isDeleting = false;

  // ── Lifecycle ──────────────────────────────────────────────────────
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.pharmacistId = id;
      this.loadDetails();
      this.loadHistory();
    } else {
      this.router.navigate(['/owner/pharmacists']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Data loading ───────────────────────────────────────────────────
  loadDetails(): void {
    this.isLoading = true;
    this.cdr.markForCheck();
    this.svc
      .getPharmacistById(this.pharmacistId)
      .pipe(
        catchError((err) => {
          this.isLoading = false;
          const detail = err.status === 404
            ? 'الصيدلي غير موجود أو لا يتبع صيدليتك'
            : 'فشل تحميل بيانات الصيدلي';
          this.msg.add({ severity: 'error', summary: 'خطأ', detail });
          this.cdr.markForCheck();
          return EMPTY;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((res) => {
        this.pharmacist = res;
        this.isLoading = false;
        this.cdr.markForCheck();
      });
  }

  loadHistory(): void {
    this.isLoadingHistory = true;
    this.cdr.markForCheck();
    this.svc
      .getPharmacistHistory(this.pharmacistId)
      .pipe(
        catchError(() => {
          this.isLoadingHistory = false;
          this.cdr.markForCheck();
          return EMPTY;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((res) => {
        this.history = res ?? [];
        this.isLoadingHistory = false;
        this.cdr.markForCheck();
      });
  }

  // ════════════════════════════════════════════════════════════════════
  //  EDIT MODAL
  // ════════════════════════════════════════════════════════════════════
  openEditModal(): void {
    if (!this.pharmacist) return;
    this.editForm = {
      fullName: this.pharmacist.fullName,
      phoneNumber: this.pharmacist.phoneNumber,
      password: '',
    };
    this.editErrors = {};
    this.showEditModal = true;
    this.cdr.markForCheck();
  }

  closeEditModal(): void {
    this.showEditModal = false;
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

    // Password is optional but must meet rules if provided
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
      .updatePharmacist(this.pharmacistId, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.isUpdating = false;
          this.showEditModal = false;
          this.pharmacist = res;
          this.msg.add({ severity: 'success', summary: 'نجاح', detail: 'تم تحديث بيانات الصيدلي ورقم السر بنجاح' });
          this.loadDetails();
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
  //  STATUS MODAL
  // ════════════════════════════════════════════════════════════════════
  openStatusModal(): void {
    if (!this.pharmacist) return;
    this.newStatus = this.parseStatusNumber(this.pharmacist.status);
    this.showStatusModal = true;
    this.cdr.markForCheck();
  }

  closeStatusModal(): void {
    this.showStatusModal = false;
  }

  submitStatusChange(): void {
    if (![1, 2, 3].includes(Number(this.newStatus))) {
      this.msg.add({ severity: 'warn', summary: 'تنبيه', detail: 'يرجى اختيار حالة صالحة' });
      return;
    }

    this.isChangingStatus = true;
    this.cdr.markForCheck();

    this.svc
      .updatePharmacistStatus(this.pharmacistId, Number(this.newStatus))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.isChangingStatus = false;
          this.showStatusModal = false;
          this.pharmacist = res;
          this.msg.add({ severity: 'success', summary: 'نجاح', detail: 'تم تغيير حالة الصيدلي بنجاح' });
          this.loadDetails();
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
  openDeleteModal(): void {
    this.showDeleteModal = true;
    this.cdr.markForCheck();
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
  }

  submitDelete(): void {
    if (!this.pharmacistId) {
      this.msg.add({ severity: 'error', summary: 'خطأ', detail: 'لم يتم تحديد الصيدلي' });
      return;
    }

    this.isDeleting = true;
    this.cdr.markForCheck();

    this.svc
      .deletePharmacist(this.pharmacistId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isDeleting = false;
          this.showDeleteModal = false;
          this.msg.add({ severity: 'success', summary: 'تم الحذف', detail: 'تم حذف حساب الصيدلي بنجاح' });
          this.router.navigate(['/owner/pharmacists']);
        },
        error: (err) => {
          this.isDeleting = false;
          const detail = err.error?.detail || err.error?.title || 'فشل حذف الصيدلي';
          this.msg.add({ severity: 'error', summary: 'خطأ', detail });
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
}
