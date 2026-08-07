import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api'; // لاستخدام Toast للإشعارات
import { ToastModule } from 'primeng/toast';
import { DriverService, DeliveryJobNotification } from '@core/services/driver.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-driver-dashboard',
    standalone: true,
    imports: [CommonModule, CardModule, ButtonModule, TagModule, ToastModule],
    providers: [MessageService], // ضروري لـ Toast PrimeNG
    templateUrl: './driver-dashboard.component.html',
})
export class DriverDashboardComponent implements OnInit, OnDestroy {
    private driverService = inject(DriverService);
    private messageService = inject(MessageService);

    // استخدام Signals
    availableJobs = signal<DeliveryJobNotification[]>([]);
    activeJob = signal<DeliveryJobNotification | null>(null);
    isLoading = signal<boolean>(false);

    private subs = new Subscription();

    ngOnInit() {
        const token = localStorage.getItem('token') || '';
        this.driverService.startConnection(token);

        // استقبال طلب جديد
        this.subs.add(
            this.driverService.newJobReceived$.subscribe((job) => {
                if (!this.activeJob()) {
                    this.availableJobs.update(jobs => [...jobs, job]);
                    this.messageService.add({ severity: 'info', summary: 'طلب جديد!', detail: `توصيلة جديدة من ${job.pharmacyName}` });
                }
            })
        );

        // مسح طلب لو طيار تاني خده
        this.subs.add(
            this.driverService.jobRemoved$.subscribe((jobId) => {
                this.availableJobs.update(jobs => jobs.filter(j => j.jobId !== jobId));
            })
        );
    }

    acceptJob(job: DeliveryJobNotification) {
        this.isLoading.set(true);
        this.driverService.acceptJob(job.jobId).subscribe({
            next: () => {
                this.activeJob.set(job);
                this.availableJobs.set([]); // تفريغ باقي الطلبات
                this.isLoading.set(false);
                this.messageService.add({ severity: 'success', summary: 'تم القبول', detail: 'تم قبول الطلب بنجاح، توجه للصيدلية!' });
            },
            error: (err) => {
                this.isLoading.set(false);
                this.messageService.add({ severity: 'error', summary: 'عفواً', detail: 'تم سحب الطلب من طيار آخر' });
                this.availableJobs.update(jobs => jobs.filter(j => j.jobId !== job.jobId));
            }
        });
    }

    completeJob() {
        const job = this.activeJob();
        if (!job) return;

        this.isLoading.set(true);
        this.driverService.completeJob(job.jobId).subscribe({
            next: () => {
                this.activeJob.set(null);
                this.isLoading.set(false);
                this.messageService.add({ severity: 'success', summary: 'تم التسليم', detail: 'تم إنهاء الطلب بنجاح، أنت متاح الآن.' });
            },
            error: () => {
                this.isLoading.set(false);
                this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'حدث خطأ أثناء إنهاء الطلب' });
            }
        });
    }

    ngOnDestroy() {
        this.driverService.stopConnection();
        this.subs.unsubscribe();
    }
}