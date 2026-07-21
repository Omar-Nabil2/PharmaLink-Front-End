import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpParams, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { BranchOrderRowDto, GetAllPrescriptionReviewDto, PaginatedResponse, PrescriptionReviewDto, PrescriptionReviewQueryDto, Result } from '@core/interfaces/prescription-review.interface';

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

  getAllPrescriptionReview(query: PrescriptionReviewQueryDto): Observable<PaginatedResponse<GetAllPrescriptionReviewDto>> {
    let params = new HttpParams();

    if (query.status) {
      params = params.set('Status', query.status);
    }

    if (query.searchTerm) {
      params = params.set('SearchTerm', query.searchTerm);
    }

    if (query.pageNumber != null) {
      params = params.set('PageNumber', query.pageNumber.toString());
    }

    if (query.pageSize != null) {
      params = params.set('PageSize', query.pageSize.toString());
    }

    return this.http.get<PaginatedResponse<GetAllPrescriptionReviewDto>>(
      `${this.localUrl}/PrescriptionReviews`,
      { params }
    );
  }

  getAssignedOrders(pageNumber: number = 1, pageSize: number = 10, status?: string): Observable<Result<BranchOrderRowDto>> {
    let params = new HttpParams()
      .set('PageNumber', pageNumber.toString())
      .set('PageSize', pageSize.toString());

    if (status) {
      params = params.set('Status', status);
    }

    return this.http.get<Result<BranchOrderRowDto>>(
      `${this.localUrl}/OrderFulfillmentLegs/assigned`,
      { params }
    );
  }
}
