import { EnumTranslatePipe } from '@core/pipes/enum-translate.pipe';
import { CommonModule } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AiScanService } from '@core/services/ai-scan.service';
import { CartService } from '@core/services/cart.service';
import { MedicineImageScanResponse } from '@core/interfaces/ai-scan.interface';
import { MessageService } from 'primeng/api';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-medicine-image-scan',
  standalone: true,
  imports: [EnumTranslatePipe, CommonModule, RouterModule, ToastModule, ProgressBarModule],
  providers: [MessageService],
  templateUrl: './medicine-image-scan.component.html'
})
export class MedicineImageScanComponent {
  private readonly aiScanService = inject(AiScanService);
  private readonly cartService = inject(CartService);
  private readonly messageService = inject(MessageService);

  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error' = 'idle';
  progress = 0;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  result: MedicineImageScanResponse | null = null;
  isAddingToCart = false;
  addedToCart = false;
  dragAreaClass = 'border-dashed border-2 border-primary/50 bg-primary/5';

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragAreaClass = 'border-dashed border-2 border-primary bg-primary/10';
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragAreaClass = 'border-dashed border-2 border-primary/50 bg-primary/5';
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragAreaClass = 'border-dashed border-2 border-primary/50 bg-primary/5';

    if (event.dataTransfer?.files.length) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.handleFile(input.files[0]);
    }
  }

  handleFile(file: File): void {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      this.messageService.add({ severity: 'error', summary: 'صيغة غير مدعومة', detail: 'ارفع صورة JPG أو PNG أو WEBP.' });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      this.messageService.add({ severity: 'error', summary: 'حجم كبير', detail: 'حجم الصورة لازم يكون أقل من 10MB.' });
      return;
    }

    this.selectedFile = file;
    this.previewUrl = URL.createObjectURL(file);
    this.scan();
  }

  scan(): void {
    if (!this.selectedFile) return;

    this.status = 'uploading';
    this.progress = 0;
    this.result = null;
    this.isAddingToCart = false;
    this.addedToCart = false;

    this.aiScanService.scanMedicineImage(this.selectedFile).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress) {
          this.progress = Math.round((100 * event.loaded) / (event.total || 1));
          if (this.progress === 100) {
            this.status = 'processing';
          }
        } else if (event.type === HttpEventType.Response) {
          this.result = event.body ?? null;
          this.status = 'success';
          this.messageService.add({ severity: 'success', summary: 'تم التحليل', detail: 'تم قراءة صورة الدوا ومطابقتها مع الكتالوج.' });
        }
      },
      error: (err) => {
        this.status = 'error';
        const detail = err?.error?.message || err?.error?.detail || 'تعذر تحليل صورة الدوا.';
        this.messageService.add({ severity: 'error', summary: 'فشل التحليل', detail });
      }
    });
  }

  reset(): void {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }

    this.status = 'idle';
    this.progress = 0;
    this.selectedFile = null;
    this.previewUrl = null;
    this.result = null;
    this.isAddingToCart = false;
    this.addedToCart = false;
  }

  addMatchedMedicineToCart(): void {
    const drugId = this.getCartDrugId();

    if (!drugId || !this.canAddCurrentResultToCart() || this.isAddingToCart) {
      return;
    }

    this.isAddingToCart = true;
    this.cartService.addItem(drugId, 1).subscribe({
      next: () => {
        this.isAddingToCart = false;
        this.addedToCart = true;
        this.messageService.add({ severity: 'success', summary: 'تمت الإضافة', detail: 'تم إضافة الدواء للسلة.' });
      },
      error: (err) => {
        this.isAddingToCart = false;
        const detail = err?.error?.detail || err?.error?.message || 'تعذر إضافة الدواء للسلة.';
        this.messageService.add({ severity: 'error', summary: 'لم تتم الإضافة', detail });
      }
    });
  }

  getCartDrugId(): string | null {
    if (!this.result) {
      return null;
    }

    if (this.result.cartDrugId) {
      return this.result.cartDrugId;
    }

    if ((this.result.matchStatus || '').toLowerCase() === 'alternativesuggested') {
      return this.result.suggestedAlternativeDrugId ?? null;
    }

    return this.result.matchedDrugId ?? null;
  }

  canAddCurrentResultToCart(): boolean {
    const status = (this.result?.matchStatus || '').toLowerCase();
    return !!this.getCartDrugId()
      && ['exactmatch', 'fuzzymatch', 'alternativesuggested'].includes(status);
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
        return status || 'مجهول';
    }
  }

  getStatusClass(status?: string): string {
    switch ((status || '').toLowerCase()) {
      case 'exactmatch':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'fuzzymatch':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'alternativesuggested':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'notfound':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  }
}
