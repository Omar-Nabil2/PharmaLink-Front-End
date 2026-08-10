import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { debounceTime, distinctUntilChanged, Subject, take } from 'rxjs';
import { SupplierFeaturesService } from '../../core/services/supplier-features.service';
import { AvailableDrugDTO, SupplierDrugDTO } from '../../core/interfaces/supplier-features.model';

@Component({
    selector: 'app-supplier-drugs',
    standalone: true,
    // ❌ مسحنا الـ OnPush عشان نتفادى أي صراع مع الشاشة
    imports: [CommonModule, FormsModule, TableModule, ToastModule, DialogModule, SelectModule, AutoCompleteModule],
    providers: [MessageService],
    templateUrl: './supplier-drugs.component.html',
    styleUrls: ['./supplier-drugs.component.scss']
})
export class SupplierDrugsComponent {
    private readonly featuresService = inject(SupplierFeaturesService);
    private readonly messageService = inject(MessageService);

    myDrugs = signal<SupplierDrugDTO[]>([]);
    totalRecords = signal<number>(0);
    hasLoadedOnce = signal<boolean>(false);

    isLoading: boolean = false; // اللودر بتاعنا اللي بنتحكم فيه

    currentPage = 1;
    pageSize = 10;
    searchQuery = signal<string>('');

    private searchSubject = new Subject<string>();

    constructor() {
        this.searchSubject.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            takeUntilDestroyed()
        ).subscribe((val) => {
            this.searchQuery.set(val);
            this.currentPage = 1;
            this.fetchData(1, this.pageSize);
        });
    }

    onLazyLoad(event: TableLazyLoadEvent): void {
        const first = event.first ?? 0;
        const rows = event.rows ?? this.pageSize;
        const pageNumber = Math.floor(first / rows) + 1;

        this.currentPage = pageNumber;
        this.pageSize = rows;

        this.fetchData(pageNumber, rows);
    }

    private fetchData(page: number, size: number): void {
        // تشغيل اللودر المانيوال
        Promise.resolve().then(() => this.isLoading = true);

        this.featuresService.getMyDrugs(page, size, this.searchQuery()).subscribe({
            next: (res: any) => {
                this.myDrugs.set(res.data || res.items || []);
                this.totalRecords.set(res.pagination?.totalCount ?? res.totalCount ?? 0);

                this.hasLoadedOnce.set(true);
                this.isLoading = false; // إيقاف اللودر فوراً
            },
            error: (err) => {
                console.error('Error fetching drugs:', err);
                this.hasLoadedOnce.set(true);
                this.isLoading = false;
            }
        });
    }

    onSearch(event: Event): void {
        const val = (event.target as HTMLInputElement).value;
        this.searchSubject.next(val);
    }

    // --- إدارة نافذة الإضافة ---
    showAddDialog = signal(false);
    searchedDrugs = signal<AvailableDrugDTO[]>([]);
    selectedDrug = signal<AvailableDrugDTO | null>(null);
    isAvailableLoading = signal(false);
    isAdding = signal(false);
    deletingIds = signal<Record<string, boolean>>({});

    openAddDialog(): void {
        this.selectedDrug.set(null);
        this.searchedDrugs.set([]);
        this.showAddDialog.set(true);
    }

    searchAvailableDrugs(event: any): void {
        const query = event.query;
        if (!query) {
            this.searchedDrugs.set([]);
            return;
        }

        this.isAvailableLoading.set(true);
        this.featuresService.searchGlobalDrugs(query).pipe(take(1)).subscribe({
            next: (drugs) => {
                this.searchedDrugs.set(drugs);
                this.isAvailableLoading.set(false);
            },
            error: () => {
                this.isAvailableLoading.set(false);
            }
        });
    }

    addDrug(): void {
        const drug = this.selectedDrug();
        if (!drug) return;

        const existsInCurrentPage = this.myDrugs().some(d => d.drugId === drug.drugId);
        if (existsInCurrentPage) {
            this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'هذا الدواء موجود أمامك في الجدول بالفعل!' });
            return;
        }

        this.isAdding.set(true);
        this.featuresService.addDrug(drug.drugId).subscribe({
            next: (res) => {
                this.messageService.add({ severity: 'success', summary: 'تم', detail: res.message || 'تمت الإضافة بنجاح' });
                this.fetchData(this.currentPage, this.pageSize);
                this.showAddDialog.set(false);
                this.isAdding.set(false);
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'خطأ', detail: err.error?.message || 'فشل إضافة الدواء' });
                this.isAdding.set(false);
            }
        });
    }

    removeDrug(drugId: string): void {
        this.deletingIds.update(state => ({ ...state, [drugId]: true }));
        this.featuresService.removeDrug(drugId).subscribe({
            next: (res) => {
                this.messageService.add({ severity: 'success', summary: 'تم', detail: res.message });
                this.fetchData(this.currentPage, this.pageSize);
                this.deletingIds.update(state => ({ ...state, [drugId]: false }));
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل إزالة الدواء' });
                this.deletingIds.update(state => ({ ...state, [drugId]: false }));
            }
        });
    }
}