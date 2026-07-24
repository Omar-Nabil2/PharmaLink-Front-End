import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import {
  PharmacyBranchResponseDTO,
  GetPharmacyBranchResponseDTO,
  CreatePharmacyBranchDTO,
  UpdatePharmacyBranchDTO,
  PharmacyBranchSearchDTO,
  GetPharmacyBranchParamRequest,
  PaginatedList
} from './pharmacy-branch.model';

@Injectable({
  providedIn: 'root'
})
export class PharmacyBranchService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.baseUrl}/pharmacies/branches`;

  getBranches(params: GetPharmacyBranchParamRequest): Observable<PaginatedList<GetPharmacyBranchResponseDTO>> {
    let httpParams = new HttpParams()
      .set('pageNumber', params.pageNumber.toString())
      .set('pageSize', params.pageSize.toString());

    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }

    return this.http.get<PaginatedList<GetPharmacyBranchResponseDTO>>(this.baseUrl, { params: httpParams });
  }

  getBranchById(id: string): Observable<PharmacyBranchResponseDTO> {
    return this.http.get<PharmacyBranchResponseDTO>(`${this.baseUrl}/${id}`);
  }

  createBranch(dto: CreatePharmacyBranchDTO): Observable<PharmacyBranchResponseDTO> {
    return this.http.post<PharmacyBranchResponseDTO>(this.baseUrl, dto);
  }

  updateBranch(id: string, dto: UpdatePharmacyBranchDTO): Observable<PharmacyBranchResponseDTO> {
    return this.http.put<PharmacyBranchResponseDTO>(`${this.baseUrl}/${id}`, dto);
  }

  deleteBranch(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  searchBranches(term: string): Observable<PharmacyBranchSearchDTO[]> {
    const params = new HttpParams().set('term', term);
    return this.http.get<PharmacyBranchSearchDTO[]>(`${this.baseUrl}/search`, { params });
  }
}
