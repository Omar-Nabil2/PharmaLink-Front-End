import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AdminUserDto,
  AdminUserFilterDto,
  UpdateUserStatusDto,
  PaginatedList
} from './admin-users.model';

@Injectable({
  providedIn: 'root'
})
export class AdminUsersService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.baseUrl}/AdminUsers`;

  getUsers(filter: AdminUserFilterDto): Observable<PaginatedList<AdminUserDto>> {
    let params = new HttpParams()
      .set('pageNumber', filter.pageNumber.toString())
      .set('pageSize', filter.pageSize.toString());

    if (filter.search) {
      params = params.set('search', filter.search);
    }
    if (filter.role) {
      params = params.set('role', filter.role);
    }
    if (filter.status !== undefined && filter.status !== null) {
      params = params.set('status', filter.status.toString());
    }

    return this.http.get<PaginatedList<AdminUserDto>>(this.apiUrl, { params });
  }

  updateUserStatus(userId: string, dto: UpdateUserStatusDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${userId}/status`, dto);
  }
}
