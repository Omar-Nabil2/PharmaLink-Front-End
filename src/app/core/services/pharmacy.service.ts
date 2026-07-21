import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { PagedPharmacyResponse, PharmacyItem } from '../interfaces/pharmacy.interface';

@Injectable({
  providedIn: 'root',
})
export class PharmacyService {
  private readonly baseUrl = environment.baseUrl;

  constructor(private readonly http: HttpClient) {}

  /**
   * Retrieves all pharmacies with pagination.
   * GET /api/v1/Pharmacies?PageNumber=1&PageSize=10
   */
  getPharmacies(pageNumber: number = 1, pageSize: number = 10): Observable<PagedPharmacyResponse> {
    const params = new HttpParams()
      .set('PageNumber', pageNumber.toString())
      .set('PageSize', pageSize.toString());

    return this.http.get<PagedPharmacyResponse>(`${this.baseUrl}/Pharmacies`, { params });
  }

  /**
   * Retrieves a single pharmacy by ID.
   * GET /api/v1/Pharmacies/{id}
   */
  getPharmacyById(id: string): Observable<PharmacyItem> {
    return this.http.get<PharmacyItem>(`${this.baseUrl}/Pharmacies/${id}`);
  }
}
