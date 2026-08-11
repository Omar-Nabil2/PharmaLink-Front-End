import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PatientAddressesService } from '../../../../core/services/patient-addresses.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-address-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './address-form.component.html'
})
export class AddressFormComponent implements OnInit {
  addressForm: FormGroup;
  isEditMode = false;
  addressId: string | null = null;
  isLoading = false;
  isSubmitting = false;
  isFirstAddress = false;
  
  // Egyptian Governorates list (for example)
  governorates = [
    'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'البحر الأحمر', 
    'البحيرة', 'الفيوم', 'الغربية', 'الإسماعيلية', 'المنوفية', 
    'المنيا', 'القليوبية', 'الوادي الجديد', 'السويس', 'أسوان', 
    'أسيوط', 'بني سويف', 'بورسعيد', 'دمياط', 'الشرقية', 
    'جنوب سيناء', 'كفر الشيخ', 'مطروح', 'الأقصر', 'قنا', 'شمال سيناء', 'سوهاج'
  ];

  constructor(
    private fb: FormBuilder,
    private addressesService: PatientAddressesService,
    private errorHandler: ErrorHandlerService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.addressForm = this.fb.group({
      addressLine: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', Validators.required],
      governorate: ['', Validators.required],
      label: [null],
      buildingNumber: [null],
      floorNumber: [null],
      apartmentNumber: [null],
      additionalInstructions: [null],
      isDefault: [false],
      latitude: [0],
      longitude: [0]
    });
  }

  ngOnInit(): void {
    this.addressId = this.route.snapshot.paramMap.get('id');
    if (this.addressId) {
      this.isEditMode = true;
      this.loadAddressData(this.addressId);
    } else {
      this.addressesService.getMyAddresses().subscribe({
        next: (addresses) => {
          if (!addresses || addresses.length === 0) {
            this.isFirstAddress = true;
            this.addressForm.patchValue({ isDefault: true });
          }
        }
      });
    }
  }

  loadAddressData(id: string): void {
    this.isLoading = true;
    this.addressesService.getAddressById(id).subscribe({
      next: (address) => {
        console.log('Data received for edit:', address);
        this.addressForm.patchValue({

          addressLine: address.addressLine,
          city: address.city,
          governorate: address.governorate,
          label: address.label,
          buildingNumber: address.buildingNumber,
          floorNumber: address.floorNumber,
          apartmentNumber: address.apartmentNumber,
          additionalInstructions: address.additionalInstructions,
          isDefault: address.isDefault,
          latitude: address.latitude,
          longitude: address.longitude
        });
        console.log('Form after patch:', this.addressForm.value);
        this.isLoading = false;
        this.cdr.detectChanges(); // FORCE CHANGE DETECTION
      },
      error: (err) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.errorHandler.handleError(err, 'فشل تحميل بيانات العنوان');
        this.router.navigate(['/patient/addresses']);
      }
    });
  }

  onSubmit(): void {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formData = this.addressForm.value;

    if (this.isEditMode && this.addressId) {
      this.addressesService.updateAddress(this.addressId, formData).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.router.navigate(['/patient/addresses']);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorHandler.handleError(err, 'فشل تحديث العنوان');
        }
      });
    } else {
      this.addressesService.createAddress(formData).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.router.navigate(['/patient/addresses']);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorHandler.handleError(err, 'فشل إضافة العنوان');
        }
      });
    }
  }

  // Helpers for validation in template
  get f() { return this.addressForm.controls; }
  
  isFieldInvalid(field: string): boolean {
    const control = this.addressForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.errorHandler.handleError(new Error('Geolocation is not supported by your browser'), 'متصفحك لا يدعم تحديد الموقع');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.addressForm.patchValue({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        Swal.fire('نجاح', 'تم تحديد موقعك بنجاح!', 'success');
      },
      (error) => {
        let errorMsg = 'تعذر الحصول على الموقع';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = 'تم رفض إذن الوصول للموقع';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = 'معلومات الموقع غير متوفرة';
            break;
          case error.TIMEOUT:
            errorMsg = 'انتهى وقت طلب الموقع';
            break;
        }
        this.errorHandler.handleError(new Error(errorMsg), errorMsg);
      }
    );
  }

  setLabel(label: string): void {
    this.addressForm.patchValue({ label });
  }
}
