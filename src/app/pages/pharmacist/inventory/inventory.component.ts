import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { InventoryService } from '../../../core/services/inventory.service';
import { GetPharmacyInventoryDTO, InventoryStatusFilter, InventoryStockStatus, GetPharmacyInventoryParamRequest } from '@pages/inventory/inventory.model';
import { DialogModule } from 'primeng/dialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button'; // 👈 تم الإضافة هنا
import { AdjustmentType, AdjustStockDTO } from '@core/interfaces/inventory.interface';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-inventory',
  standalone: true,
  // 👈 تم إضافة ButtonModule في السطر اللي تحت
  imports: [CommonModule, FormsModule, TableModule, InputTextModule, DialogModule, RadioButtonModule, InputNumberModule, ButtonModule],
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss'],
})
export class InventoryComponent {
  inventoryItems: GetPharmacyInventoryDTO[] = [];
  loading = true;
  totalRecords = 0;

  // Pagination
  first = 0;
  rows = 10;
  currentPage = 1;

  // Filters
  searchTermInput = '';
  searchSubject = new Subject<string>();
  status: InventoryStatusFilter = InventoryStatusFilter.All;

  filterOptions = [
    { label: 'الكل', value: InventoryStatusFilter.All },
    { label: 'متاح', value: InventoryStatusFilter.Available },
    { label: 'نواقص (قارب على النفاذ)', value: InventoryStatusFilter.LowStock },
    { label: 'غير متوفر (نفد)', value: InventoryStatusFilter.OutOfStock },
  ];
  displayManageModal = false;
  savingStock = false;
  selectedItem: any = null;
  AdjustmentType = AdjustmentType;

  adjustStockData: AdjustStockDTO = {
    type: AdjustmentType.Increase,
    quantity: 1,
  };

  constructor(
    private inventoryService: InventoryService,
    private cd: ChangeDetectorRef,
    private messageService: MessageService
  ) {
    this.searchSubject.pipe(debounceTime(500), distinctUntilChanged()).subscribe((term) => {
      this.first = 0;
      this.currentPage = 1;
      this.loadData();
    });
  }

  onLazyLoad(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    this.currentPage = event.first / event.rows + 1;
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.inventoryItems = [];
    const params: GetPharmacyInventoryParamRequest = {
      pageNumber: this.currentPage,
      pageSize: this.rows,
      search: this.searchTermInput,
      statusFilter: this.status,
    };
    this.inventoryService.getInventory(params).subscribe({
      next: (res) => {
        this.inventoryItems = res.items;
        this.totalRecords = res.totalCount;
        this.loading = false;
        this.cd.markForCheck();
      },
      error: (err: any) => { // 👈 تم إضافة النوع any هنا
        console.error('Error loading inventory:', err);
        this.loading = false;
        this.cd.markForCheck();
      },
    });
  }

  onSearchChange(value: string) {
    this.searchSubject.next(value);
  }

  setFilter(filterValue: InventoryStatusFilter) {
    this.status = filterValue;
    this.first = 0;
    this.currentPage = 1;
    this.loadData();
  }

  getStatusClasses(status: string): string {
    switch (status) {
      case 'Available':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'LowStock':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'OutOfStock':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  }

  getStatusArabicLabel(status: string): string {
    switch (status) {
      case 'Available':
        return 'متاح';
      case 'LowStock':
        return 'قارب على النفاذ';
      case 'OutOfStock':
        return 'غير متوفر';
      default:
        return status;
    }
  }

  openManageModal(item: any) {
    this.selectedItem = item;
    this.adjustStockData = {
      type: AdjustmentType.Increase,
      quantity: 1,
    };
    this.displayManageModal = true;
  }

  closeManageModal() {
    this.displayManageModal = false;
    this.selectedItem = null;
  }

  submitStockAdjustment() {
    if (!this.selectedItem || this.adjustStockData.quantity <= 0) {
      this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'الكمية يجب أن تكون أكبر من صفر' });
      return;
    }

    if (this.adjustStockData.type === AdjustmentType.Decrease) {
      const availableForDeduction = this.selectedItem.stockQuantity - this.selectedItem.reservedQuantity;
      if (this.adjustStockData.quantity > availableForDeduction) {
        this.messageService.add({
          severity: 'error',
          summary: 'لا يمكن السحب',
          detail: `أقصى كمية متاحة للسحب هي ${availableForDeduction} وحدة فقط بسبب وجود كميات محجوزة.`
        });
        return;
      }
    }

    this.savingStock = true;
    this.inventoryService.adjustStock(this.selectedItem.inventoryId, this.adjustStockData)
      .subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم تحديث كمية المخزون بنجاح' });
          this.closeManageModal();
          this.loadData();
          this.savingStock = false;
        },
        error: (err: any) => { // 👈 تم إضافة النوع any هنا
          console.error(err);
          this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'حدث خطأ أثناء تحديث المخزون' });
          this.savingStock = false;
        }
      });
  }
}