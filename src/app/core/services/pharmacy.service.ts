import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { PagedPharmacyResponse, PharmacyItem } from '../interfaces/pharmacy.interface';
import {
  NearbyPharmaciesRequest,
  NearbyPharmaciesResponse,
} from '../interfaces/nearby-pharmacy.interface';

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
    return this.http.get<PharmacyItem>(url);
  }

  /**
   * GET /api/v1/patient/pharmacies/nearby
   * Returns nearby pharmacy branches for authenticated patient sorted by distance.
   */
  getNearbyPharmacies(request: NearbyPharmaciesRequest): Observable<NearbyPharmaciesResponse> {
    const url = `${this.baseUrl}/patient/pharmacies/nearby`;
    let params = new HttpParams()
      .set('latitude', request.latitude.toString())
      .set('longitude', request.longitude.toString());

    if (request.radiusKm !== undefined) params = params.set('radiusKm', request.radiusKm.toString());
    if (request.pageNumber !== undefined) params = params.set('pageNumber', request.pageNumber.toString());
    if (request.pageSize !== undefined) params = params.set('pageSize', request.pageSize.toString());
    if (request.search) params = params.set('search', request.search);
    if (request.isOpen !== undefined) params = params.set('isOpen', request.isOpen.toString());

    return this.http.get<NearbyPharmaciesResponse>(url, { params });
  }
}

