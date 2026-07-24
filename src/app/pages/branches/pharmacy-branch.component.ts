import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { PaginatorModule } from 'primeng/paginator';
import { DialogModule } from 'primeng/dialog';
import { PharmacyBranchService } from './pharmacy-branch.service';
import { PharmacyBranchResponseDTO, GetPharmacyBranchResponseDTO } from './pharmacy-branch.model';

@Component({
  selector: 'app-pharmacy-branch',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ToastModule, PaginatorModule, DialogModule],
  providers: [MessageService],
  templateUrl: './pharmacy-branch.component.html',
  styleUrl: './pharmacy-branch.component.scss'
})
export class PharmacyBranchComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly branchService = inject(PharmacyBranchService);
  private readonly messageService = inject(MessageService);

  // Data Signals
  branches = signal<GetPharmacyBranchResponseDTO[]>([]);
  totalCount = signal(0);
  
  // State Signals
  isLoading = signal(true);
  isSaving = signal(false);
  isDeleting = signal(false);
  
  // Modal States
  isModalOpen = signal(false);
  isDeleteModalOpen = signal(false);
  isViewModalOpen = signal(false);
  selectedBranchDetails = signal<PharmacyBranchResponseDTO | null>(null);
  isViewLoading = signal(false);
  modalMode = signal<'add' | 'edit'>('add');
  selectedBranchId = signal<string | null>(null);

  // Location picker
  private readonly sanitizer = inject(DomSanitizer);
  isDetectingLocation = signal(false);
  mapPreviewUrl = signal<SafeResourceUrl | null>(null);

  get mapCoords(): { lat: number; lng: number } | null {
    const lat = this.branchForm?.get('latitude')?.value;
    const lng = this.branchForm?.get('longitude')?.value;
    if (lat != null && lng != null && !isNaN(lat) && !isNaN(lng)) return { lat, lng };
    return null;
  }

  updateMapPreview(): void {
    const coords = this.mapCoords;
    if (!coords) { this.mapPreviewUrl.set(null); return; }
    const url = `https://www.openstreetmap.org/export/embed.html?bbox=${coords.lng - 0.01},${coords.lat - 0.01},${coords.lng + 0.01},${coords.lat + 0.01}&layer=mapnik&marker=${coords.lat},${coords.lng}`;
    this.mapPreviewUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
  }

  detectMyLocation(): void {
    if (!navigator.geolocation) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'المتصفح لا يدعم تحديد الموقع' });
      return;
    }
    this.isDetectingLocation.set(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        this.branchForm.patchValue({ latitude: lat, longitude: lng });
        this.branchForm.get('latitude')!.markAsTouched();
        this.branchForm.get('longitude')!.markAsTouched();
        this.updateMapPreview();
        this.isDetectingLocation.set(false);
      },
      () => {
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحديد الموقع. تأكد من منح الإذن.' });
        this.isDetectingLocation.set(false);
      },
      { timeout: 10000 }
    );
  }

  onCoordInput(): void {
    this.updateMapPreview();
  }

  // Pagination & Search
  pageNumber = signal(1);
  pageSize = signal(10);
  searchTerm = signal('');
  first = computed(() => (this.pageNumber() - 1) * this.pageSize());
  private searchSubject = new Subject<string>();

  branchForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.loadBranches();

    // Setup Search Debouncing
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm.set(term);
      this.pageNumber.set(1);
      this.loadBranches();
    });
  }

  private initForm(): void {
    this.branchForm = this.fb.group({
      branchName: ['', [Validators.required, Validators.maxLength(150)]],
      governorate: ['', [Validators.required, Validators.maxLength(100)]],
      city: ['', [Validators.required, Validators.maxLength(100)]],
      addressLine: ['', [Validators.required, Validators.maxLength(250)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^(?:\+20|0020|0)?1[0125][0-9]{8}$/)]],
      workingHours: ['', [Validators.required, Validators.maxLength(150)]],
      serviceRadiusKm: [5, [Validators.required, Validators.min(0)]],
      latitude: [null, [Validators.required, Validators.min(-90), Validators.max(90)]],
      longitude: [null, [Validators.required, Validators.min(-180), Validators.max(180)]],
      supportsDelivery: [false],
      supportsPickup: [true]
    });
  }

  loadBranches(): void {
    this.isLoading.set(true);
    this.branchService.getBranches({
      search: this.searchTerm() || null,
      pageNumber: this.pageNumber(),
      pageSize: this.pageSize()
    }).subscribe({
      next: (res) => {
        this.branches.set(res.items);
        this.totalCount.set(res.totalCount);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading branches', err);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'حدث خطأ أثناء تحميل الفروع' });
        this.isLoading.set(false);
      }
    });
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchSubject.next(target.value);
  }

  openAddModal(): void {
    this.modalMode.set('add');
    this.selectedBranchId.set(null);
    this.branchForm.reset({
      supportsDelivery: false,
      supportsPickup: true,
      serviceRadiusKm: 5
    });
    this.mapPreviewUrl.set(null);
    this.isModalOpen.set(true);
  }

  // Track which branch is currently being fetched for editing
  editingBranchId = signal<string | null>(null);

  openEditModal(branch: GetPharmacyBranchResponseDTO): void {
    this.editingBranchId.set(branch.branchId);

    // Fetch fresh details from backend before opening modal
    this.branchService.getBranchById(branch.branchId).subscribe({
      next: (freshBranch) => {
        this.modalMode.set('edit');
        this.selectedBranchId.set(freshBranch.branchId);
        this.branchForm.patchValue({
          branchName: freshBranch.branchName,
          governorate: freshBranch.governorate,
          city: freshBranch.city,
          addressLine: freshBranch.addressLine,
          phoneNumber: freshBranch.phoneNumber,
          workingHours: freshBranch.workingHours,
          serviceRadiusKm: freshBranch.serviceRadiusKm,
          latitude: freshBranch.latitude,
          longitude: freshBranch.longitude,
          supportsDelivery: freshBranch.supportsDelivery,
          supportsPickup: freshBranch.supportsPickup
        });
        this.updateMapPreview();
        this.editingBranchId.set(null);
        this.isModalOpen.set(true);
      },
      error: (err) => {
        console.error('Error fetching branch details', err);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل جلب بيانات الفرع' });
        this.editingBranchId.set(null);
      }
    });
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  confirmDelete(branch: GetPharmacyBranchResponseDTO): void {
    this.selectedBranchId.set(branch.branchId);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
    this.selectedBranchId.set(null);
  }

  openViewModal(branch: GetPharmacyBranchResponseDTO): void {
    this.isViewModalOpen.set(true);
    this.isViewLoading.set(true);
    this.selectedBranchDetails.set(null);
    
    this.branchService.getBranchById(branch.branchId).subscribe({
      next: (res) => {
        this.selectedBranchDetails.set(res);
        this.isViewLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching branch details', err);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل جلب تفاصيل الفرع' });
        this.isViewLoading.set(false);
        this.isViewModalOpen.set(false);
      }
    });
  }

  closeViewModal(): void {
    this.isViewModalOpen.set(false);
    this.selectedBranchDetails.set(null);
  }

  onSubmit(): void {
    if (this.branchForm.invalid) {
      this.branchForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const formValue = this.branchForm.value;
    const mode = this.modalMode();
    const id = this.selectedBranchId();

    if (mode === 'add') {
      this.branchService.createBranch(formValue).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم إضافة الفرع بنجاح' });
          this.isSaving.set(false);
          this.closeModal();
          this.loadBranches();
        },
        error: (err) => {
          console.error('Error creating branch', err);
          this.handleServerErrors(err);
          this.isSaving.set(false);
        }
      });
    } else if (mode === 'edit' && id) {
      this.branchService.updateBranch(id, formValue).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم تحديث الفرع بنجاح' });
          this.isSaving.set(false);
          this.closeModal();
          this.loadBranches();
        },
        error: (err) => {
          console.error('Error updating branch', err);
          this.handleServerErrors(err);
          this.isSaving.set(false);
        }
      });
    }
  }

  private handleServerErrors(err: any): void {
    if (err.status === 400 && err.error && err.error.errors) {
      const serverErrors = err.error.errors;
      const errorMap: Record<string, string> = {
        branchName: 'اسم الفرع مطلوب ولا يجب أن يتجاوز 150 حرفاً.',
        city: 'اسم المدينة مطلوب ولا يجب أن يتجاوز 100 حرف.',
        governorate: 'اسم المحافظة مطلوب ولا يجب أن يتجاوز 100 حرف.',
        addressLine: 'العنوان التفصيلي مطلوب ولا يجب أن يتجاوز 250 حرفاً.',
        phoneNumber: 'يرجى إدخال رقم هاتف مصري صحيح (مثال: 01012345678).',
        workingHours: 'مواعيد العمل مطلوبة ولا يجب أن تتجاوز 150 حرفاً.',
        serviceRadiusKm: 'نطاق الخدمة يجب أن يكون رقماً أكبر من أو يساوي الصفر.',
        latitude: 'في حال إدخال خطوط الطول أو العرض، يجب إدخال كلاهما ضمن النطاق الجغرافي الصحيح.',
        longitude: 'في حال إدخال خطوط الطول أو العرض، يجب إدخال كلاهما ضمن النطاق الجغرافي الصحيح.'
      };

      for (const key of Object.keys(serverErrors)) {
        // Backend keys might be PascalCase (e.g., BranchName)
        const controlKey = key.charAt(0).toLowerCase() + key.slice(1);
        const control = this.branchForm.get(controlKey);
        
        if (control) {
          const arabicMessage = errorMap[controlKey] || serverErrors[key][0];
          control.setErrors({ serverError: arabicMessage });
        } else {
          // If it's a cross-field validation or general error
          this.messageService.add({ severity: 'error', summary: 'خطأ', detail: serverErrors[key][0] });
        }
      }
    } else {
      this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'حدث خطأ أثناء حفظ الفرع' });
    }
  }

  getErrorMessage(controlName: string): string | null {
    const control = this.branchForm.get(controlName);
    if (!control || !(control.touched || control.dirty) || !control.errors) return null;

    if (control.errors['serverError']) {
      return control.errors['serverError'];
    }

    const errorMap: Record<string, string> = {
      branchName: 'اسم الفرع مطلوب ولا يجب أن يتجاوز 150 حرفاً.',
      city: 'اسم المدينة مطلوب ولا يجب أن يتجاوز 100 حرف.',
      governorate: 'اسم المحافظة مطلوب ولا يجب أن يتجاوز 100 حرف.',
      addressLine: 'العنوان التفصيلي مطلوب ولا يجب أن يتجاوز 250 حرفاً.',
      phoneNumber: 'يرجى إدخال رقم هاتف مصري صحيح (مثال: 01012345678).',
      workingHours: 'مواعيد العمل مطلوبة ولا يجب أن تتجاوز 150 حرفاً.',
      serviceRadiusKm: 'نطاق الخدمة يجب أن يكون رقماً أكبر من أو يساوي الصفر.',
      latitude: 'في حال إدخال خطوط الطول أو العرض، يجب إدخال كلاهما ضمن النطاق الجغرافي الصحيح.',
      longitude: 'في حال إدخال خطوط الطول أو العرض، يجب إدخال كلاهما ضمن النطاق الجغرافي الصحيح.'
    };

    return errorMap[controlName] || 'قيمة غير صالحة';
  }

  hasError(controlName: string): boolean {
    const control = this.branchForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  executeDelete(): void {
    const id = this.selectedBranchId();
    if (!id) return;

    this.isDeleting.set(true);
    this.branchService.deleteBranch(id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم حذف الفرع بنجاح' });
        this.isDeleting.set(false);
        this.closeDeleteModal();
        this.loadBranches();
      },
      error: (err) => {
        console.error('Error deleting branch', err);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'حدث خطأ أثناء حذف الفرع' });
        this.isDeleting.set(false);
        this.closeDeleteModal();
      }
    });
  }

  onPageChange(event: any): void {
    this.pageNumber.set(event.page + 1);
    this.pageSize.set(event.rows);
    this.loadBranches();
  }
}
