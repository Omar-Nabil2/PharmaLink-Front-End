import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { InventoryService } from '@core/services/inventory.service';
import { GetPharmacyInventoryDTO, PharmacyInventoryDto, ProblemDetails, UpdatePharmacyInventoryDto } from '../inventory.model';

@Component({
  selector: 'app-update-inventory-dialog',
  standalone: true,
  imports: [FormsModule, DialogModule, ToastModule],
  providers: [MessageService],
  templateUrl: './update-inventory-dialog.component.html',
})
export class UpdateInventoryDialogComponent implements OnChanges {
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
  readonly formStockQuantity = signal(0);
  readonly formUnitPrice = signal(0);
  readonly formExpiryDate = signal('');
  readonly formRowVersion = signal<string | null>(null);
  readonly isSaving = signal(false);
  readonly isDetailLoading = signal(false);

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
    this.formStockQuantity.set(item.stockQuantity);
    this.formUnitPrice.set(item.unitPrice);
    this.formExpiryDate.set(item.expiryDate ? item.expiryDate.substring(0, 10) : '');
    this.formRowVersion.set(null);
  }

  // ── Save ─────────────────────────────────────────────────────
  save(): void {
    if (!this.item) return;
    if (this.formStockQuantity() < 0 || this.formUnitPrice() < 0) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'الكمية والسعر يجب أن تكون قيمًا موجبة.' });
      return;
    }

    this.isSaving.set(true);
    const dto: UpdatePharmacyInventoryDto = {
      stockQuantity: this.formStockQuantity(),
      unitPrice: this.formUnitPrice(),
      expiryDate: this.formExpiryDate() || null,
      rowVersion: this.formRowVersion(),
    };

    this.inventoryService.update(this.item.inventoryId, dto).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.close();
        this.saved.emit();
      },
      error: (problem: ProblemDetails) => {
        this.isSaving.set(false);
        let detail = problem.detail ?? 'فشل تحديث بيانات الدواء.';
        if (problem.status === 409) detail = problem.detail ?? 'تم تعديل هذا السجل بواسطة مستخدم آخر. يرجى إعادة فتح النافذة والمحاولة مجددًا.';
        else if (problem.status === 400 && problem.errors) {
          const msgs = Object.values(problem.errors).flat();
          if (msgs.length) detail = msgs.join(' • ');
        }
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail });
      },
    });
  }

  close(): void {
    this.visibleChange.emit(false);
  }
}
