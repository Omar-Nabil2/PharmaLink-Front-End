import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DecimalPipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, switchMap, tap } from 'rxjs/operators';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { MessageService } from 'primeng/api';
import { InventoryStatusTranslatePipe } from './inventory-status-translate.pipe';
import { UpdateInventoryDialogComponent } from './update-inventory-dialog/update-inventory-dialog.component';
import { ViewInventoryDialogComponent } from './view-inventory-dialog/view-inventory-dialog.component';
import { InventoryService } from '@core/services/inventory.service';
import { SearchService } from '@core/services/search.service';
import { MedicineSearchDTO, PharmacyBranchSearchDTO } from './search.model';
import {
  AddPharmacyInventoryDto,
  GetPharmacyInventoryDTO,
  GetPharmacyInventoryParamRequest,
  INVENTORY_FILTER_OPTIONS,
  InventoryStatusFilter,
  InventoryStockStatus,
  PharmacyInventoryDto,
  ProblemDetails,
  STOCK_STATUS_PRESENTATION,
  UpdatePharmacyInventoryDto,
  getStockBadgeClasses,
} from './inventory.model';

/** Sentinel value representing the "all branches" selection. */
const ALL_BRANCHES = 'ALL';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [
    DecimalPipe,
    NgClass,
    FormsModule,
    TableModule,
    DialogModule,
    SelectModule,
    ToastModule,
    AutoCompleteModule,
    InventoryStatusTranslatePipe,
    UpdateInventoryDialogComponent,
    ViewInventoryDialogComponent,
  ],
  providers: [MessageService],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss',
})
export class InventoryComponent implements OnInit {
  private readonly inventoryService = inject(InventoryService);
  private readonly searchService = inject(SearchService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);


  // ── List / paging state ─────────────────────────────────────
  readonly inventoryData = signal<GetPharmacyInventoryDTO[]>([]);
  readonly totalRecords = signal(0);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  // ── Filter state ────────────────────────────────────────────
  readonly searchQuery = signal('');
  readonly selectedFilter = signal<InventoryStatusFilter>(InventoryStatusFilter.All);
  readonly branchId = signal<string | null>(null);
  readonly pageNumber = signal(1);
  readonly pageSize = signal(10);
  readonly first = signal(0);

  readonly filterOptions = INVENTORY_FILTER_OPTIONS;

  readonly isEmpty = computed(
    () => !this.isLoading() && !this.errorMessage() && this.inventoryData().length === 0,
  );

  // ── Modal / dialog state ────────────────────────────────────
  readonly isFormDialogOpen = signal(false);
  readonly isDetailsDialogOpen = signal(false);
  readonly isDeleteDialogOpen = signal(false);
  readonly isEditing = signal(false);
  readonly isSaving = signal(false);
  readonly isDeleting = signal(false);
  readonly isDetailsLoading = signal(false);
  readonly selectedItem = signal<GetPharmacyInventoryDTO | null>(null);
  readonly detailsItem = signal<PharmacyInventoryDto | null>(null);

  // ── Sub-dialog visibility (delegated to child components) ───
  readonly isUpdateDialogOpen = signal(false);
  readonly isViewDialogOpen = signal(false);
  readonly viewInventoryId = signal<string | null>(null);

  // ── Reactive form fields (signals) ──────────────────────────
  readonly formInventoryId = signal<string | null>(null);
  readonly formBranchId = signal('');
  readonly formDrugId = signal('');
  readonly formDrugName = signal('');
  readonly formStockQuantity = signal<number>(0);
  readonly formUnitPrice = signal<number>(0);
  readonly formExpiryDate = signal<string>('');
  /** Concurrency token carried from the item read into the update payload. */
  readonly formRowVersion = signal<string | null>(null);

  // ── Autocomplete state (Add dialog) ─────────────────────────
  readonly medicineSuggestions = signal<MedicineSearchDTO[]>([]);
  readonly branchSuggestions = signal<PharmacyBranchSearchDTO[]>([]);
  readonly isMedicineSearching = signal(false);
  readonly isBranchSearching = signal(false);
  /** Currently selected autocomplete objects (bound to `[(ngModel)]`). */
  readonly selectedMedicine = signal<MedicineSearchDTO | null>(null);
  readonly selectedBranch = signal<PharmacyBranchSearchDTO | null>(null);

