import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedList, PreparationListDTO } from '../interfaces/preparation-list.interface';
import { environment } from '../../../environments/environment'; // <-- ضيف مسار الـ environment الصحيح هنا

@Injectable({
    providedIn: 'root'
})
export class PreparationListService {
    // غيرنا السطر ده عشان يقرأ من الـ environment
    // تقدر تستخدم environment.omarUrl لو الباك إند شغال عندك لوكال على بورت 5001
    private baseUrl = environment.localUrl; // استخدم environment.baseUrl لو الباك إند شغال على السيرفر

    constructor(private http: HttpClient) { }

    getPreparationList(pageNumber: number = 1, pageSize: number = 10): Observable<PaginatedList<PreparationListDTO>> {
        const params = new HttpParams()
            .set('pageNumber', pageNumber.toString())
            .set('pageSize', pageSize.toString());

        // التأكد إن المسار مظبوط
        return this.http.get<PaginatedList<PreparationListDTO>>(`${this.baseUrl}/PreparationList`, { params });
    }

    updateLegStatus(legId: string, status: number): Observable<any> {
        return this.http.patch(`${this.baseUrl}/OrderFulfillmentLegs/${legId}/status`, {
            status: status,
            reason: null
        });
    }
}