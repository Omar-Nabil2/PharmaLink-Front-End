import {
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, switchMap, tap } from 'rxjs/operators';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { MessageService } from 'primeng/api';
import { InventoryService } from '@core/services/inventory.service';
import { SearchService } from '@core/services/search.service';
import { MedicineSearchDTO, PharmacyBranchSearchDTO } from '../search.model';
import { AddPharmacyInventoryDto, ProblemDetails } from '../inventory.model';

/**
 * Custom validator: the control's value (an ISO `yyyy-MM-dd` string) must be a
 * strictly future date. Mirrors the backend rule
 * `d > DateOnly.FromDateTime(DateTime.UtcNow)`.
 */
function futureDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string | null;
    if (!value) return null; // Emptiness handled by `required` where applicable.
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const picked = new Date(value);
    picked.setHours(0, 0, 0, 0);
    return picked.getTime() > today.getTime() ? null : { futureDate: true };
  };
}

@Component({
  selector: 'app-add-inventory-dialog',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, DialogModule, ToastModule, AutoCompleteModule],
  providers: [MessageService],
  templateUrl: './add-inventory-dialog.component.html',
})
export class AddInventoryDialogComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly inventoryService = inject(InventoryService);
  private readonly searchService = inject(SearchService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  @Input() visible = false;
  /** Optional branch preselected from the parent (e.g. active branch filter). */
  @Input() defaultBranchId: string | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<void>();

  readonly isSaving = signal(false);

  // ── Autocomplete state ──────────────────────────────────────
  readonly medicineSuggestions = signal<MedicineSearchDTO[]>([]);
  readonly branchSuggestions = signal<PharmacyBranchSearchDTO[]>([]);
  readonly isMedicineSearching = signal(false);
  readonly isBranchSearching = signal(false);
  readonly selectedMedicine = signal<MedicineSearchDTO | null>(null);
  readonly selectedBranch = signal<PharmacyBranchSearchDTO | null>(null);

  private readonly medicineQuery$ = new Subject<string>();
  private readonly branchQuery$ = new Subject<string>();

  /**
   * Reactive form mirroring `AddPharmacyInventoryValidator`:
   * - branchId / drugId: required (GUIDs bound behind the autocompletes).
   * - stockQuantity: GreaterThan(0)  → min(1).
   * - unitPrice: GreaterThan(0)      → min(0.01).
   * - expiryDate: future date (custom validator).
   */
  readonly form: FormGroup = this.fb.group({
    branchId: ['', [Validators.required]],
    drugId: ['', [Validators.required]],
    drugName: [''],
    stockQuantity: [null as number | null, [Validators.required, Validators.min(1)]],
    unitPrice: [null as number | null, [Validators.required, Validators.min(0.01)]],
    expiryDate: ['', [Validators.required, futureDateValidator()]],
  });

  /** Arabic messages keyed by control name + error type. */
  private readonly errorMessages: Record<string, Record<string, string>> = {
    branchId: { required: 'يرجى اختيار الفرع.' },
    drugId: { required: 'يرجى اختيار الدواء.' },
    stockQuantity: {
      required: 'الكمية بالمخزون يجب أن تكون أكبر من الصفر.',
      min: 'الكمية بالمخزون يجب أن تكون أكبر من الصفر.',
    },
    unitPrice: {
      required: 'سعر الوحدة يجب أن يكون أكبر من الصفر.',
      min: 'سعر الوحدة يجب أن يكون أكبر من الصفر.',
    },
    expiryDate: {
      required: 'تاريخ الانتهاء يجب أن يكون في المستقبل.',
      futureDate: 'تاريخ الانتهاء يجب أن يكون في المستقبل.',
    },
  };

  /**
   * Maps a backend FluentValidation field name (PascalCase) to the local
   * reactive form control name (camelCase).
   */
  private readonly serverFieldMap: Record<string, string> = {
    BranchId: 'branchId',
    DrugId: 'drugId',
    StockQuantity: 'stockQuantity',
    UnitPrice: 'unitPrice',
    ExpiryDate: 'expiryDate',
  };

  constructor() {
    this.medicineQuery$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        filter((term) => term.trim().length >= 2),
        tap(() => this.isMedicineSearching.set(true)),
        switchMap((term) => this.searchService.searchMedicines(term)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((results) => {
        this.medicineSuggestions.set(results ?? []);
        this.isMedicineSearching.set(false);
      });

    this.branchQuery$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        filter((term) => term.trim().length >= 2),
        tap(() => this.isBranchSearching.set(true)),
        switchMap((term) => this.searchService.searchBranches(term)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((results) => {
        this.branchSuggestions.set(results ?? []);
        this.isBranchSearching.set(false);
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true) {
      this.resetForm();
    }
  }

  private resetForm(): void {
    this.form.reset({
      branchId: this.defaultBranchId ?? '',
      drugId: '',
      drugName: '',
      stockQuantity: null,
      unitPrice: null,
      expiryDate: '',
    });
    this.selectedMedicine.set(null);
    this.selectedBranch.set(null);
    this.medicineSuggestions.set([]);
    this.branchSuggestions.set([]);
    this.isSaving.set(false);
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

    // Server-provided message takes precedence.
    if (control.errors['serverError']) {
      return control.errors['serverError'] as string;
    }

    const messages = this.errorMessages[controlName] ?? {};
    const firstKey = Object.keys(control.errors)[0];
    return messages[firstKey] ?? 'قيمة غير صالحة.';
  }

  // ── Autocomplete: Medicine (DrugId) ─────────────────────────
  onMedicineSearch(query: string): void {
    if (query.trim().length < 2) {
      this.medicineSuggestions.set([]);
      return;
    }
    this.medicineQuery$.next(query);
  }

  onMedicineSelected(medicine: MedicineSearchDTO): void {
    this.selectedMedicine.set(medicine);
    this.form.patchValue({
      drugId: medicine.id,
      drugName: medicine.arabicName?.trim() || medicine.name,
    });
    this.form.get('drugId')?.markAsDirty();
    if (medicine.price != null && !this.form.get('unitPrice')?.value) {
      this.form.patchValue({ unitPrice: medicine.price });
    }
  }

  onMedicineCleared(): void {
    this.selectedMedicine.set(null);
    this.form.patchValue({ drugId: '', drugName: '' });
    this.form.get('drugId')?.markAsDirty();
  }

  // ── Autocomplete: Branch (BranchId) ─────────────────────────
  onBranchSearch(query: string): void {
    if (query.trim().length < 2) {
      this.branchSuggestions.set([]);
      return;
    }
    this.branchQuery$.next(query);
  }

  onBranchSelected(branch: PharmacyBranchSearchDTO): void {
    this.selectedBranch.set(branch);
    this.form.patchValue({ branchId: branch.branchId });
    this.form.get('branchId')?.markAsDirty();
  }

  onBranchCleared(): void {
    this.selectedBranch.set(null);
    this.form.patchValue({ branchId: '' });
    this.form.get('branchId')?.markAsDirty();
  }

  // ── Save ─────────────────────────────────────────────────────
  save(): void {
    // Client-side gate: mirror FluentValidation before hitting the API.
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const raw = this.form.getRawValue();
    const dto: AddPharmacyInventoryDto = {
      branchId: (raw.branchId ?? '').trim(),
      drugId: (raw.drugId ?? '').trim(),
      stockQuantity: Number(raw.stockQuantity),
      unitPrice: Number(raw.unitPrice),
      expiryDate: raw.expiryDate || null,
    };

    this.inventoryService.add(dto).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'نجاح',
          detail: 'تمت إضافة الدواء إلى المخزون بنجاح.',
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
   * Parses an API error. For `400 Bad Request` FluentValidation payloads
   * (`{ errors: { Field: ["msg"] } }`), maps each field to its reactive control
   * and sets a localized `serverError`. Falls back to a toast otherwise.
   */
  private handleApiError(problem: ProblemDetails): void {
    if (problem.status === 400 && problem.errors) {
      let matchedAny = false;

      for (const [serverField, serverMsgs] of Object.entries(problem.errors)) {
        const controlName = this.serverFieldMap[serverField];
        if (!controlName) continue;

        const control = this.form.get(controlName);
        if (!control) continue;

        const arabicMessage =
          this.errorFor(controlName) ??
          this.errorMessages[controlName]?.['required'] ??
          serverMsgs?.[0] ??
          'قيمة غير صالحة.';

        control.setErrors({ serverError: arabicMessage });
        control.markAsTouched();
        matchedAny = true;
      }

      if (matchedAny) return;

      // Unmapped 400 → surface a flattened toast.
      const flat = Object.values(problem.errors).flat();
      this.messageService.add({
        severity: 'error',
        summary: 'خطأ',
        detail: flat.length ? flat.join(' • ') : problem.detail ?? 'فشل إضافة الدواء.',
      });
      return;
    }

    this.messageService.add({
      severity: 'error',
      summary: 'خطأ',
      detail: problem.detail ?? 'فشل إضافة الدواء.',
    });
  }

  close(): void {
    this.visibleChange.emit(false);
  }
}
