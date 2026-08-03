import { ChangeDetectionStrategy, Component, computed, inject, input, signal, DestroyRef } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { InventoryForecastingService } from '@core/services/inventory-forecasting.service';
import { of, Subject } from 'rxjs';
import { ForecastReportResponse, PurchaseOrderDTO } from '@core/interfaces/inventory-forecasting.model';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { SearchService } from '@core/services/search.service';
import { PharmacyBranchSearchDTO } from '@pages/inventory/search.model';

@Component({
    selector: 'app-ai-forecasting',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        DecimalPipe,
        DatePipe,
        FormsModule,
        CardModule,
        TableModule,
        ButtonModule,
        ToastModule,
        AutoCompleteModule
    ],
    providers: [MessageService],
    templateUrl: './ai-forecasting.component.html',
    styleUrl: './ai-forecasting.component.scss'
})
export class AiForecastingComponent {
    private readonly forecastingService = inject(InventoryForecastingService);
    private readonly messageService = inject(MessageService);
    private readonly searchService = inject(SearchService);
    private readonly destroyRef = inject(DestroyRef);

    readonly branchId = input<string | undefined>(undefined);

    readonly isTriggering = signal<boolean>(false);
    readonly isApproving = signal<Record<string, boolean>>({});

    readonly selectedBranchId = signal<string | undefined>(undefined);
    readonly branchFilterSuggestions = signal<PharmacyBranchSearchDTO[]>([]);
    readonly selectedBranchFilter = signal<PharmacyBranchSearchDTO | null>(null);
    private readonly branchFilterQuery$ = new Subject<string>();

    constructor() {
        this.branchFilterQuery$
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                switchMap((term) => this.searchService.searchBranches(term)),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe((results) => this.branchFilterSuggestions.set(results ?? []));
    }

    onBranchFilterSearch(query: string): void {
        this.branchFilterQuery$.next(query ?? '');
    }

    onBranchFilterSelected(branch: PharmacyBranchSearchDTO): void {
        this.selectedBranchFilter.set(branch);
        this.selectedBranchId.set(branch.branchId);
        this.currentPage.set(1);
    }

    onBranchFilterCleared(): void {
        this.selectedBranchFilter.set(null);
        this.selectedBranchId.set(undefined);
    }

    readonly currentPage = signal<number>(1);
    readonly pageSize = signal<number>(5);

    readonly forecastResource = rxResource({
        params: () => ({
            branchId: this.selectedBranchId() || this.branchId(),
            page: this.currentPage(),
            size: this.pageSize()
        }),
        stream: ({ params }) => {
            if (!params.branchId) return of({ success: true, data: [] } as ForecastReportResponse);
            return this.forecastingService.getBranchForecastReport(params.branchId, params.page, params.size);
        }
    });

    readonly forecastLogs = computed(() => this.forecastResource.value()?.data ?? []);
    readonly totalForecastRecords = computed(() => this.forecastResource.value()?.pagination?.totalCount ?? 0);

    // ── دالة لتغيير الصفحة من الجدول ──
    onPageChange(event: any): void {
        const first = event.first ?? 0;
        const rows = event.rows ?? 5;
        const page = Math.floor(first / rows) + 1;

        // نتأكد إن الصفحة فعلاً اتغيرت قبل ما نحدث الـ Signals عشان نمنع الـ Reset العشوائي
        if (this.currentPage() !== page || this.pageSize() !== rows) {
            this.currentPage.set(page);
            this.pageSize.set(rows);
        }
    }

    readonly poResource = rxResource({
        params: () => ({ branchId: this.selectedBranchId() || this.branchId() }),
        stream: ({ params }) => {
            if (!params.branchId) return of([] as PurchaseOrderDTO[]);
            return this.forecastingService.getPendingPurchaseOrders(params.branchId);
        }
    });

    readonly pendingPOs = computed(() => this.poResource.value() ?? []);
    readonly isLoading = computed(() => this.poResource.isLoading() || this.forecastResource.isLoading());

    triggerManualForecast(): void {
        this.isTriggering.set(true);
        this.forecastingService.triggerForecast(this.selectedBranchId() || this.branchId(), 30).subscribe({
            next: (res) => {
                this.messageService.add({ severity: 'success', summary: 'تم بنجاح', detail: res.message });
                this.forecastResource.reload();
                this.poResource.reload();
                this.isTriggering.set(false);
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'حدث خطأ أثناء تشغيل الذكاء الاصطناعي' });
                this.isTriggering.set(false);
            }
        });
    }

    approveOrder(orderId: string): void {
        this.isApproving.update(state => ({ ...state, [orderId]: true }));
        this.forecastingService.approvePurchaseOrder(orderId).subscribe({
            next: (res) => {
                this.messageService.add({ severity: 'success', summary: 'تم الاعتماد', detail: 'تم اعتماد أمر الشراء بنجاح وإضافته للمخزون' });
                this.poResource.reload();
                this.isApproving.update(state => ({ ...state, [orderId]: false }));
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذر اعتماد الأمر، قد يكون تم معالجته مسبقاً' });
                this.isApproving.update(state => ({ ...state, [orderId]: false }));
            }
        });
    }
}