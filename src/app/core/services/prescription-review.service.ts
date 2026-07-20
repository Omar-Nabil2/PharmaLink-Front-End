import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface PrescriptionReviewUploadResponse {
  reviewId: string;
  status: string;
  imageUrl: string;
  medicines: any[];
}

@Injectable({
  providedIn: 'root'
})
export class PrescriptionReviewService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  uploadPrescription(file: File): Observable<HttpEvent<PrescriptionReviewUploadResponse>> {
    const formData = new FormData();
    formData.append('Image', file);

    const req = new HttpRequest('POST', `${this.baseUrl}/PrescriptionReviews`, formData, {
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request<PrescriptionReviewUploadResponse>(req);
  }
}
