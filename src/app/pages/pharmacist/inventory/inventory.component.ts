import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { InventoryService } from '../../../core/services/inventory.service';
import { GetPharmacyInventoryDTO, InventoryStatusFilter, GetPharmacyInventoryParamRequest } from '@pages/inventory/inventory.model';

@Component({
    selector: 'app-inventory',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, InputTextModule],
    templateUrl: './inventory.component.html',
    styleUrls: ['./inventory.component.scss']
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
        { label: 'غير متوفر (نفد)', value: InventoryStatusFilter.OutOfStock }
    ];

    constructor(private inventoryService: InventoryService, private cd: ChangeDetectorRef) {
        // Debounce search to avoid calling API on every keystroke
        this.searchSubject.pipe(
            debounceTime(500),
            distinctUntilChanged()
        ).subscribe(term => {
            this.first = 0; // Reset to first page on search
            this.currentPage = 1;
            this.loadData();
        });
    }

    onLazyLoad(event: any) {
        this.first = event.first;
        this.rows = event.rows;
        this.currentPage = (event.first / event.rows) + 1;
        this.loadData();
    }

    loadData() {
        this.loading = true;
        const params: GetPharmacyInventoryParamRequest = {
            pageNumber: this.currentPage,
            pageSize: this.rows,
            search: this.searchTermInput,
            statusFilter: this.status
        };
        this.inventoryService.getInventory(params)
            .subscribe({
                next: (res) => {
                    this.inventoryItems = res.items;
                    this.totalRecords = res.totalCount;
                    this.loading = false;
                    this.cd.markForCheck();
                },
                error: (err) => {
                    console.error('Error loading inventory:', err);
                    this.loading = false;
                    this.cd.markForCheck();
                }
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
            case 'Available': return 'متاح';
            case 'LowStock': return 'قارب على النفاذ';
            case 'OutOfStock': return 'غير متوفر';
            default: return status;
        }
    }
}