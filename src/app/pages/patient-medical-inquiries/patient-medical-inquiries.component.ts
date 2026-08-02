import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MedicalInquiry } from '@core/interfaces/medical-inquiry.interface';
import { MedicalInquiryService } from '@core/services/medical-inquiry.service';

@Component({
  selector: 'app-patient-medical-inquiries',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-medical-inquiries.component.html',
  styleUrl: './patient-medical-inquiries.component.scss',
})
export class PatientMedicalInquiriesComponent implements OnInit {
  private readonly service = inject(MedicalInquiryService);

  readonly inquiries = signal<MedicalInquiry[]>([]);
  readonly isLoading = signal(true);
  readonly isSubmitting = signal(false);
  question = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.service.getMine().subscribe({
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

  submit(): void {
    const question = this.question.trim();
    if (!question) return;

    this.isSubmitting.set(true);
    this.service.create({ question }).subscribe({
      next: (created) => {
        this.inquiries.update((items) => [created, ...items]);
        this.question = '';
        this.isSubmitting.set(false);
      },
      error: () => this.isSubmitting.set(false),
    });
  }

  statusLabel(status: string): string {
    if (status === 'Pending') return 'بانتظار الرد';
    if (status === 'Answered') return 'تم الرد';
    if (status === 'Closed') return 'مغلق';
    return status;
  }
}
