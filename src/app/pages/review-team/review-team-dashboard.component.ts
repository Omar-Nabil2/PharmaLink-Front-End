import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MedicalInquiryService } from '@core/services/medical-inquiry.service';
import { PrescriptionReviewService } from '@core/services/prescription-review.service';

@Component({
  selector: 'app-review-team-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './review-team-dashboard.component.html',
  styleUrl: './review-team-dashboard.component.scss',
})
export class ReviewTeamDashboardComponent implements OnInit {
  private readonly prescriptionReviewService = inject(PrescriptionReviewService);
  private readonly medicalInquiryService = inject(MedicalInquiryService);

  readonly pendingReviews = signal(0);
  readonly pendingInquiries = signal(0);
  readonly isLoading = signal(true);

  ngOnInit(): void {
    forkJoin({
      reviews: this.prescriptionReviewService.getAllPrescriptionReview({
        pageNumber: 1,
        pageSize: 1,
        status: 'PendingReview',
      }),
      inquiries: this.medicalInquiryService.getForReviewTeam(),
    }).subscribe({
      next: ({ reviews, inquiries }) => {
        this.pendingReviews.set(reviews.totalPages ?? reviews.items?.length ?? 0);
        this.pendingInquiries.set(inquiries.filter((i) => i.status === 'Pending').length);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }
}
