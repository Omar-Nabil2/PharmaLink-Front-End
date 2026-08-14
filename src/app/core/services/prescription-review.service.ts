import { environment } from '@environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpParams, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ApiResponse,
  BranchOrderRowDto,
  FulfillmentTask,
  GetAllPrescriptionReviewDto,
  InventoryAlert,
  PaginatedResponse,
  PharmacistDailyMetrics,
  PharmacistOrderDetailsDto,
  PrescriptionReviewDto,
  PrescriptionReviewQueryDto,
  PrescriptionReviewUploadResponse,
  Result
} from '@core/interfaces/prescription-review.interface';

@Injectable({
  providedIn: 'root'
})
export class PrescriptionReviewService {
  private http = inject(HttpClient);

  private readonly baseUrl = environment.baseUrl;
  private readonly url = `${this.baseUrl}`;


  uploadPrescription(file: File): Observable<HttpEvent<PrescriptionReviewUploadResponse>> {


    const formData = new FormData();
    formData.append('Image', file);

    const req = new HttpRequest('POST', `${this.url}/PrescriptionReviews`, formData, {
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request<PrescriptionReviewUploadResponse>(req);
  }

  addSelectedMedicinesToCart(reviewId: string, prescriptionReviewMedicineIds: string[]): Observable<any> {
    return this.http.post(
      `${this.url}/PrescriptionReviews/${reviewId}/add-selected-medicines-to-cart`,
      { prescriptionReviewMedicineIds }
    );
  }

  getReview(id: string): Observable<PrescriptionReviewDto> {
    return this.http.get<PrescriptionReviewDto>(`${this.url}/PrescriptionReviews/${id}`);
  }

  searchMedicines(term: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/drugs/search`, {
      params: { term: term }
    });
  }

  updateReview(id: string, data: any): Observable<any> {
    return this.http.put(`${this.url}/PrescriptionReviews/${id}`, data);
  }

  approve(id: string, notes: string): Observable<any> {
    return this.http.put(`${this.url}/PrescriptionReviews/${id}/approve`, { notes });
  }

  reject(id: string, notes: string): Observable<any> {
    return this.http.put(`${this.url}/PrescriptionReviews/${id}/reject`, { notes });
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
      `${this.url}/PrescriptionReviews/GetAllPrescriptionsforPatient`,
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
      `${this.url}/OrderFulfillmentLegs/assigned`,
      { params }
    );
  }

  getMetrics(): Observable<ApiResponse<PharmacistDailyMetrics>> {
    return this.http.get<ApiResponse<PharmacistDailyMetrics>>(`${this.url}/pharmacist/PharmacistDashboard/metrics`);
  }

  getInventoryAlerts(): Observable<ApiResponse<InventoryAlert[]>> {
    return this.http.get<ApiResponse<InventoryAlert[]>>(`${this.url}/pharmacist/PharmacistDashboard/inventory-alerts?stockThreshold=10&expiryThreshold=90`);
  }

  getPendingTasks(): Observable<ApiResponse<FulfillmentTask[]>> {
    return this.http.get<ApiResponse<FulfillmentTask[]>>(`${this.url}/pharmacist/PharmacistDashboard/pending-tasks?limit=5`);
  }

  getPharmacistOrderDetails(id: string): Observable<PharmacistOrderDetailsDto> {
    return this.http.get<PharmacistOrderDetailsDto>(`${this.url}/PharmacistOrders/${id}`);
  }
}
