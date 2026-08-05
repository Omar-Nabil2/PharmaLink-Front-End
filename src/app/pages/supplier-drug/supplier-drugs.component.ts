import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { SupplierFeaturesService } from '../../core/services/supplier-features.service';
import { AvailableDrugDTO, SupplierDrugDTO } from '../../core/interfaces/supplier-features.model';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { AutoCompleteModule } from 'primeng/autocomplete';

@Component({
    selector: 'app-supplier-drugs',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, FormsModule, TableModule, ToastModule, DialogModule, SelectModule, AutoCompleteModule],
    providers: [MessageService],
    templateUrl: './supplier-drugs.component.html',
    styleUrls: ['./supplier-drugs.component.scss']
})
export class SupplierDrugsComponent {
    private readonly featuresService = inject(SupplierFeaturesService);
    private readonly messageService = inject(MessageService);

    readonly currentPage = signal<number>(1);
    readonly pageSize = signal<number>(10);
    readonly searchQuery = signal<string>('');
    readonly debouncedSearch = signal<string>('');

    private searchSubject = new Subject<string>();

    constructor() {
        // تأخير البحث 300 مللي ثانية لمنع الضغط على السيرفر
        this.searchSubject.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            takeUntilDestroyed()
        ).subscribe((val: string) => {
            this.debouncedSearch.set(val);
            this.currentPage.set(1); // لما يبحث، بنرجعه للصفحة الأولى
        });
    }

    onSearch(event: Event): void {
        const val = (event.target as HTMLInputElement).value;
        this.searchQuery.set(val);
        this.searchSubject.next(val);
    }

    // ─── جلب الأدوية الحالية (مع التحديث التلقائي لو البارامترز اتغيرت) ───
    readonly drugsResource = rxResource({
        params: () => ({ page: this.currentPage(), size: this.pageSize(), search: this.debouncedSearch() }),
        stream: ({ params }) => this.featuresService.getMyDrugs(params.page, params.size, params.search)
    });

    // حددنا النوع صراحة عشان نمنع إيرور الـ never[]
    readonly myDrugs = computed<SupplierDrugDTO[]>(() => this.drugsResource.value()?.data ?? []);
    readonly totalRecords = computed<number>(() => this.drugsResource.value()?.pagination?.totalCount ?? 0);
    readonly isLoading = computed<boolean>(() => this.drugsResource.isLoading());

    // ─── تغيير الصفحة أو حجمها من الجدول ───
    onPageChange(event: any): void {
        const first = event.first ?? 0;
        const rows = event.rows ?? 10;
        const page = Math.floor(first / rows) + 1;

        if (this.currentPage() !== page || this.pageSize() !== rows) {
            this.currentPage.set(page);
            this.pageSize.set(rows);
        }
    }

    // ─── إدارة نافذة الإضافة (Dialog) ───
    readonly showAddDialog = signal(false);
    readonly searchedDrugs = signal<AvailableDrugDTO[]>([]); // الأدوية اللي جاية من البحث
    readonly selectedDrug = signal<AvailableDrugDTO | null>(null); // الدواء اللي اليوزر اختاره
    readonly isAvailableLoading = signal(false);
    readonly isAdding = signal(false);
    readonly deletingIds = signal<Record<string, boolean>>({});

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
        this.featuresService.searchGlobalDrugs(query).subscribe({
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

        // 1. فحص مبدئي في الفرونت إند (بيشوف الأدوية اللي ظاهرة في الجدول الحالي)
        const existsInCurrentPage = this.myDrugs().some(d => d.drugId === drug.drugId);
        if (existsInCurrentPage) {
            this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'هذا الدواء موجود أمامك في الجدول بالفعل!' });
            return;
        }

        this.isAdding.set(true);
        // نبعت الـ drugId للباك إند (واللي بدوره هيتأكد من كل الداتابيز)
        this.featuresService.addDrug(drug.drugId).subscribe({
            next: (res) => {
                this.messageService.add({ severity: 'success', summary: 'تم', detail: res.message || 'تمت الإضافة بنجاح' });
                this.drugsResource.reload(); // تحديث الجدول
                this.showAddDialog.set(false);
                this.isAdding.set(false);
            },
            error: (err) => {
                // لو الباك إند رجع إيرور إن الدواء موجود، هتتعرض هنا
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
                this.drugsResource.reload();
                this.deletingIds.update(state => ({ ...state, [drugId]: false }));
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل إزالة الدواء' });
                this.deletingIds.update(state => ({ ...state, [drugId]: false }));
            }
        });
    }
}