import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { PagedPharmacyResponse, PharmacyItem } from '../interfaces/pharmacy.interface';

@Injectable({
  providedIn: 'root',
})
export class PharmacyService {
  private readonly baseUrl = environment.localUrl;

  constructor(private readonly http: HttpClient) {}

  /**
   * GET /api/v1/Pharmacies?PageNumber=1&PageSize=10
   * Retrieves paginated list of all pharmacies.
   */
  getPharmacies(pageNumber: number = 1, pageSize: number = 10): Observable<PagedPharmacyResponse> {
    const url = `${this.baseUrl}/Pharmacies`;
    console.log(
      `[PharmacyService] Requesting: GET ${url}?PageNumber=${pageNumber}&PageSize=${pageSize}`,
    );

    const params = new HttpParams()
      .set('PageNumber', pageNumber.toString())
      .set('PageSize', pageSize.toString());

    return this.http.get<PagedPharmacyResponse>(url, { params });
  }

  /**
   * GET /api/v1/Pharmacies/{id}
   * Retrieves single pharmacy details by ID.
   */
  getPharmacyById(id: string): Observable<PharmacyItem> {
    const url = `${this.baseUrl}/Pharmacies/${id}`;
    console.log(`[PharmacyService] Requesting Single Pharmacy: GET ${url}`);
    return this.http.get<PharmacyItem>(url);
  }
}
