import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AvailableDrugDTO, PaginatedResponse, SupplierDrugDTO, SupplierProfileDTO, UpdateSupplierProfileDTO } from '../interfaces/supplier-features.model';

@Injectable({
    providedIn: 'root'
})
export class SupplierFeaturesService {
    private readonly http = inject(HttpClient);

    // ─── مسارات الـ API (تأكد إنها مطابقة للـ Controllers عندك) ───
    private readonly drugsUrl = `${environment.baseUrl}/SupplierDrugs`;
    private readonly profileUrl = `${environment.baseUrl}/SupplierProfile`;

    // ─── أدويتي ───
    getMyDrugs(pageNumber: number = 1, pageSize: number = 10, search?: string): Observable<PaginatedResponse<SupplierDrugDTO>> {
        let params = new HttpParams()
            .set('pageNumber', pageNumber.toString())
            .set('pageSize', pageSize.toString());

        if (search) {
            params = params.set('search', search);
        }

        return this.http.get<PaginatedResponse<SupplierDrugDTO>>(this.drugsUrl, { params });
    }

    getAvailableDrugs(): Observable<AvailableDrugDTO[]> {
        return this.http.get<AvailableDrugDTO[]>(`${this.drugsUrl}/available`);
    }

    addDrug(drugId: string): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.drugsUrl}/${drugId}`, null);
    }

    removeDrug(drugId: string): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.drugsUrl}/${drugId}`);
    }

    // ─── الملف الشخصي ───
    getProfile(): Observable<SupplierProfileDTO> {
        return this.http.get<SupplierProfileDTO>(this.profileUrl);
    }

    updateProfile(dto: UpdateSupplierProfileDTO): Observable<{ message: string }> {
        return this.http.put<{ message: string }>(this.profileUrl, dto);
    }

    searchGlobalDrugs(query: string): Observable<AvailableDrugDTO[]> {
        return this.http.get<AvailableDrugDTO[]>(`${this.drugsUrl}/search-global`, { params: { query } });
    }
}