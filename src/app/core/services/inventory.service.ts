import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedResponse, InventoryItem, InventoryStatusFilter } from '../interfaces/inventory.interface';
import { environment } from '../../../environments/environment'; // عدل المسار حسب مشروعك

@Injectable({
    providedIn: 'root'
})
export class InventoryService {
    private apiUrl = `${environment.localUrl}/Inventory`; // عدل الـ base url بتاعك

    constructor(private http: HttpClient) { }

    getInventory(
        pageNumber: number,
        pageSize: number,
        search?: string,
        statusFilter: InventoryStatusFilter = InventoryStatusFilter.All
    ): Observable<PaginatedResponse<InventoryItem>> {
        let params = new HttpParams()
            .set('pageNumber', pageNumber.toString())
            .set('pageSize', pageSize.toString())
            .set('statusFilter', statusFilter.toString());

        if (search && search.trim() !== '') {
            params = params.set('search', search.trim());
        }

        return this.http.get<PaginatedResponse<InventoryItem>>(this.apiUrl, { params });
    }
}