import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import {
  AssignmentHistoryItemDTO,
  CreatePharmacistRequest,
  PaginatedList,
  PharmacistFilterParams,
  PharmacistResponseDTO,
  PharmacistSummaryDTO,
  UpdatePharmacistRequest,
  UpdatePharmacistStatusRequest,
} from '@core/models/pharmacist-management.model';

@Injectable({ providedIn: 'root' })
export class PharmacistManagementService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.localUrl}/Pharmacists`;

  getAllPharmacists(params: PharmacistFilterParams): Observable<PaginatedList<PharmacistSummaryDTO>> {
    let httpParams = new HttpParams()
      .set('pageNumber', params.pageNumber.toString())
      .set('pageSize', params.pageSize.toString());

    if (params.search && params.search.trim()) {
      httpParams = httpParams.set('search', params.search.trim());
    }
    if (params.branchId) {
      httpParams = httpParams.set('branchId', params.branchId);
    }
    if (params.userStatus !== undefined && params.userStatus !== null) {
      httpParams = httpParams.set('userStatus', params.userStatus.toString());
    }

    return this.http.get<PaginatedList<PharmacistSummaryDTO>>(this.baseUrl, { params: httpParams });
  }

  getPharmacistById(id: string): Observable<PharmacistResponseDTO> {
    return this.http.get<PharmacistResponseDTO>(`${this.baseUrl}/${id}`);
  }

  createPharmacist(dto: CreatePharmacistRequest): Observable<PharmacistResponseDTO> {
    return this.http.post<PharmacistResponseDTO>(this.baseUrl, dto);
  }

  updatePharmacist(id: string, dto: UpdatePharmacistRequest): Observable<PharmacistResponseDTO> {
    return this.http.put<PharmacistResponseDTO>(`${this.baseUrl}/${id}`, dto);
  }

  updatePharmacistStatus(id: string, status: number): Observable<PharmacistResponseDTO> {
    const payload: UpdatePharmacistStatusRequest = { status };
    return this.http.patch<PharmacistResponseDTO>(`${this.baseUrl}/${id}/status`, payload);
  }

  deletePharmacist(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getPharmacistHistory(id: string): Observable<AssignmentHistoryItemDTO[]> {
    return this.http.get<AssignmentHistoryItemDTO[]>(`${this.baseUrl}/${id}/history`);
  }

  assignBranch(id: string, branchId: string): Observable<PharmacistResponseDTO> {
    return this.http.put<PharmacistResponseDTO>(`${this.baseUrl}/${id}/assign-branch`, { branchId });
  }
}
