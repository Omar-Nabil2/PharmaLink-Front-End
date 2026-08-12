import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, finalize } from 'rxjs';
import { RecurringPrescriptionsService, RecurringDto } from '../../../core/services/recurring-prescriptions.service';

interface BranchOption { id: string; name: string; }

@Component({
  selector: 'app-create-recurring',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './create-recurring.html',
  styleUrl: './create-recurring.scss',
})
export class CreateRecurring implements OnInit, OnDestroy {
  isLoading = false;
  saving = false;
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
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.editId = this.route.snapshot.queryParamMap.get('edit');
    if (this.editId) this.loadForEdit(this.editId);
  }

  loadForEdit(id: string) {
    this.isLoading = true;
    this.svc.getAll().pipe(takeUntil(this.destroy$), finalize(() => this.isLoading = false)).subscribe({
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

  submit() {
    if (!this.form.name?.trim()) { this.error = 'يرجى إدخال اسم للروشتة الدورية'; return; }
    this.error = null;
    this.saving = true;
    const payload = {
      ...this.form,
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
