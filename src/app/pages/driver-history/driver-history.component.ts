import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { DriverService, DeliveryJobHistory } from '@core/services/driver.service';
import { StatusTranslatePipe } from '@shared/pipes/status-translate.pipe';

@Component({
    selector: 'app-driver-history',
    standalone: true,
    imports: [CommonModule, TableModule, TagModule, CardModule, StatusTranslatePipe],
    templateUrl: './driver-history.component.html'
})
export class DriverHistoryComponent {
    private driverService = inject(DriverService);

    // 1. الداتا بقت Signals تاني عشان الجدول يترسم
    historyJobs = signal<DeliveryJobHistory[]>([]);
    totalRecords = signal<number>(0);
    pageSize = 10;

    // 2. متغير يمنع رفة الشاشة في البداية
    hasLoadedOnce = signal<boolean>(false);

    // 3. اللودر متغير عادي عشان PrimeNG ميعلقش
    isLoading: boolean = false;

    loadHistory(event: TableLazyLoadEvent) {
        // تشغيل اللودر
        Promise.resolve().then(() => this.isLoading = true);

        const first = event.first ?? 0;
        const rows = event.rows ?? this.pageSize;
        const pageNumber = Math.floor(first / rows) + 1;

        this.driverService.getDriverHistory(pageNumber, rows).subscribe({
            next: (res: any) => {
                this.historyJobs.set(res.items || res.data || []);
                this.totalRecords.set(res.totalCount ?? res.TotalCount ?? res.count ?? 0);

                this.hasLoadedOnce.set(true); // الداتا جات أول مرة
                this.isLoading = false; // اقفل اللودر
            },
            error: (err) => {
                console.error('Error fetching history:', err);
                this.hasLoadedOnce.set(true);
                this.isLoading = false;
            }
        });
    }
}