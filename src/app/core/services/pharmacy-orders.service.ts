import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '@environments/environment';
import {
  PaginatedList,
  PharmacyOrderDetailDTO,
  PharmacyOrderQueryParams,
  PharmacyOrderSummaryDTO,
  ProblemDetails,
} from '@pages/orders/pharmacy-orders/pharmacy-orders.model';

/**
 * Read-only client for the branch-scoped Pharmacy Orders API
 * (`/api/v1/pharmacy/orders`). Every response is already isolated by the backend
 * to the authenticated pharmacy's branches.
 */
@Injectable({ providedIn: 'root' })
export class PharmacyOrdersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;
  private readonly resource = 'pharmacy/orders';

  /** GET `/pharmacy/orders` — paginated list across all of the pharmacy's branches. */
  getOrders(
    params: PharmacyOrderQueryParams,
  ): Observable<PaginatedList<PharmacyOrderSummaryDTO>> {
    return this.http
      .get<PaginatedList<PharmacyOrderSummaryDTO>>(`${this.baseUrl}/${this.resource}`, {
        params: this.buildParams(params),
      })
      .pipe(catchError((err: HttpErrorResponse) => throwError(() => this.toProblem(err))));
  }

  /** GET `/pharmacy/orders/branch/{branchId}` — paginated list scoped to one branch. */
  getOrdersByBranch(
    branchId: string,
    params: PharmacyOrderQueryParams,
  ): Observable<PaginatedList<PharmacyOrderSummaryDTO>> {
    return this.http
      .get<PaginatedList<PharmacyOrderSummaryDTO>>(
        `${this.baseUrl}/${this.resource}/branch/${encodeURIComponent(branchId)}`,
        { params: this.buildParams(params) },
      )
      .pipe(catchError((err: HttpErrorResponse) => throwError(() => this.toProblem(err))));
  }

  /** GET `/pharmacy/orders/{id}` — full order detail (branch-scoped items + legs). */
  getOrderById(orderId: string): Observable<PharmacyOrderDetailDTO> {
    return this.http
      .get<PharmacyOrderDetailDTO>(
        `${this.baseUrl}/${this.resource}/${encodeURIComponent(orderId)}`,
      )
      .pipe(catchError((err: HttpErrorResponse) => throwError(() => this.toProblem(err))));
  }

  private buildParams(query: PharmacyOrderQueryParams): HttpParams {
    let params = new HttpParams()
      .set('pageNumber', String(query.pageNumber ?? 1))
      .set('pageSize', String(query.pageSize ?? 10));

    if (query.search?.trim()) {
      params = params.set('search', query.search.trim());
    }
    if (query.status !== undefined && query.status !== null) {
      params = params.set('status', String(query.status));
    }
    if (query.orderDateFrom) {
      params = params.set('orderDateFrom', query.orderDateFrom);
    }
    if (query.orderDateTo) {
      params = params.set('orderDateTo', query.orderDateTo);
    }
    if (query.deliveryDateFrom) {
      params = params.set('deliveryDateFrom', query.deliveryDateFrom);
    }
    if (query.deliveryDateTo) {
      params = params.set('deliveryDateTo', query.deliveryDateTo);
    }
    if (query.sortBy) {
      params = params.set('sortBy', query.sortBy);
    }

    return params;
  }

  private toProblem(err: HttpErrorResponse): ProblemDetails {
    const body = err.error as Partial<ProblemDetails> | null;
    return {
      type: body?.type,
      title: body?.title ?? err.statusText ?? 'Request failed',
      status: body?.status ?? err.status,
      detail: body?.detail,
      instance: body?.instance,
      errors: body?.errors,
    };
  }
}
