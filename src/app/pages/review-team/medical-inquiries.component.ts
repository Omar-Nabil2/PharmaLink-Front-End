import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MedicalInquiry } from '@core/interfaces/medical-inquiry.interface';
import { MedicalInquiryService } from '@core/services/medical-inquiry.service';

@Component({
  selector: 'app-medical-inquiries',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './medical-inquiries.component.html',
  styleUrl: './medical-inquiries.component.scss',
})
export class MedicalInquiriesComponent implements OnInit {
  private readonly service = inject(MedicalInquiryService);

  readonly inquiries = signal<MedicalInquiry[]>([]);
  readonly isLoading = signal(true);
  readonly savingId = signal<string | null>(null);
  readonly selectedStatus = signal('');
  readonly answers: Record<string, string> = {};

  readonly filterOptions = [
    { label: 'الكل', value: '' },
    { label: 'بانتظار الرد', value: 'Pending' },
    { label: 'تم الرد', value: 'Answered' },
    { label: 'مغلق', value: 'Closed' },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.service.getForReviewTeam(this.selectedStatus()).subscribe({
      next: (items) => {
        this.inquiries.set(items);
        this.isLoading.set(false);
      },
      error: () => {
        this.inquiries.set([]);
        this.isLoading.set(false);
      },
    });
  }

  setStatus(status: string): void {
    this.selectedStatus.set(status);
    this.load();
  }

  answer(inquiry: MedicalInquiry): void {
    const answer = this.answers[inquiry.medicalInquiryId]?.trim();
    if (!answer) return;

    this.savingId.set(inquiry.medicalInquiryId);
    this.service.answer(inquiry.medicalInquiryId, { answer }).subscribe({
      next: (updated) => {
        this.inquiries.update((items) =>
          items.map((item) => item.medicalInquiryId === updated.medicalInquiryId ? updated : item),
        );
        this.answers[inquiry.medicalInquiryId] = '';
        this.savingId.set(null);
      },
      error: () => this.savingId.set(null),
    });
  }

  close(inquiry: MedicalInquiry): void {
    this.savingId.set(inquiry.medicalInquiryId);
    this.service.close(inquiry.medicalInquiryId).subscribe({
      next: (updated) => {
        this.inquiries.update((items) =>
          items.map((item) => item.medicalInquiryId === updated.medicalInquiryId ? updated : item),
        );
        this.savingId.set(null);
      },
      error: () => this.savingId.set(null),
    });
  }

  statusLabel(status: string): string {
    if (status === 'Pending') return 'بانتظار الرد';
    if (status === 'Answered') return 'تم الرد';
    if (status === 'Closed') return 'مغلق';
    return status;
  }
}
