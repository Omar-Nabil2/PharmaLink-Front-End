import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '@environments/environment';
import { AdminDashboardDTO, ProblemDetails } from '@pages/dashboard/admin-dashboard/admin-dashboard.model';

@Injectable({ providedIn: 'root' })
export class AdminDashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.localUrl;

  /**
   * Fetches the admin dashboard data.
   * @param recentOrdersCount Number of recent orders to include (default 10, max 50).
   * @param topPharmaciesCount Number of top pharmacies to include (default 5, max 20).
   */
  getAdminDashboard(
    recentOrdersCount = 10,
    topPharmaciesCount = 5,
  ): Observable<AdminDashboardDTO> {
    const url = `${this.baseUrl}/admin/dashboard`;
    return this.http
      .get<AdminDashboardDTO>(url, {
        params: { recentOrdersCount, topPharmaciesCount },
      })
      .pipe(catchError((err: HttpErrorResponse) => throwError(() => this.toProblemDetails(err))));
  }

  private toProblemDetails(err: HttpErrorResponse): ProblemDetails {
    const body = err.error as Partial<ProblemDetails> | null;
    return {
      type: body?.type,
      title: body?.title ?? err.statusText ?? 'Request failed',
      status: body?.status ?? err.status,
      detail: body?.detail,
      instance: body?.instance,
    };
  }
}
