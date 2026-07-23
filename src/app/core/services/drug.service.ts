import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { DrugDto, DrugSearchParams, PaginatedList } from '../interfaces/drug.interface';

@Injectable({
  providedIn: 'root',
})
export class DrugService {
  private readonly baseUrl =`https://localhost:5001/api/v1`;

  constructor(private readonly http: HttpClient) {}

  searchDrugs(params: DrugSearchParams): Observable<PaginatedList<DrugDto>> {
    let httpParams = new HttpParams()
      .set('pageNumber', String(params.pageNumber ?? 1))
      .set('pageSize', String(params.pageSize ?? 10));

    if (params.searchValue) httpParams = httpParams.set('searchValue', params.searchValue);
    if (params.category) httpParams = httpParams.set('category', params.category);
    if (params.latitude != null) httpParams = httpParams.set('latitude', String(params.latitude));
    if (params.longitude != null) httpParams = httpParams.set('longitude', String(params.longitude));

    return this.http.get<PaginatedList<DrugDto>>(`${this.baseUrl}/Drugs`, { params: httpParams });
  }

  getDrugById(id: string): Observable<DrugDto> {
    return this.http.get<DrugDto>(`${this.baseUrl}/Drugs/${id}`);
  }
}