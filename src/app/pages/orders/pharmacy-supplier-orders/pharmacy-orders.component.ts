import { Component, OnInit, inject, signal, DestroyRef, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { SelectModule } from 'primeng/select';// أضفنا ده للفلتر
import { InputTextModule } from 'primeng/inputtext'; // أضفنا ده للبحث
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PurchaseOrderService } from '../../../core/services/purchase-order.service';
import { SearchService } from '@core/services/search.service';
import { PharmacyBranchSearchDTO } from '@pages/inventory/search.model';

@Component({
    selector: 'app-pharmacy-orders',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        TagModule,
        ToastModule,
        ConfirmDialogModule,
        AutoCompleteModule,
        SelectModule, // تم الإضافة
        InputTextModule // تم الإضافة
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './pharmacy-orders.component.html'
})
export class PharmacyOrdersComponent implements OnInit {
    private poService = inject(PurchaseOrderService);
    private searchService = inject(SearchService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);
    private destroyRef = inject(DestroyRef);

    // حالة الطلبيات الأساسية
    orders = signal<any[]>([]);
    isLoading = signal<boolean>(false);

    // متغيرات البحث عن الفرع 
    selectedBranchId = signal<string | undefined>(undefined);
    branchFilterSuggestions = signal<PharmacyBranchSearchDTO[]>([]);
    selectedBranchFilter = signal<PharmacyBranchSearchDTO | null>(null);
    private branchFilterQuery$ = new Subject<string>();

    // متغيرات الفلتر والبحث داخل الجدول
    searchQuery = signal<string>('');
    selectedStatus = signal<string | null>(null);

    // الداتا المفلترة اللي الجدول هيقرا منها (بتتحدث تلقائياً)
    filteredOrders = computed(() => {
        let currentOrders = this.orders();
        const status = this.selectedStatus();
        const query = this.searchQuery().toLowerCase().trim();

        // فلترة بالحالة
        if (status) {
            currentOrders = currentOrders.filter(o => o.status === status);
        }

        // فلترة بالبحث النصي (في اسم الدواء)
        if (query) {
            currentOrders = currentOrders.filter(o =>
                (o.drugName && o.drugName.toLowerCase().includes(query))
            );
        }

        return currentOrders;
    });

    statusOptions = [
        { label: 'الكل', value: null }, // خيار لإلغاء الفلتر
        { label: 'في انتظار الموافقة', value: 'PendingPharmacyApproval' },
        { label: 'أرسلت للمورد', value: 'SentToSupplier' },
        { label: 'مقبولة من المورد', value: 'AcceptedBySupplier' },
        { label: 'قيد التجهيز', value: 'ProcessingBySupplier' },
        { label: 'تم الشحن', value: 'Shipped' },
        { label: 'تم التوصيل', value: 'Delivered' },
        { label: 'مرفوضة', value: 'RejectedBySupplier' }
    ];

    constructor() {
        this.branchFilterQuery$
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                switchMap((term) => this.searchService.searchBranches(term)),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((results) => this.branchFilterSuggestions.set(results ?? []));
    }

    ngOnInit(): void { }

    onBranchFilterSearch(event: any): void {
        this.branchFilterQuery$.next(event.query ?? '');
    }

    onBranchSelected(event: any): void {
        const branch: PharmacyBranchSearchDTO = event.value;
        if (branch && branch.branchId) {
            this.selectedBranchFilter.set(branch);
            this.selectedBranchId.set(branch.branchId);
            this.loadOrders();
        }
    }

    onBranchCleared(): void {
        this.selectedBranchFilter.set(null);
        this.selectedBranchId.set(undefined);
        this.orders.set([]);
        this.selectedStatus.set(null); // تصفير الفلاتر
        this.searchQuery.set('');
    }

    loadOrders(): void {
        const branchId = this.selectedBranchId();
        if (!branchId) return;

        this.isLoading.set(true);
        this.poService.getBranchOrders(branchId).subscribe({
            next: (data) => {
                this.orders.set(data);
                this.isLoading.set(false);
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذر جلب بيانات الطلبيات' });
                this.isLoading.set(false);
            }
        });
    }

    // دوال التحديث للبحث والفلتر
    onSearchChange(event: Event) {
        const input = event.target as HTMLInputElement;
        this.searchQuery.set(input.value);
    }

    onStatusChange(event: any) {
        this.selectedStatus.set(event.value);
    }

    confirmReceive(order: any): void {
        this.confirmationService.confirm({
            message: `هل أنت متأكد من استلام طلبية "${order.drugName || 'هذا الدواء'}" وتحديث المخزون؟`,
            header: 'تأكيد الاستلام',
            icon: 'pi pi-check-circle',
            acceptLabel: 'نعم، استلمت الشحنة',
            rejectLabel: 'إلغاء',
            acceptButtonStyleClass: 'p-button-success',
            accept: () => {
                this.processReceiving(order.id);
            }
        });
    }

    private processReceiving(orderId: string): void {
        const branchId = this.selectedBranchId();
        if (!branchId) return;

        this.poService.receiveOrder(orderId, branchId).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم استلام الطلبية بنجاح وتم تحديث المخزون.' });
                this.loadOrders();
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'حدث خطأ أثناء محاولة استلام الطلبية.' });
            }
        });
    }

    getSeverity(status: string): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" {
        switch (status) {
            case 'PendingPharmacyApproval': return 'warn';
            case 'SentToSupplier': return 'info';
            case 'AcceptedBySupplier': return 'info';
            case 'ProcessingBySupplier': return 'info';
            case 'Shipped': return 'danger';
            case 'Delivered': return 'success';
            case 'RejectedBySupplier': return 'danger';
            default: return 'secondary';
        }
    }

    translateStatus(status: string): string {
        const statusMap: { [key: string]: string } = {
            'PendingPharmacyApproval': 'في انتظار المورد',
            'SentToSupplier': 'أُرسلت للمورد',
            'AcceptedBySupplier': 'مقبولة من المورد',
            'ProcessingBySupplier': 'قيد التجهيز',
            'Shipped': 'تم الشحن',
            'Delivered': 'تم الاستلام',
            'RejectedBySupplier': 'مرفوضة'
        };
        return statusMap[status] || status;
    }
}