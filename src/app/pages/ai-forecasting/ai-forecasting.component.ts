import { ChangeDetectionStrategy, Component, computed, inject, input, signal, DestroyRef } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DialogModule } from 'primeng/dialog'; // أضفنا ده
import { SelectModule } from 'primeng/select'; // أضفنا ده لـ PrimeNG 18
import { of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { InventoryForecastingService } from '@core/services/inventory-forecasting.service';
import { SearchService } from '@core/services/search.service';
import { SignalrService } from '@core/services/signalr.service';
import { ForecastReportResponse, PurchaseOrderDTO } from '@core/interfaces/inventory-forecasting.model';
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
        AutoCompleteModule,
        DialogModule, // جديد
        SelectModule  // جديد
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
    private readonly signalrService = inject(SignalrService);

    readonly branchId = input<string | undefined>(undefined);

    readonly isTriggering = signal<boolean>(false);

    // ── المتغيرات الخاصة بنافذة تعيين المورد ──
    readonly showSupplierDialog = signal<boolean>(false);
    readonly selectedPoForAssign = signal<PurchaseOrderDTO | null>(null);
    readonly availableSuppliers = signal<any[]>([]);
    readonly isLoadingSuppliers = signal<boolean>(false);
    readonly selectedSupplierId = signal<string | null>(null);
    readonly isAssigning = signal<boolean>(false);

    readonly selectedBranchId = signal<string | undefined>(undefined);
    readonly branchFilterSuggestions = signal<PharmacyBranchSearchDTO[]>([]);
    readonly selectedBranchFilter = signal<PharmacyBranchSearchDTO | null>(null);
    private readonly branchFilterQuery$ = new Subject<string>();

    private currentSubscribedBranchId: string | null = null;

    constructor() {
        this.branchFilterQuery$
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                switchMap((term) => this.searchService.searchBranches(term)),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe((results) => this.branchFilterSuggestions.set(results ?? []));

        this.signalrService.poCreated$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((notification) => {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'تنبيه ذكي: أوامر شراء جديدة!',
                    detail: `تم إنشاء أمر شراء للصنف ${notification.drugName} بكمية ${notification.recommendedOrderQuantity}`,
                    life: 8000
                });

                this.poResource.reload();
                this.forecastResource.reload();
            });
    }

    // ... (نفس الكود الخاص بـ Filters و Resources بدون تغيير) ...
    onBranchFilterSearch(query: string): void { this.branchFilterQuery$.next(query ?? ''); }
    onBranchFilterSelected(branch: PharmacyBranchSearchDTO): void {
        this.selectedBranchFilter.set(branch);
        this.selectedBranchId.set(branch.branchId);
        this.currentPage.set(1);
        if (this.currentSubscribedBranchId) this.signalrService.unsubscribeFromBranch(this.currentSubscribedBranchId);
        this.signalrService.subscribeToBranch(branch.branchId);
        this.currentSubscribedBranchId = branch.branchId;
        this.poResource.reload();
        this.forecastResource.reload();
    }
    onBranchFilterCleared(): void {
        this.selectedBranchFilter.set(null);
        this.selectedBranchId.set(undefined);
        if (this.currentSubscribedBranchId) {
            this.signalrService.unsubscribeFromBranch(this.currentSubscribedBranchId);
            this.currentSubscribedBranchId = null;
        }
        this.poResource.reload();
        this.forecastResource.reload();
    }

    readonly currentPage = signal<number>(1);
    readonly pageSize = signal<number>(5);

    readonly forecastResource = rxResource({
        params: () => ({ branchId: this.selectedBranchId() || this.branchId(), page: this.currentPage(), size: this.pageSize() }),
        stream: ({ params }) => {
            if (!params.branchId) return of({ success: true, data: [] } as ForecastReportResponse);
            return this.forecastingService.getBranchForecastReport(params.branchId, params.page, params.size);
        }
    });

    readonly forecastLogs = computed(() => this.forecastResource.value()?.data ?? []);
    readonly totalForecastRecords = computed(() => this.forecastResource.value()?.pagination?.totalCount ?? 0);

    onPageChange(event: any): void {
        const first = event.first ?? 0;
        const rows = event.rows ?? 5;
        const page = Math.floor(first / rows) + 1;
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

    // ── الدوال الجديدة الخاصة بتعيين المورد ──

    openAssignDialog(po: any): void {
        console.log('PO Data:', po); // السطر ده هيطبعلك الـ Object كله في الكونسول عشان تشوف اسم الخاصية إيه بالظبط

        // هنا بناخد الـ ID سواء كان مبعوت كابيتال أو سمول
        const targetDrugId = po.drugId || po.DrugId;

        if (!targetDrugId) {
            this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'معرف الدواء غير موجود في الطلبية' });
            return;
        }

        this.selectedPoForAssign.set(po);
        this.selectedSupplierId.set(null);
        this.availableSuppliers.set([]);
        this.showSupplierDialog.set(true);
        this.isLoadingSuppliers.set(true);

        // استخدم targetDrugId المتغير الجديد هنا
        this.forecastingService.getSuppliersForDrug(targetDrugId).subscribe({
            next: (suppliers) => {
                this.availableSuppliers.set(suppliers);
                this.isLoadingSuppliers.set(false);
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذر جلب الموردين المتاحين لهذا الدواء' });
                this.isLoadingSuppliers.set(false);
                this.showSupplierDialog.set(false);
            }
        });
    }

    confirmAssignment(): void {
        const po = this.selectedPoForAssign();
        const supplierId = this.selectedSupplierId();
        const branchId = this.selectedBranchId() || this.branchId();

        if (!po || !supplierId || !branchId) return;

        this.isAssigning.set(true);
        this.forecastingService.assignSupplierToOrder(po.id, supplierId, branchId).subscribe({
            next: (res) => {
                this.messageService.add({ severity: 'success', summary: 'تم الإرسال', detail: res.message || 'تم إرسال أمر الشراء للمورد بنجاح' });
                this.showSupplierDialog.set(false);
                this.poResource.reload();
                this.isAssigning.set(false);
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذر إرسال الأمر للمورد' });
                this.isAssigning.set(false);
            }
        });
    }
}