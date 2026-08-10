import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PrescriptionReviewService } from '@core/services/prescription-review.service';
import { PrescriptionHistoryService } from '@core/services/prescription-history.service';
import { PrescriptionHistoryAnswer, PrescriptionHistoryMedicine, PrescriptionHistorySource } from '@core/interfaces/prescription-history.interface';

@Component({
  selector: 'app-prescription-history', standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DatePipe],
  templateUrl: './prescription-history.component.html', styleUrl: './prescription-history.component.scss',
})
export class PrescriptionHistoryComponent {
  private readonly historyService = inject(PrescriptionHistoryService);
  private readonly prescriptionService = inject(PrescriptionReviewService);
  readonly suggestions = ['أنا أخدت مسكن إيه قبل كده؟', 'هاتلي روشتة دكتور العظام.', 'اسم دكتور الجلدية اللي رحتله الصيف اللي فات إيه؟'];
  question = '';
  result = signal<PrescriptionHistoryAnswer | null>(null);
  loading = signal(false); error = signal(''); notice = signal(''); addingReviewId = signal<string | null>(null);
  private readonly selectedMedicineIds = signal<Record<string, string[]>>({});

  ask(): void {
    const question = this.question.trim();
    if (!question || this.loading()) return;
    this.loading.set(true); this.error.set(''); this.notice.set(''); this.result.set(null); this.selectedMedicineIds.set({});
    this.historyService.ask(question).subscribe({
      next: result => { this.result.set(result); this.loading.set(false); },
      error: error => { this.error.set(error?.error?.message || 'تعذر البحث في أرشيف الروشتات الآن. حاول مرة أخرى.'); this.loading.set(false); },
    });
  }
  useSuggestion(question: string): void { this.question = question; this.ask(); }
  onQuestionKeydown(event: KeyboardEvent): void { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); this.ask(); } }
  toggleMedicine(source: PrescriptionHistorySource, medicine: PrescriptionHistoryMedicine): void {
    if (!medicine.canBeAddedToCart) return;
    const selected = new Set(this.selectedMedicineIds()[source.prescriptionId] || []);
    selected.has(medicine.prescriptionReviewMedicineId) ? selected.delete(medicine.prescriptionReviewMedicineId) : selected.add(medicine.prescriptionReviewMedicineId);
    this.selectedMedicineIds.set({ ...this.selectedMedicineIds(), [source.prescriptionId]: [...selected] });
  }
  isSelected(source: PrescriptionHistorySource, medicine: PrescriptionHistoryMedicine): boolean { return (this.selectedMedicineIds()[source.prescriptionId] || []).includes(medicine.prescriptionReviewMedicineId); }
  selectedCount(source: PrescriptionHistorySource): number { return (this.selectedMedicineIds()[source.prescriptionId] || []).length; }
  addSelectedToCart(source: PrescriptionHistorySource): void {
    const selectedIds = this.selectedMedicineIds()[source.prescriptionId] || [];
    if (!selectedIds.length || this.addingReviewId()) return;
    this.addingReviewId.set(source.prescriptionId); this.notice.set('');
    this.prescriptionService.addSelectedMedicinesToCart(source.prescriptionId, selectedIds).subscribe({
      next: () => { this.notice.set('تمت إضافة الأدوية المختارة إلى السلة.'); this.selectedMedicineIds.set({ ...this.selectedMedicineIds(), [source.prescriptionId]: [] }); this.addingReviewId.set(null); },
      error: error => { this.error.set(error?.error?.detail || error?.error?.message || 'تعذر إضافة الأدوية إلى السلة.'); this.addingReviewId.set(null); },
    });
  }
  trackByPrescription = (_: number, item: PrescriptionHistorySource) => item.prescriptionId;
  trackByMedicine = (_: number, item: PrescriptionHistoryMedicine) => item.prescriptionReviewMedicineId;
}
