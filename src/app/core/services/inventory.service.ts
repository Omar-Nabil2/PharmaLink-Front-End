import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '@environments/environment';
import {
  AddPharmacyInventoryDto,
  GetPharmacyInventoryDTO,
  GetPharmacyInventoryParamRequest,
  InventoryStatusFilter,
  PaginatedList,
  PharmacyInventoryDto,
  ProblemDetails,
  UpdatePharmacyInventoryDto,
} from '@pages/inventory/inventory.model';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.localUrl;
  private readonly resource = 'Inventory';

  // ── Signal store ────────────────────────────────────────────
  private readonly _items = signal<GetPharmacyInventoryDTO[]>([]);
  private readonly _totalCount = signal(0);
  private readonly _loading = signal(false);
  private readonly _error = signal<ProblemDetails | null>(null);

  readonly items = this._items.asReadonly();
  readonly totalCount = this._totalCount.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly hasItems = computed(() => this._items().length > 0);

  load(params: GetPharmacyInventoryParamRequest): void {
    this._loading.set(true);
    this._error.set(null);

    this.getInventory(params).subscribe({
      next: (res) => {
        this._items.set(res.items ?? []);
        this._totalCount.set(res.totalCount ?? res.items?.length ?? 0);
        this._loading.set(false);
      },
      error: (problem: ProblemDetails) => {
        this._items.set([]);
        this._totalCount.set(0);
        this._error.set(problem);
        this._loading.set(false);
      },
    });
  }

  /** GET `/Inventory` — paginated list with search + status filter. */
  getInventory(
    params: GetPharmacyInventoryParamRequest,
  ): Observable<PaginatedList<GetPharmacyInventoryDTO>> {
    return this.http
      .get<PaginatedList<GetPharmacyInventoryDTO>>(`${this.baseUrl}/${this.resource}`, {
        params: this.buildParams(params),
      })
      .pipe(catchError((err: HttpErrorResponse) => throwError(() => this.toProblem(err))));
  }

  /**
   * GET `/Inventory/branch/{branchId}` — paginated inventory scoped to a single
   * branch. Restricted to `PharmacyAdmin` / `Pharmacist`. The `branchId` travels
   * in the path; search / status / paging travel as query params.
   */
  getInventoryByBranch(
    branchId: string,
    params: GetPharmacyInventoryParamRequest,
  ): Observable<PaginatedList<GetPharmacyInventoryDTO>> {
    return this.http
      .get<PaginatedList<GetPharmacyInventoryDTO>>(
        `${this.baseUrl}/${this.resource}/branch/${encodeURIComponent(branchId)}`,
        { params: this.buildParams(params) },
      )
      .pipe(catchError((err: HttpErrorResponse) => throwError(() => this.toProblem(err))));
  }

  /** GET `/Inventory/{id}` — detailed single item (includes rowVersion). */
  getById(inventoryId: string): Observable<PharmacyInventoryDto> {
    return this.http
      .get<PharmacyInventoryDto>(`${this.baseUrl}/${this.resource}/${encodeURIComponent(inventoryId)}`)
      .pipe(catchError((err: HttpErrorResponse) => throwError(() => this.toProblem(err))));
  }

  /** POST `/Inventory` — add a new medicine (201 Created). */
  add(dto: AddPharmacyInventoryDto): Observable<PharmacyInventoryDto> {
    return this.http
      .post<PharmacyInventoryDto>(`${this.baseUrl}/${this.resource}`, dto)
      .pipe(catchError((err: HttpErrorResponse) => throwError(() => this.toProblem(err))));
  }

  /** PUT `/Inventory/{id}` — update details / adjust stock. */
  update(inventoryId: string, dto: UpdatePharmacyInventoryDto): Observable<PharmacyInventoryDto> {
    return this.http
      .put<PharmacyInventoryDto>(
        `${this.baseUrl}/${this.resource}/${encodeURIComponent(inventoryId)}`,
        dto,
      )
      .pipe(catchError((err: HttpErrorResponse) => throwError(() => this.toProblem(err))));
  }

  /** DELETE `/Inventory/{id}` — remove an item (409 if stock is reserved). */
  remove(inventoryId: string): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/${this.resource}/${encodeURIComponent(inventoryId)}`)
      .pipe(catchError((err: HttpErrorResponse) => throwError(() => this.toProblem(err))));
  }

  private buildParams(query: GetPharmacyInventoryParamRequest): HttpParams {
    let params = new HttpParams()
      .set('pageNumber', String(query.pageNumber ?? 1))
      .set('pageSize', String(query.pageSize ?? 10));

    if (query.search?.trim()) {
      params = params.set('search', query.search.trim());
    }
    if (query.branchId) {
      params = params.set('branchId', query.branchId);
    }
    // Always send statusFilter (0 = All is a valid, explicit choice).
    if (query.statusFilter !== undefined && query.statusFilter !== null) {
      params = params.set('statusFilter', String(query.statusFilter as InventoryStatusFilter));
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
