import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { InventoryService } from '@core/services/inventory.service';
import { PharmacyInventoryDto } from '../inventory.model';
import { InventoryStatusTranslatePipe } from '../inventory-status-translate.pipe';

@Component({
  selector: 'app-view-inventory-dialog',
  standalone: true,
  imports: [DatePipe, DecimalPipe, NgClass, DialogModule, InventoryStatusTranslatePipe],
  templateUrl: './view-inventory-dialog.component.html',
})
export class ViewInventoryDialogComponent implements OnChanges {
  private readonly inventoryService = inject(InventoryService);

  @Input() visible = false;
  @Input() inventoryId: string | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() editRequested = new EventEmitter<void>();

  readonly item = signal<PharmacyInventoryDto | null>(null);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true && this.inventoryId) {
      this.load();
    }
    if (changes['visible']?.currentValue === false) {
      this.item.set(null);
      this.errorMessage.set(null);
    }
  }

  private load(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.item.set(null);

    this.inventoryService.getById(this.inventoryId!).subscribe({
      next: (detail) => {
        this.item.set(detail);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('تعذّر تحميل تفاصيل الدواء.');
        this.isLoading.set(false);
      },
    });
  }

  close(): void {
    this.visibleChange.emit(false);
  }

  requestEdit(): void {
    this.editRequested.emit();
    this.close();
  }
}
