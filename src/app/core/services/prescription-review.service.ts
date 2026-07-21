import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { PrescriptionReviewDto } from '@core/interfaces/prescription-review.interface';

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
  private readonly localUrl = environment.localUrl;

  uploadPrescription(file: File): Observable<HttpEvent<PrescriptionReviewUploadResponse>> {
    const formData = new FormData();
    formData.append('Image', file);

    const req = new HttpRequest('POST', `${this.localUrl}/PrescriptionReviews`, formData, {
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request<PrescriptionReviewUploadResponse>(req);
  }

  getReview(id: string): Observable<PrescriptionReviewDto> {
    return this.http.get<PrescriptionReviewDto>(`${this.localUrl}/PrescriptionReviews/${id}`);
  }

  searchMedicines(term: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.localUrl}/PrescriptionReviews/search`, {
      params: { term: term }
    });
  }

  updateReview(id: string, data: any): Observable<any> {
    return this.http.put(`${this.localUrl}/PrescriptionReviews/${id}`, data);
  }

  approve(id: string, notes: string): Observable<any> {

    return this.http.put(`${this.localUrl}/PrescriptionReviews/${id}/approve`, { notes });
  }

  reject(id: string, notes: string): Observable<any> {
    return this.http.put(`${this.localUrl}/PrescriptionReviews/${id}/reject`, { notes });
  }
}
