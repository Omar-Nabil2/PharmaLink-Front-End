import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { InventoryService } from '@core/services/inventory.service';
import { GetPharmacyInventoryDTO, PharmacyInventoryDto, ProblemDetails, UpdatePharmacyInventoryDto } from '../inventory.model';

/**
 * Custom validator: the control's value (an ISO `yyyy-MM-dd` string) must be a
 * strictly future date. Mirrors the backend rule
 * `d > DateOnly.FromDateTime(DateTime.UtcNow)`.
 */
function futureDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string | null;
    if (!value) return null; // Optional on update — emptiness is allowed.
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const picked = new Date(value);
    picked.setHours(0, 0, 0, 0);
    return picked.getTime() > today.getTime() ? null : { futureDate: true };
  };
}

@Component({
  selector: 'app-update-inventory-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, DialogModule, ToastModule],
  providers: [MessageService],
  templateUrl: './update-inventory-dialog.component.html',
})
export class UpdateInventoryDialogComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly inventoryService = inject(InventoryService);
  private readonly messageService = inject(MessageService);

  @Input() visible = false;
  @Input() item: GetPharmacyInventoryDTO | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<void>();

  // ── Form state ───────────────────────────────────────────────
  // Note: the drug identity (drugId / drugName) is READ-ONLY on update and is
  // never re-bound or sent in the payload — only stock, price, and expiry are
  // editable, plus the concurrency token.
  readonly formDrugName = signal('');
  readonly formRowVersion = signal<string | null>(null);
  readonly isSaving = signal(false);
  readonly isDetailLoading = signal(false);

  /**
   * Reactive form mirroring `UpdatePharmacyInventoryValidator`:
   * - stockQuantity: GreaterThanOrEqualTo(0)  → min(0).
   * - unitPrice: GreaterThan(0)               → min(0.01).
   * - expiryDate: future date (custom validator, optional).
   */
  readonly form: FormGroup = this.fb.group({
    stockQuantity: [0 as number | null, [Validators.required, Validators.min(0)]],
    unitPrice: [0 as number | null, [Validators.required, Validators.min(0.01)]],
    expiryDate: ['', [futureDateValidator()]],
  });

  /** Arabic messages keyed by control name + error type. */
  private readonly errorMessages: Record<string, Record<string, string>> = {
    stockQuantity: {
      required: 'الكمية بالمخزون يجب أن تكون رقماً أكبر من أو يساوي الصفر.',
      min: 'الكمية بالمخزون يجب أن تكون رقماً أكبر من أو يساوي الصفر.',
    },
    unitPrice: {
      required: 'سعر الوحدة يجب أن يكون أكبر من الصفر.',
      min: 'سعر الوحدة يجب أن يكون أكبر من الصفر.',
    },
    expiryDate: {
      futureDate: 'تاريخ الانتهاء يجب أن يكون في المستقبل.',
    },
  };

  /** Maps backend FluentValidation field names (PascalCase) to control names. */
  private readonly serverFieldMap: Record<string, string> = {
    StockQuantity: 'stockQuantity',
    UnitPrice: 'unitPrice',
    ExpiryDate: 'expiryDate',
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true && this.item) {
      this.hydrateFromItem(this.item);
      // Fetch fresh detail to get the latest concurrency token (rowVersion).
      this.isDetailLoading.set(true);
      this.inventoryService.getById(this.item.inventoryId).subscribe({
        next: (detail: PharmacyInventoryDto) => {
          this.formRowVersion.set(detail.rowVersion ?? null);
          this.isDetailLoading.set(false);
        },
        error: () => this.isDetailLoading.set(false),
      });
    }
  }

  private hydrateFromItem(item: GetPharmacyInventoryDTO): void {
    this.formDrugName.set(item.arabicName?.trim() || item.drugName);
    this.form.reset({
      stockQuantity: item.stockQuantity,
      unitPrice: item.unitPrice,
      expiryDate: item.expiryDate ? item.expiryDate.substring(0, 10) : '',
    });
    this.formRowVersion.set(null);
  }

  // ── Template helpers for inline error display ───────────────
  /** True when a control is invalid AND has been touched/dirtied. */
  showError(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  /** Resolves the first Arabic error message for a control (client or server). */
  errorFor(controlName: string): string | null {
    const control = this.form.get(controlName);
    if (!control || !control.errors) return null;

    if (control.errors['serverError']) {
      return control.errors['serverError'] as string;
    }

    const messages = this.errorMessages[controlName] ?? {};
    const firstKey = Object.keys(control.errors)[0];
    return messages[firstKey] ?? 'قيمة غير صالحة.';
  }

  // ── Save ─────────────────────────────────────────────────────
  save(): void {
    if (!this.item) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const raw = this.form.getRawValue();
    const dto: UpdatePharmacyInventoryDto = {
      stockQuantity: Number(raw.stockQuantity),
      unitPrice: Number(raw.unitPrice),
      expiryDate: raw.expiryDate || null,
      rowVersion: this.formRowVersion(),
    };

    this.inventoryService.update(this.item.inventoryId, dto).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'نجاح',
          detail: 'تم تحديث بيانات الدواء بنجاح.',
        });
        this.saved.emit();
        this.close();
      },
      error: (problem: ProblemDetails) => {
        this.isSaving.set(false);
        this.handleApiError(problem);
      },
    });
  }

  /**
   * Parses an API error. `409` → concurrency conflict (stale rowVersion).
   * `400` FluentValidation payloads (`{ errors: { Field: ["msg"] } }`) are
   * mapped field-by-field onto the reactive controls as localized errors.
   */
  private handleApiError(problem: ProblemDetails): void {
    if (problem.status === 409) {
      this.messageService.add({
        severity: 'error',
        summary: 'خطأ',
        detail:
          problem.detail ??
          'تم تعديل هذا السجل بواسطة مستخدم آخر. يرجى إعادة فتح النافذة والمحاولة مجددًا.',
      });
      return;
    }

    if (problem.status === 400 && problem.errors) {
      let matchedAny = false;

      for (const [serverField, serverMsgs] of Object.entries(problem.errors)) {
        const controlName = this.serverFieldMap[serverField];
        if (!controlName) continue;

        const control = this.form.get(controlName);
        if (!control) continue;

        const arabicMessage =
          this.errorFor(controlName) ??
          this.errorMessages[controlName]?.['min'] ??
          serverMsgs?.[0] ??
          'قيمة غير صالحة.';

        control.setErrors({ serverError: arabicMessage });
        control.markAsTouched();
        matchedAny = true;
      }

      if (matchedAny) return;

      const flat = Object.values(problem.errors).flat();
      this.messageService.add({
        severity: 'error',
        summary: 'خطأ',
        detail: flat.length ? flat.join(' • ') : problem.detail ?? 'فشل تحديث بيانات الدواء.',
      });
      return;
    }

    this.messageService.add({
      severity: 'error',
      summary: 'خطأ',
      detail: problem.detail ?? 'فشل تحديث بيانات الدواء.',
    });
  }

  close(): void {
    this.visibleChange.emit(false);
  }
}
