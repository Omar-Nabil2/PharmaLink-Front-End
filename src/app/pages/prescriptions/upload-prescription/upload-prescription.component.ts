import { EnumTranslatePipe } from '@core/pipes/enum-translate.pipe';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { PrescriptionReviewService } from '../../../core/services/prescription-review.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
  selector: 'app-upload-prescription',
  standalone: true,
  imports: [EnumTranslatePipe, CommonModule, RouterModule, ToastModule, ProgressBarModule],
  providers: [MessageService],
  templateUrl: './upload-prescription.component.html'
})
export class UploadPrescriptionComponent {
  private prescriptionService = inject(PrescriptionReviewService);
  private messageService = inject(MessageService);

  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error' = 'idle';
  progress = 0;
  selectedFile: File | null = null;
  responseData: any = null;
  dragAreaClass = 'border-dashed border-2 border-primary/50 bg-primary/5';

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.dragAreaClass = 'border-dashed border-2 border-primary bg-primary/10';
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.dragAreaClass = 'border-dashed border-2 border-primary/50 bg-primary/5';
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.dragAreaClass = 'border-dashed border-2 border-primary/50 bg-primary/5';
    if (event.dataTransfer?.files.length) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  onFileSelected(event: any) {
    if (event.target.files.length) {
      this.handleFile(event.target.files[0]);
    }
  }

  handleFile(file: File) {
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid file type. Only JPG, PNG, and PDF are allowed.' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'File size exceeds 10MB limit.' });
      return;
    }
    this.selectedFile = file;
    this.upload();
  }

  upload() {
    if (!this.selectedFile) return;

    this.status = 'uploading';
    this.progress = 0;
    this.responseData = null;

    this.prescriptionService.uploadPrescription(this.selectedFile).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress) {
          this.progress = Math.round(100 * event.loaded / (event.total || 1));
          if (this.progress === 100) {
            this.status = 'processing';
          }
        } else if (event.type === HttpEventType.Response) {
          this.status = 'success';
          this.responseData = event.body;
          this.messageService.add({ severity: 'success', summary: 'تم التحليل', detail: 'تم استخراج الأدوية وإرسالها لمراجعة الصيدلي.' });
        }
      },
      error: (err) => {
        console.error('Upload failed', err);
        this.status = 'error';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to upload prescription. Please try again.' });
        console.log('تفاصيل أخطاء الـ Validation:', err.error?.errors); // 👈 اطبع هذا السطر
      }
    });
  }

  reset() {
    this.status = 'idle';
    this.progress = 0;
    this.selectedFile = null;
    this.responseData = null;
  }

  getStatusLabel(status?: string): string {
    switch ((status || '').toLowerCase()) {
      case 'exactmatch':
        return 'مطابقة مباشرة';
      case 'fuzzymatch':
        return 'مطابقة محتملة';
      case 'alternativesuggested':
        return 'بديل مقترح';
      case 'notfound':
        return 'غير موجود';
      default:
        return status || 'قيد المراجعة';
    }
  }

  getStatusClass(status?: string): string {
    switch ((status || '').toLowerCase()) {
      case 'exactmatch':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'fuzzymatch':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'alternativesuggested':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'notfound':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  }
}
