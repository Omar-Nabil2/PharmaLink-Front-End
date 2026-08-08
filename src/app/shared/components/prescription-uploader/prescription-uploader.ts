import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { PrescriptionService } from '../../../core/services/prescription.service';

@Component({
  selector: 'app-prescription-uploader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './prescription-uploader.html',
  styleUrls: ['./prescription-uploader.scss']
})
export class PrescriptionUploaderComponent {
  @Output() uploadSuccess = new EventEmitter<string>();
  
  selectedFile: File | null = null;
  selectedFileUrl: string | null = null;
  uploadProgress = 0;
  isUploading = false;
  uploadError: string | null = null;

  private readonly allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf'];
  private readonly maxSize = 5 * 1024 * 1024; // 5 MB

  constructor(
    private prescriptionService: PrescriptionService,
    private messageService: MessageService
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validate size
      if (file.size > this.maxSize) {
        this.uploadError = 'حجم الملف يجب أن لا يتجاوز 5 ميجابايت';
        this.selectedFile = null;
        return;
      }

      // Validate extension
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!extension || !this.allowedExtensions.includes(extension)) {
        this.uploadError = 'نوع الملف غير مدعوم. يرجى رفع ملف بصيغة JPG, PNG, أو PDF';
        this.selectedFile = null;
        return;
      }

      this.uploadError = null;
      this.selectedFile = file;

      // Preview image
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => this.selectedFileUrl = e.target?.result as string;
        reader.readAsDataURL(file);
      } else {
        this.selectedFileUrl = null; // Can't preview PDF directly here easily
      }
    }
  }

  uploadFile(): void {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.uploadProgress = 0;
    this.uploadError = null;

    this.prescriptionService.uploadPrescription(this.selectedFile).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress = Math.round(100 * event.loaded / event.total);
        } else if (event.type === HttpEventType.Response) {
          this.isUploading = false;
          this.uploadProgress = 100;
          this.messageService.add({
            severity: 'success',
            summary: 'نجاح',
            detail: 'تم رفع الروشتة بنجاح.'
          });
          const id = event.body?.id;
          if (id) {
            this.uploadSuccess.emit(id);
          }
        }
      },
      error: (err) => {
        this.isUploading = false;
        this.uploadProgress = 0;
        this.uploadError = err.error?.message || 'فشل رفع الروشتة. يرجى المحاولة مرة أخرى.';
      }
    });
  }

  removeFile(): void {
    this.selectedFile = null;
    this.selectedFileUrl = null;
    this.uploadProgress = 0;
    this.uploadError = null;
    this.uploadSuccess.emit(''); // emit empty to indicate removal
  }
}
