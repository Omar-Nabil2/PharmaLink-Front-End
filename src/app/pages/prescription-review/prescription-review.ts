import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TagModule } from 'primeng/tag';

import { PrescriptionReviewService } from '../../core/services/prescription-review.service';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { PrescriptionReviewDetail, PrescriptionReviewStatus } from '../../core/interfaces/prescription-review.interface';

@Component({
  selector: 'app-prescription-review',
  standalone: true,
  imports: [CommonModule, TagModule],
  templateUrl: './prescription-review.html',
})
export class PrescriptionReviewComponent implements OnInit {
  review: PrescriptionReviewDetail | null = null;

  isLoading = true;
  loadFailed = false;

  constructor(
    private readonly prescriptionReviewService: PrescriptionReviewService,
    private readonly errorHandlerService: ErrorHandlerService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    const reviewId = this.route.snapshot.paramMap.get('id');

    if (!reviewId) {
      this.router.navigate(['/patient/dashboard']);
      return;
    }

    this.loadReview(reviewId);
  }

  loadReview(reviewId: string): void {
    this.isLoading = true;
    this.loadFailed = false;

    this.prescriptionReviewService.getById(reviewId).subscribe({
      next: (review) => {
        this.review = review;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.loadFailed = true;
        this.errorHandlerService.handleError(err, 'Failed to Load Prescription');
      },
    });
  }

  statusLabel(status: PrescriptionReviewStatus): string {
    switch (status) {
      case 'PendingReview': return 'Pending';
      case 'Approved': return 'Approved';
      case 'Rejected': return 'Rejected';
      case 'OrderCreated': return 'Approved · Order Created';
      default: return status;
    }
  }

  statusSeverity(status: PrescriptionReviewStatus): 'success' | 'warn' | 'danger' | 'info' {
    switch (status) {
      case 'Approved':
      case 'OrderCreated':
        return 'success';
      case 'Rejected':
        return 'danger';
      case 'PendingReview':
      default:
        return 'warn';
    }
  }
}