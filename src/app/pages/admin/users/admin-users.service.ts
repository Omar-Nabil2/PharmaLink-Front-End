import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AdminUserDto,
  AdminUserFilterDto,
  UpdateUserStatusDto,
  UpdateUserRoleDto,
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
      params = params.set('Search', filter.search);
    }
    if (filter.role) {
      params = params.set('Role', filter.role);
    }
    if (filter.status !== undefined && filter.status !== null) {
      params = params.set('Status', filter.status.toString());
    }
    if (filter.sortBy) {
      params = params.set('SortBy', filter.sortBy);
    }
    if (filter.sortDirection) {
      params = params.set('SortDirection', filter.sortDirection);
    }

    return this.http.get<PaginatedList<AdminUserDto>>(this.apiUrl, { params });
  }

  updateUserStatus(userId: string, dto: UpdateUserStatusDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${userId}/status`, dto);
  }

  updateUserRole(userId: string, dto: UpdateUserRoleDto): Observable<AdminUserDto> {
    return this.http.put<AdminUserDto>(`${this.apiUrl}/${userId}/role`, dto);
  }
}
