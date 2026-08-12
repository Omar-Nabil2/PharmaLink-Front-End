import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ReviewTeamProfileService, UpdateReviewTeamProfileDto, ReviewTeamProfile } from '@core/services/review-team-profile.service';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-review-team-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ReviewTeamProfileComponent implements OnInit {
  private readonly profileService = inject(ReviewTeamProfileService);
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);

  profile = signal<ReviewTeamProfile | null>(null);
  isLoading = signal<boolean>(false);
  isUpdating = signal<boolean>(false);

  // Form Data
  fullName = '';
  phoneNumber = '';

  // Picture Data
  isUploadingPicture = signal<boolean>(false);
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading.set(true);
    this.profileService.getProfile().subscribe({
      next: (data) => {
        this.profile.set(data);
        this.fullName = data.fullName;
        this.phoneNumber = data.phoneNumber || '';
        this.imagePreview = data.profilePictureUrl || 'assets/images/default-avatar.png';
        this.isLoading.set(false);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل تحميل الملف الشخصي' });
        this.isLoading.set(false);
      }
    });
  }

  updateProfile(): void {
    if (!this.fullName.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'الاسم كامل مطلوب' });
      return;
    }

    this.isUpdating.set(true);
    const dto: UpdateReviewTeamProfileDto = {
      fullName: this.fullName,
      phoneNumber: this.phoneNumber
    };

    this.profileService.updateProfile(dto).subscribe({
      next: (data) => {
        this.profile.set(data);
        this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم تحديث البيانات بنجاح' });
        this.isUpdating.set(false);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل تحديث البيانات' });
        this.isUpdating.set(false);
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  uploadPicture(): void {
    if (!this.selectedFile) {
      return;
    }

    this.isUploadingPicture.set(true);
    this.profileService.uploadProfilePicture(this.selectedFile).subscribe({
      next: (res) => {
        this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم تحديث الصورة الشخصية بنجاح' });
        this.imagePreview = res.profilePictureUrl;
        this.selectedFile = null;
        this.isUploadingPicture.set(false);
        this.loadProfile();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل رفع الصورة' });
        this.isUploadingPicture.set(false);
      }
    });
  }
}
