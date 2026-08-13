import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, finalize } from 'rxjs';
import { RecurringPrescriptionsService, RecurringDto } from '../../../core/services/recurring-prescriptions.service';
import { PrescriptionService } from '../../../core/services/prescription.service';
import { HttpEventType } from '@angular/common/http';
import { PatientAddressesService } from '@core/services/patient-addresses.service';
import { PharmacyService } from '@core/services/pharmacy.service';
import { PatientAddress } from '@core/interfaces/profile.interface';
import { NearbyPharmacyDto } from '@core/interfaces/nearby-pharmacy.interface';


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
  selectedFilePreview: string | null = null;
  existingImageUrl: string | null = null;
  editId: string | null = null;
  error: string | null = null;

  intervalOptions = [
    { label: 'أسبوعياً', value: 7, icon: 'pi-calendar' },
    { label: 'كل أسبوعين', value: 14, icon: 'pi-calendar-plus' },
    { label: 'شهرياً', value: 30, icon: 'pi-calendar-clock' },
    { label: 'كل 3 أشهر', value: 90, icon: 'pi-calendar-times' },
    { label: 'مخصص', value: 0, icon: 'pi-sliders-h' },
  ];

  submitted = false;

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

  addresses: PatientAddress[] = [];
  pharmacies: NearbyPharmacyDto[] = [];
  isLoadingData = false;
  pharmacySearchTerm: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private svc: RecurringPrescriptionsService,
    private prescriptionSvc: PrescriptionService,
    private router: Router,
    private route: ActivatedRoute,
    private addressSvc: PatientAddressesService,
    private pharmacySvc: PharmacyService
  ) {}


  get filteredPharmacies(): NearbyPharmacyDto[] {
    if (!this.pharmacySearchTerm) return this.pharmacies;
    const term = this.pharmacySearchTerm.toLowerCase();
    return this.pharmacies.filter(p => 
      p.pharmacyName.toLowerCase().includes(term) || 
      p.branchName.toLowerCase().includes(term)
    );
  }

  ngOnInit() {
    try {
      this.editId = this.route.snapshot.queryParamMap.get('edit');
      if (this.editId) this.loadForEdit(this.editId);

      this.isLoadingData = true;
      this.addressSvc.getMyAddresses().pipe(takeUntil(this.destroy$)).subscribe({
        next: (res) => this.addresses = res,
        error: () => console.error('Failed to load addresses')
      });

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.pharmacySvc.getNearbyPharmacies({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              radiusKm: 50,
              pageNumber: 1,
              pageSize: 50
            }).pipe(takeUntil(this.destroy$)).subscribe({
              next: (res) => { this.pharmacies = res.items || []; this.isLoadingData = false; },
              error: () => { this.isLoadingData = false; }
            });
          },
          () => {
             this.pharmacySvc.getNearbyPharmacies({
              latitude: 30.0444,
              longitude: 31.2357,
              radiusKm: 1000,
              pageNumber: 1,
              pageSize: 20
            }).pipe(takeUntil(this.destroy$)).subscribe({
              next: (res) => { this.pharmacies = res.items || []; this.isLoadingData = false; },
              error: () => { this.isLoadingData = false; }
            });
          }
        );
      } else {
          this.isLoadingData = false;
      }
    } catch (e: any) {
      this.error = 'Error in ngOnInit: ' + (e?.message || e);
    }
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
        this.existingImageUrl = (item as any).prescriptionImageUrl || null;
        if (![7, 14, 30, 90].includes(item.intervalDays)) {
          this.selectedIntervalValue = 0;
          this.customInterval = item.intervalDays;
        }
      },
      error: () => {
        alert('حدث خطأ أثناء تحميل بيانات الروشتة الدورية');
        this.router.navigate(['/patient/prescriptions/recurring']);
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
      
      // Generate preview
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.selectedFilePreview = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        this.selectedFilePreview = null;
      }
    } else {
      this.selectedFile = null;
      this.selectedFilePreview = null;
    }
  }

  submit() {
    this.submitted = true;
    if (!this.form.name?.trim()) { this.error = 'يرجى إدخال اسم للروشتة الدورية'; return; }
    if (!this.form.startDate) { this.error = 'يرجى اختيار تاريخ البداية'; return; }
    this.error = null;
    this.saving = true;

    if (this.selectedFile && !this.editId) {
      this.isUploading = true;
      this.uploadProgress = 0;
      this.prescriptionSvc.uploadPrescription(this.selectedFile).pipe(takeUntil(this.destroy$)).subscribe({
        next: (event: any) => {
          if (event.type === HttpEventType.UploadProgress) {
            this.uploadProgress = Math.round((100 * event.loaded) / (event.total || 1));
          } else if (event.type === HttpEventType.Response) {
            const prescriptionId = event.body?.id;
            this.isUploading = false;
            this.submitRecurring(prescriptionId);
          }
        },
        error: () => {
          this.isUploading = false;
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
