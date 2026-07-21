import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, finalize, throwError } from 'rxjs';
import { environment } from '@environments/environment';
import {
  PharmacyDashboardDTO,
  ProblemDetails,
} from '@pages/dashboard/owner-dashboard/pharmacy-dashboard.model';

@Injectable({ providedIn: 'root' })
export class PharmacyDashboardService {
  private readonly http = inject(HttpClient);
  private readonly localUrl = environment.localUrl;
  private readonly resource = 'pharmacy/dashboard';

  private readonly _data = signal<PharmacyDashboardDTO | null>(null);
  private readonly _loading = signal(false);
  private readonly _error = signal<ProblemDetails | null>(null);

  readonly data = this._data.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly hasData = computed(() => this._data() !== null && this._error() === null);

  getOwnerDashboard(): Observable<PharmacyDashboardDTO> {
    return this.request(`${this.localUrl}/${this.resource}`);
  }

  getPharmacyDashboard(): Observable<PharmacyDashboardDTO> {
    return this.getOwnerDashboard();
  }

  getBranchDashboard(branchId: string): Observable<PharmacyDashboardDTO> {
    return this.request(`${this.localUrl}/${this.resource}/${encodeURIComponent(branchId)}`);
  }

  loadOwnerDashboard(): void {
    this.runIntoStore(this.getOwnerDashboard());
  }

  loadBranchDashboard(branchId: string): void {
    this.runIntoStore(this.getBranchDashboard(branchId));
  }

  private request(url: string): Observable<PharmacyDashboardDTO> {
    return this.http
      .get<PharmacyDashboardDTO>(url)
      .pipe(catchError((err: HttpErrorResponse) => throwError(() => this.toProblemDetails(err))));
  }

  private runIntoStore(source$: Observable<PharmacyDashboardDTO>): void {
    this._loading.set(true);
    this._error.set(null);

    source$
      .pipe(finalize(() => this._loading.set(false)))
      .subscribe({
        next: (dto) => this._data.set(dto),
        error: (problem: ProblemDetails) => {
          this._data.set(null);
          this._error.set(problem);
        },
      });
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
