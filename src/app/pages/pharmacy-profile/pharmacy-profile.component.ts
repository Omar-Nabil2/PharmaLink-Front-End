import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { PharmacyProfileService } from './pharmacy-profile.service';
import { PharmacyProfileResponseDto } from './pharmacy-profile.model';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-pharmacy-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ToastModule],
  providers: [MessageService],
  templateUrl: './pharmacy-profile.component.html',
  styleUrl: './pharmacy-profile.component.scss' // Optional, can be empty or we might not create it
})
export class PharmacyProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly profileService = inject(PharmacyProfileService);
  private readonly messageService = inject(MessageService);

  profileForm!: FormGroup;
  
  isLoading = signal(true);
  isSaving = signal(false);
  
  // Baseline data for resetting the form
  originalProfileData = signal<PharmacyProfileResponseDto | null>(null);
  
  // Holds the original logo URL from the backend
  logoUrl = signal<string | null>(null);
  
  // Holds the local preview URL when a new file is selected
  localPreviewUrl = signal<string | null>(null);

  // Computed full logo URL, prioritizing local preview over backend URL
  fullLogoUrl = computed(() => {
    const local = this.localPreviewUrl();
    if (local) return local;

    const relativePath = this.logoUrl();
    if (!relativePath) return 'assets/images/default-pharmacy-logo.png';
    
    if (relativePath.startsWith('http')) return relativePath;

    // Prepend the backend server base API URL (pointing to wwwroot static files)
    const baseUrl = environment.localUrl.replace(/\/api.*$/, ''); // Strip /api/v1 suffix
    return `${baseUrl}/${relativePath.replace(/^\//, '')}`;
  });
  
  // Holds the actual file object selected by the user
  selectedFile = signal<File | null>(null);
  
  // Read-only license number field
  licenseNumber = signal<string>('');

  ngOnInit(): void {
    this.initForm();
    this.loadProfile();
  }

  private initForm(): void {
    this.profileForm = this.fb.group({
      pharmacyName: ['', [Validators.required, Validators.maxLength(100)]],
    });
  }

  private loadProfile(): void {
    this.isLoading.set(true);
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.originalProfileData.set(profile);
        this.profileForm.patchValue({
          pharmacyName: profile.pharmacyName,
        });
        this.logoUrl.set(profile.logoUrl);
        this.localPreviewUrl.set(null);
        this.licenseNumber.set(profile.licenseNumber);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading profile', err);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذر تحميل بيانات الصيدلية' });
        this.isLoading.set(false);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Basic image validation
      if (!file.type.startsWith('image/')) {
        this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'الرجاء اختيار ملف صورة صالح' });
        input.value = '';
        return;
      }

      // File size validation (Max 3MB)
      const maxSize = 3 * 1024 * 1024;
      if (file.size > maxSize) {
        this.messageService.add({ severity: 'error', summary: 'حجم كبير', detail: 'حجم الصورة يجب أن يكون أقل من 3 ميجابايت' });
        input.value = '';
        return;
      }
      
      this.selectedFile.set(file);

      // Create live preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.localPreviewUrl.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  fallbackImage = 'assets/images/default-pharmacy-logo.png';

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    
    // Prevent infinite loop: If current src is already the fallback, do nothing
    if (img.src.includes('default-pharmacy-logo.png')) {
      return;
    }

    // Temporarily remove error listener to guarantee it fires ONCE only
    img.onerror = null; 
    
    // Set fallback placeholder image
    img.src = this.fallbackImage;
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const pharmacyName = this.profileForm.get('pharmacyName')?.value;

    this.profileService.updateProfile({
      PharmacyName: pharmacyName,
      LogoFile: this.selectedFile()
    }).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم تحديث بيانات الصيدلية بنجاح' });
        this.isSaving.set(false);
        // Clear selected file and update baseline data after successful upload
        this.selectedFile.set(null);
        if (this.originalProfileData()) {
           this.originalProfileData.set({
              ...this.originalProfileData()!,
              pharmacyName: pharmacyName
           });
        }
      },
      error: (err) => {
        console.error('Error updating profile', err);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'حدث خطأ أثناء تحديث البيانات' });
        this.isSaving.set(false);
      }
    });
  }

  onDiscardChanges(): void {
    const original = this.originalProfileData();
    if (!original) return;

    // Reset Form
    this.profileForm.patchValue({
      pharmacyName: original.pharmacyName,
    });
    this.profileForm.markAsPristine();
    this.profileForm.markAsUntouched();

    // Reset File Previews
    this.logoUrl.set(original.logoUrl);
    this.localPreviewUrl.set(null);
    this.selectedFile.set(null);
  }
}
