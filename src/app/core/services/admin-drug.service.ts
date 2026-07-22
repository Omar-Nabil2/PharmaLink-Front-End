import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { CreateDrugDto, DrugDto, DrugSearchRequest, UpdateDrugDto } from '@pages/admin/drugs/admin-drugs.model';

export interface PaginatedList<T> {
  items: T[];
  pageNumber: number;
  totalCount: number;
  pageSize: number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })
export class AdminDrugService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.localUrl;

  getDrugs(filters: DrugSearchRequest): Observable<PaginatedList<DrugDto>> {
    let params = new HttpParams()
      .set('pageNumber', filters.pageNumber.toString())
      .set('pageSize', filters.pageSize.toString());

    if (filters.searchValue) {
      params = params.set('searchValue', filters.searchValue.trim());
    }
    if (filters.category !== undefined && filters.category !== null) {
      params = params.set('category', filters.category.toString());
    }
    if (filters.form) {
      params = params.set('form', filters.form);
    }
    if (filters.sortColumn) {
      params = params.set('sortColumn', filters.sortColumn);
    }
    if (filters.sortDirection) {
      params = params.set('sortDirection', filters.sortDirection);
    }

    return this.http.get<PaginatedList<DrugDto>>(`${this.baseUrl}/Drugs`, { params });
  }

  getDrugById(id: string): Observable<DrugDto> {
    return this.http.get<DrugDto>(`${this.baseUrl}/Drugs/${id}`);
  }

  createDrug(dto: CreateDrugDto): Observable<DrugDto> {
    return this.http.post<DrugDto>(`${this.baseUrl}/Drugs`, dto);
  }

  updateDrug(id: string, dto: UpdateDrugDto): Observable<DrugDto> {
    return this.http.put<DrugDto>(`${this.baseUrl}/Drugs/${id}`, dto);
  }

  deleteDrug(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/Drugs/${id}`);
  }

  seedCatalog(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/Drugs/seed`, {});
  }
}
