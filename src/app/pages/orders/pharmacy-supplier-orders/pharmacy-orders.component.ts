import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import Swal from 'sweetalert2';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
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
        SelectModule,
        InputTextModule
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

    // حالة الطلبيات الأساسية (بدون filteredOrders)
    orders = signal<any[]>([]);
    isLoading = signal<boolean>(false);

    // متغيرات الـ Pagination (Server-side)
    totalRecords = signal<number>(0);
    currentPage = signal<number>(1);
    pageSize = signal<number>(10);

    // متغيرات البحث عن الفرع 
    selectedBranchId = signal<string | undefined>(undefined);
    branchFilterSuggestions = signal<PharmacyBranchSearchDTO[]>([]);
    selectedBranchFilter = signal<PharmacyBranchSearchDTO | null>(null);
    private branchFilterQuery$ = new Subject<string>();

    // متغيرات الفلتر والبحث
    searchQuery = signal<string>('');
    selectedStatus = signal<string | null>(null);
    private searchSubject = new Subject<string>(); // للتحكم في توقيت البحث النصي

    statusOptions = [
        { label: 'الكل', value: null },
        { label: 'في انتظار الموافقة', value: 'PendingPharmacyApproval' },
        { label: 'أرسلت للمورد', value: 'SentToSupplier' },
        { label: 'مقبولة من المورد', value: 'AcceptedBySupplier' },
        { label: 'قيد التجهيز', value: 'ProcessingBySupplier' },
        { label: 'تم الشحن', value: 'Shipped' },
        { label: 'تم التوصيل', value: 'Delivered' },
        { label: 'مرفوضة', value: 'RejectedBySupplier' }
    ];

    constructor() {
        // إعداد البحث التلقائي للفروع
        this.branchFilterQuery$
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                switchMap((term) => this.searchService.searchBranches(term)),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((results) => this.branchFilterSuggestions.set(results ?? []));

        // إعداد البحث النصي باسم الدواء (Debounce لتحسين الأداء)
        this.searchSubject
            .pipe(
                debounceTime(500), // الانتظار نصف ثانية بعد آخر حرف
                distinctUntilChanged(),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((query) => {
                this.searchQuery.set(query);
                this.currentPage.set(1); // الرجوع للصفحة الأولى عند البحث
                this.loadOrders();
            });
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
            this.currentPage.set(1); // تصفير الصفحة عند تغيير الفرع
            this.loadOrders();
        }
    }

    onBranchCleared(): void {
        this.selectedBranchFilter.set(null);
        this.selectedBranchId.set(undefined);
        this.orders.set([]);
        this.totalRecords.set(0);
        this.selectedStatus.set(null);
        this.searchQuery.set('');
        this.currentPage.set(1);
    }

    loadOrders(): void {
        const branchId = this.selectedBranchId();
        if (!branchId) return;

        this.isLoading.set(true);
        this.poService.getBranchOrders(
            branchId,
            this.currentPage(),
            this.pageSize(),
            this.searchQuery(),
            this.selectedStatus() || undefined
        ).subscribe({
            next: (data: any) => {
                // بناءً على تعديل الـ Backend، متوقع يرجع PagedResult
                this.orders.set(data.items || []);
                this.totalRecords.set(data.totalCount || 0);
                this.isLoading.set(false);
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذر جلب بيانات الطلبيات' });
                this.isLoading.set(false);
            }
        });
    }

    // يتم استدعاؤها من جدول PrimeNG عند التبديل بين الصفحات
    onPageChange(event: any) {
        // event.first: ترتيب أول عنصر في الصفحة، event.rows: عدد العناصر
        const page = Math.floor(event.first / event.rows) + 1;
        this.currentPage.set(page);
        this.pageSize.set(event.rows);
        this.loadOrders();
    }

    onSearchChange(event: Event) {
        const input = event.target as HTMLInputElement;
        // نمرر القيمة للـ Subject عشان يعملها Debounce قبل ما يبعت للسيرفر
        this.searchSubject.next(input.value.trim().toLowerCase());
    }

    onStatusChange(event: any) {
        this.selectedStatus.set(event.value);
        this.currentPage.set(1); // الرجوع للصفحة الأولى عند الفلترة بالحالة
        this.loadOrders();
    }

    confirmReceive(order: any): void {
        Swal.fire({
            title: 'تأكيد الاستلام',
            text: `هل أنت متأكد من استلام طلبية "${order.drugName || 'هذا الدواء'}" وتحديث المخزون؟`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'نعم، استلمت الشحنة',
            cancelButtonText: 'إلغاء'
        }).then((result) => {
            if (result.isConfirmed) {
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