  // ── Branch filter (toolbar) state ───────────────────────────
  readonly branchFilterSuggestions = signal<PharmacyBranchSearchDTO[]>([]);
  readonly selectedBranchFilter = signal<PharmacyBranchSearchDTO | null>(null);

  private readonly searchInput$ = new Subject<string>();
  private readonly medicineQuery$ = new Subject<string>();
  private readonly branchQuery$ = new Subject<string>();
  private readonly branchFilterQuery$ = new Subject<string>();

  ngOnInit(): void {
    // Debounced live search: only refetch after the user pauses typing.
    this.searchInput$
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.searchQuery.set(value);
        this.resetToFirstPage();
        this.loadInventory();
      });

    // Medicine autocomplete stream: debounce 300ms, min 2 chars, switchMap.
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

    // Branch autocomplete stream: debounce 300ms, min 2 chars, switchMap.
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

    // Branch filter autocomplete stream (toolbar): debounce 300ms, switchMap.
    this.branchFilterQuery$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) =>
          term.trim().length >= 1
            ? this.searchService.searchBranches(term)
            : this.searchService.searchBranches(''),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((results) => this.branchFilterSuggestions.set(results ?? []));

    this.loadInventory();
  }

  // ── Branch filter (toolbar) handlers ────────────────────────
  onBranchFilterSearch(query: string): void {
    this.branchFilterQuery$.next(query ?? '');
  }

  onBranchFilterSelected(branch: PharmacyBranchSearchDTO): void {
    this.selectedBranchFilter.set(branch);
    this.onBranchChange(branch.branchId);
  }

  onBranchFilterCleared(): void {
    this.selectedBranchFilter.set(null);
    this.onBranchChange(null);
  }

  // ── Data loading ────────────────────────────────────────────
  loadInventory(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const branchId = this.branchId();
    const params: GetPharmacyInventoryParamRequest = {
      search: this.searchQuery().trim() || null,
      statusFilter: this.selectedFilter(),
      pageNumber: this.pageNumber(),
      pageSize: this.pageSize(),
    };

    // Flow switching: a concrete branch selection hits the branch-scoped
    // endpoint; 'ALL' (null) falls back to the tenant-wide list.
    const request$ =
      branchId && branchId !== ALL_BRANCHES
        ? this.inventoryService.getInventoryByBranch(branchId, params)
        : this.inventoryService.getInventory({ ...params, branchId: null });

    request$.subscribe({
      next: (res) => {
        this.inventoryData.set(res.items ?? []);
        this.totalRecords.set(res.totalCount ?? res.items?.length ?? 0);
        this.isLoading.set(false);
      },
      error: (problem: ProblemDetails) => {
        this.inventoryData.set([]);
        this.totalRecords.set(0);
        this.errorMessage.set(
          problem.detail ?? problem.title ?? 'تعذر تحميل المخزون. حاول مرة أخرى.',
        );
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Reacts to a branch change from the header/dropdown selector.
   * Passing `'ALL'` (or a falsy value) reverts to the tenant-wide endpoint.
   */
  onBranchChange(branchId: string | null): void {
    this.branchId.set(branchId && branchId !== ALL_BRANCHES ? branchId : null);
    this.resetToFirstPage();
    this.loadInventory();
  }

  /** True when the "all branches" view is active (branch column is shown). */
  readonly isAllBranchesView = computed(() => !this.branchId());

  reload(): void {
    this.loadInventory();
  }

  // ── Filter / search handlers ────────────────────────────────
  onSearchInput(value: string): void {
    this.searchInput$.next(value);
  }

  onFilterChange(value: InventoryStatusFilter): void {
    this.selectedFilter.set(value ?? InventoryStatusFilter.All);
    this.resetToFirstPage();
    this.loadInventory();
  }

  onPageChange(event: { first?: number; rows?: number }): void {
    const rows = event.rows ?? this.pageSize();
    const firstIndex = event.first ?? 0;
    this.first.set(firstIndex);
    this.pageSize.set(rows);
    this.pageNumber.set(Math.floor(firstIndex / rows) + 1);
    this.loadInventory();
  }

  private resetToFirstPage(): void {
    this.first.set(0);
    this.pageNumber.set(1);
  }

  // ── Status presentation helpers ─────────────────────────────
  getBadgeClasses(item: GetPharmacyInventoryDTO): string {
    return getStockBadgeClasses(item.stockStatus);
  }

  getStatusLabel(item: GetPharmacyInventoryDTO): string {
    return (
      item.stockStatusLabel?.trim() ||
      STOCK_STATUS_PRESENTATION[item.stockStatus]?.label ||
      '—'
    );
  }

  // ── Display helpers ─────────────────────────────────────────
  displayName(item: GetPharmacyInventoryDTO): string {
    return item.arabicName?.trim() || item.drugName;
  }

  isExpiringSoon(expiryDate: string | null): boolean {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate).getTime();
    const soon = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
    return expiry <= soon;
  }

  // ── Dialog: Add ─────────────────────────────────────────────
  openAddDialog(): void {
    this.isEditing.set(false);
    this.selectedItem.set(null);
    this.formInventoryId.set(null);
    this.formBranchId.set(this.branchId() ?? '');
    this.formDrugId.set('');
    this.formDrugName.set('');
    this.formStockQuantity.set(0);
    this.formUnitPrice.set(0);
    this.formExpiryDate.set('');
    this.formRowVersion.set(null);
    // Reset autocomplete state.
    this.selectedMedicine.set(null);
    this.selectedBranch.set(null);
    this.medicineSuggestions.set([]);
    this.branchSuggestions.set([]);
    this.isFormDialogOpen.set(true);
  }

  // ── Autocomplete: Medicine (DrugId) ─────────────────────────
  /** Fired by `p-autoComplete.completeMethod`; pushes into the debounced stream. */
  onMedicineSearch(query: string): void {
    if (query.trim().length < 2) {
      this.medicineSuggestions.set([]);
      return;
    }
    this.medicineQuery$.next(query);
  }

  /** Binds the selected medicine's GUID + pre-fills unit price when available. */
  onMedicineSelected(medicine: MedicineSearchDTO): void {
    this.selectedMedicine.set(medicine);
    this.formDrugId.set(medicine.id);
    this.formDrugName.set(medicine.arabicName?.trim() || medicine.name);
    if (medicine.price != null && this.formUnitPrice() === 0) {
      this.formUnitPrice.set(medicine.price);
    }
  }

  /** Clears the bound GUID when the user empties/changes the medicine field. */
  onMedicineCleared(): void {
    this.selectedMedicine.set(null);
    this.formDrugId.set('');
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
    this.formBranchId.set(branch.branchId);
  }

  onBranchCleared(): void {
    this.selectedBranch.set(null);
    this.formBranchId.set('');
  }


  // ── Dialog: Edit (delegated to UpdateInventoryDialogComponent) ──
  openEditDialog(item: GetPharmacyInventoryDTO): void {
    this.selectedItem.set(item);
    this.isUpdateDialogOpen.set(true);
  }

  private hydrateForm(item: GetPharmacyInventoryDTO | PharmacyInventoryDto): void {
    this.formInventoryId.set(item.inventoryId);
    this.formBranchId.set(item.branchId);
    this.formDrugId.set(item.drugId);
    this.formDrugName.set(item.arabicName?.trim() || item.drugName);
    this.formStockQuantity.set(item.stockQuantity);
    this.formUnitPrice.set(item.unitPrice);
    this.formExpiryDate.set(item.expiryDate ? item.expiryDate.substring(0, 10) : '');
  }

  // ── Dialog: Details (delegated to ViewInventoryDialogComponent) ──
  openDetailsDialog(item: GetPharmacyInventoryDTO): void {
    this.selectedItem.set(item);
    this.viewInventoryId.set(item.inventoryId);
    this.isViewDialogOpen.set(true);
  }

  onViewEditRequested(): void {
    const item = this.selectedItem();
    if (item) this.isUpdateDialogOpen.set(true);
  }

  // ── Dialog: Delete ──────────────────────────────────────────
  openDeleteDialog(item: GetPharmacyInventoryDTO): void {
    this.selectedItem.set(item);
    this.isDeleteDialogOpen.set(true);
  }

  private isFormValid(): boolean {
    if (!this.isEditing()) {
      if (!this.formBranchId().trim()) {
        this.warn('يرجى تحديد الفرع (Branch ID).');
        return false;
      }
      if (!this.formDrugId().trim()) {
        this.warn('يرجى إدخال معرّف الدواء (Drug ID).');
        return false;
      }
    }
    if (this.formStockQuantity() < 0 || this.formUnitPrice() < 0) {
      this.warn('الكمية والسعر يجب أن تكون قيمًا موجبة.');
      return false;
    }
    return true;
  }

  private warn(detail: string): void {
    this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail });
  }

  save(): void {
    if (!this.isFormValid()) return;

    this.isSaving.set(true);
    const expiry = this.formExpiryDate() ? this.formExpiryDate() : null;

    if (this.isEditing() && this.formInventoryId()) {
      const dto: UpdatePharmacyInventoryDto = {
        stockQuantity: this.formStockQuantity(),
        unitPrice: this.formUnitPrice(),
        expiryDate: expiry,
        rowVersion: this.formRowVersion(),
      };

      this.inventoryService.update(this.formInventoryId()!, dto).subscribe({
        next: () => {
          this.success('تم تحديث بيانات الدواء بنجاح.');
          this.isSaving.set(false);
          this.isFormDialogOpen.set(false);
          this.loadInventory();
        },
        error: (problem: ProblemDetails) => {
          this.isSaving.set(false);
          this.handleWriteError(problem, 'فشل تحديث بيانات الدواء.');
        },
      });
    } else {
      const dto: AddPharmacyInventoryDto = {
        branchId: this.formBranchId().trim(),
        drugId: this.formDrugId().trim(),
        stockQuantity: this.formStockQuantity(),
        unitPrice: this.formUnitPrice(),
        expiryDate: expiry,
      };

      this.inventoryService.add(dto).subscribe({
        next: () => {
          this.success('تمت إضافة الدواء إلى المخزون بنجاح.');
          this.isSaving.set(false);
          this.isFormDialogOpen.set(false);
          this.resetToFirstPage();
          this.loadInventory();
        },
        error: (problem: ProblemDetails) => {
          this.isSaving.set(false);
          this.handleWriteError(problem, 'فشل إضافة الدواء.');
        },
      });
    }
  }

  confirmDelete(): void {
    const item = this.selectedItem();
    if (!item) return;

    this.isDeleting.set(true);
    this.inventoryService.remove(item.inventoryId).subscribe({
      next: () => {
        this.success('تم حذف الدواء من المخزون بنجاح.');
        this.isDeleting.set(false);
        this.isDeleteDialogOpen.set(false);
        this.loadInventory();
      },
      error: (problem: ProblemDetails) => {
        this.isDeleting.set(false);
        const detail =
          problem.status === 409
            ? problem.detail ?? 'لا يمكن حذف هذا الدواء لوجود كمية محجوزة ضمن طلبات قائمة.'
            : problem.detail ?? 'فشل حذف الدواء.';
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail });
      },
    });
  }

  /**
   * Surfaces write errors. HTTP 409 → concurrency conflict (stale rowVersion);
   * HTTP 400 → validation (flatten `errors` map into a readable message).
   */
  private handleWriteError(problem: ProblemDetails, fallback: string): void {
    let detail = problem.detail ?? fallback;

    if (problem.status === 409) {
      detail =
        problem.detail ??
        'تم تعديل هذا السجل بواسطة مستخدم آخر. يرجى إعادة فتح النافذة والمحاولة مجددًا.';
    } else if (problem.status === 400 && problem.errors) {
      const messages = Object.values(problem.errors).flat();
      if (messages.length) detail = messages.join(' • ');
    }

    this.messageService.add({ severity: 'error', summary: 'خطأ', detail });
  }

  private success(detail: string): void {
    this.messageService.add({ severity: 'success', summary: 'نجاح', detail });
  }

  // Expose enum to template if needed.
  protected readonly InventoryStockStatus = InventoryStockStatus;
}
