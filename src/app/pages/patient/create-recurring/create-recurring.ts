import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, finalize } from 'rxjs';
import { RecurringPrescriptionsService, RecurringDto } from '../../../core/services/recurring-prescriptions.service';
import { PrescriptionService } from '../../../core/services/prescription.service';
import { HttpEventType } from '@angular/common/http';

interface BranchOption { id: string; name: string; }

@Component({
  selector: 'app-create-recurring',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './create-recurring.html',
  styleUrl: './create-recurring.scss',
})
export class CreateRecurring implements OnInit, OnDestroy {
  minDate = new Date().toISOString().split('T')[0];

  isLoading = false;
  saving = false;
  isUploading = false;
  uploadProgress = 0;
  selectedFile: File | null = null;
  editId: string | null = null;
  error: string | null = null;

  intervalOptions = [
    { label: 'أسبوعياً', value: 7 },
    { label: 'كل أسبوعين', value: 14 },
    { label: 'شهرياً', value: 30 },
    { label: 'كل 3 أشهر', value: 90 },
    { label: 'مخصص', value: 0 },
  ];

  customInterval = 30;
  selectedIntervalValue = 30;

  form = {
    name: '',
    notes: '',
    intervalDays: 30,
    startDate: new Date().toISOString().substring(0, 10),
    endDate: '' as string | undefined,
    fulfillmentMode: 'Delivery' as 'Delivery' | 'Pickup',
    preferredBranchId: '' as string | undefined,
    deliveryAddressId: '' as string | undefined,
    requireConfirmation: true,
  };

  private destroy$ = new Subject<void>();

  constructor(
    private svc: RecurringPrescriptionsService,
    private prescriptionSvc: PrescriptionService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.editId = this.route.snapshot.queryParamMap.get('edit');
    if (this.editId) this.loadForEdit(this.editId);
  }

  loadForEdit(id: string) {
    this.isLoading = true;
    this.svc.getAll().pipe(takeUntil(this.destroy$), finalize(() => { this.cdr.detectChanges(); this.isLoading = false; this.cdr.detectChanges(); })).subscribe({
      next: (items) => {
        const item = items.find(x => x.id === id);
        if (!item) return;
        this.form.name = item.name;
        this.form.notes = item.notes ?? '';
        this.form.intervalDays = item.intervalDays;
        this.form.startDate = item.startDate?.substring(0, 10);
        this.form.endDate = item.endDate?.substring(0, 10);
        this.form.fulfillmentMode = item.fulfillmentMode as 'Delivery' | 'Pickup';
        this.form.preferredBranchId = item.preferredBranchId;
        this.form.requireConfirmation = item.requireConfirmation;
        this.selectedIntervalValue = item.intervalDays;
        if (![7,14,30,90].includes(item.intervalDays)) {
          this.selectedIntervalValue = 0;
          this.customInterval = item.intervalDays;
        }
      }
    });
  }

  onIntervalChange() {
    if (this.selectedIntervalValue !== 0) {
      this.form.intervalDays = this.selectedIntervalValue;
    } else {
      this.form.intervalDays = this.customInterval;
    }
  }

  onCustomIntervalChange() {
    this.form.intervalDays = this.customInterval;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  submit() {
    if (!this.form.name?.trim()) { this.error = 'يرجى إدخال اسم للروشتة الدورية'; return; }
    this.error = null;
    this.saving = true;

    if (this.selectedFile && !this.editId) {
      this.isUploading = true;
      this.prescriptionSvc.uploadPrescription(this.selectedFile).pipe(takeUntil(this.destroy$)).subscribe({
        next: (event: any) => {
          if (event.type === HttpEventType.UploadProgress) {
            this.uploadProgress = Math.round((100 * event.loaded) / (event.total || 1));
          } else if (event.type === HttpEventType.Response) {
            const prescriptionId = event.body?.id;
            this.isUploading = false; this.cdr.detectChanges();
            this.submitRecurring(prescriptionId);
          }
        },
        error: () => { this.cdr.detectChanges();
          this.isUploading = false; this.cdr.detectChanges();
          this.saving = false;
          this.error = 'فشل رفع صورة الروشتة. يرجى المحاولة مرة أخرى.';
        }
      });
    } else {
      this.submitRecurring();
    }
  }

  private submitRecurring(prescriptionId?: string) {
    const payload = {
      ...this.form,
      prescriptionId: prescriptionId || undefined,
      endDate: this.form.endDate || undefined,
      preferredBranchId: this.form.preferredBranchId || undefined,
      deliveryAddressId: this.form.deliveryAddressId || undefined,
    };
    const req$ = this.editId
      ? this.svc.update(this.editId, payload)
      : this.svc.create(payload);
    req$.pipe(takeUntil(this.destroy$), finalize(() => this.saving = false)).subscribe({
      next: () => this.router.navigate(['/patient/prescriptions/recurring']),
      error: () => this.error = 'حدث خطأ أثناء الحفظ. يرجى المحاولة مرة أخرى.'
    });
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }
}
