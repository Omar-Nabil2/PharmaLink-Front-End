import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { PrescriptionReviewDetail } from '../interfaces/prescription-review.interface';

@Injectable({
  providedIn: 'root',
})
export class PrescriptionReviewService {
  private readonly baseUrl = ` 'https://localhost:5001/api/v1/PrescriptionReviews?PageNumber=1&PageSize=10'`;

  constructor(private readonly http: HttpClient) {}

  getById(reviewId: string): Observable<PrescriptionReviewDetail> {
    return this.http.get<PrescriptionReviewDetail>(`${this.baseUrl}/PrescriptionReviews/${reviewId}`);
  }
}