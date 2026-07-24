import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import {
  AdminPharmacySummaryDto,
  AdminPharmacyDetailDto,
  AdminCreatePharmacyRequest,
  AdminUpdatePharmacyRequest,
  GetAdminPharmaciesQuery,
  PaginatedList,
  VerificationStatus,
  PharmacyOwnerResponseDto,
  GetPharmacyOwnersQuery,
  CreatePharmacyOwnerRequest,
  UpdatePharmacyOwnerRequest,
  UserStatus,
} from '@core/interfaces/admin-pharmacy.interface';

@Injectable({ providedIn: 'root' })
export class AdminPharmacyService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.localUrl;

  // ─── AdminPharmaciesDashboard endpoints ────────────────────────────────────

  /**
   * GET /api/v1/AdminPharmaciesDashboard
   * Retrieves paginated, filtered list of pharmacies.
   */
  getPharmacies(
    query: GetAdminPharmaciesQuery,
  ): Observable<PaginatedList<AdminPharmacySummaryDto>> {
    let params = new HttpParams()
      .set('PageNumber', (query.pageNumber ?? 1).toString())
      .set('PageSize', (query.pageSize ?? 10).toString());

    if (query.search?.trim()) {
      params = params.set('Search', query.search.trim());
    }
    if (query.status != null) {
      params = params.set('Status', query.status.toString());
    }
    if (query.city?.trim()) {
      params = params.set('City', query.city.trim());
    }

    return this.http.get<PaginatedList<AdminPharmacySummaryDto>>(
      `${this.baseUrl}/AdminPharmaciesDashboard`,
      { params },
    );
  }

  /**
   * GET /api/v1/AdminPharmaciesDashboard/:id
   * Retrieves detailed pharmacy profile by ID.
   */
  getPharmacyById(id: string): Observable<AdminPharmacyDetailDto> {
    return this.http.get<AdminPharmacyDetailDto>(
      `${this.baseUrl}/AdminPharmaciesDashboard/${id}`,
    );
  }

  /**
   * POST /api/v1/AdminPharmaciesDashboard
   * Creates a new pharmacy (multipart/form-data).
   */
  createPharmacy(data: AdminCreatePharmacyRequest): Observable<{ pharmacyId: string }> {
    const formData = this.buildPharmacyFormData(data);
    return this.http.post<{ pharmacyId: string }>(
      `${this.baseUrl}/AdminPharmaciesDashboard`,
      formData,
    );
  }

  /**
   * PUT /api/v1/AdminPharmaciesDashboard/:id
   * Updates a pharmacy (multipart/form-data).
   */
  updatePharmacy(id: string, data: AdminUpdatePharmacyRequest): Observable<void> {
    const formData = this.buildPharmacyFormData(data);
    return this.http.put<void>(
      `${this.baseUrl}/AdminPharmaciesDashboard/${id}`,
      formData,
    );
  }

  /**
   * DELETE /api/v1/AdminPharmaciesDashboard/:id
   * Soft-deletes a pharmacy (marks as Deleted).
   */
  deletePharmacy(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/AdminPharmaciesDashboard/${id}`,
    );
  }

  /**
   * PATCH /api/v1/AdminPharmaciesDashboard/:id/status
   * Updates pharmacy verification status.
   */
  changePharmacyStatus(id: string, status: VerificationStatus): Observable<void> {
    return this.http.patch<void>(
      `${this.baseUrl}/AdminPharmaciesDashboard/${id}/status`,
      status,
    );
  }

  /**
   * POST /api/v1/AdminPharmaciesDashboard/:id/assign-owner/:userId
   * Assigns a pharmacy admin user as owner of a pharmacy.
   */
  assignOwner(pharmacyId: string, userId: string): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/AdminPharmaciesDashboard/${pharmacyId}/assign-owner/${userId}`,
      {},
    );
  }

  // ─── PharmacyOwners endpoints ───────────────────────────────────────────────

  /**
   * GET /api/v1/PharmacyOwners
   * Retrieves paginated, filterable list of pharmacy owners.
   */
  getPharmacyOwners(
    query: GetPharmacyOwnersQuery,
  ): Observable<PaginatedList<PharmacyOwnerResponseDto>> {
    let params = new HttpParams()
      .set('PageNumber', (query.pageNumber ?? 1).toString())
      .set('PageSize', (query.pageSize ?? 10).toString());

    if (query.search?.trim()) {
      params = params.set('Search', query.search.trim());
    }
    if (query.status != null) {
      params = params.set('Status', query.status.toString());
    }
    if (query.pharmacyId) {
      params = params.set('PharmacyId', query.pharmacyId);
    }

    return this.http.get<PaginatedList<PharmacyOwnerResponseDto>>(
      `${this.baseUrl}/PharmacyOwners`,
      { params },
    );
  }

  /**
   * GET /api/v1/PharmacyOwners/:id
   * Retrieves pharmacy owner profile by ID.
   */
  getPharmacyOwnerById(id: string): Observable<PharmacyOwnerResponseDto> {
    return this.http.get<PharmacyOwnerResponseDto>(
      `${this.baseUrl}/PharmacyOwners/${id}`,
    );
  }

  /**
   * POST /api/v1/PharmacyOwners
   * Creates a new pharmacy owner user account.
   */
  createPharmacyOwner(
    data: CreatePharmacyOwnerRequest,
  ): Observable<PharmacyOwnerResponseDto> {
    return this.http.post<PharmacyOwnerResponseDto>(
      `${this.baseUrl}/PharmacyOwners`,
      data,
    );
  }

  /**
   * PUT /api/v1/PharmacyOwners/:id
   * Updates an existing pharmacy owner user account.
   */
  updatePharmacyOwner(id: string, data: UpdatePharmacyOwnerRequest): Observable<void> {
    return this.http.put<void>(
      `${this.baseUrl}/PharmacyOwners/${id}`,
      data,
    );
  }

  /**
   * DELETE /api/v1/PharmacyOwners/:id
   * Soft-deletes a pharmacy owner account (marks status as Inactive).
   */
  deletePharmacyOwner(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/PharmacyOwners/${id}`,
    );
  }

  /**
   * PATCH /api/v1/PharmacyOwners/:id/status
   * Updates the status (Active, Inactive, Suspended) of a pharmacy owner account.
   */
  changePharmacyOwnerStatus(id: string, status: UserStatus): Observable<void> {
    return this.http.patch<void>(
      `${this.baseUrl}/PharmacyOwners/${id}/status`,
      status,
    );
  }

  /**
   * POST /api/v1/PharmacyOwners/:id/assign-pharmacy/:pharmacyId
   * Assigns a pharmacy owner as owner of a specific pharmacy.
   */
  assignPharmacyToOwner(id: string, pharmacyId: string): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/PharmacyOwners/${id}/assign-pharmacy/${pharmacyId}`,
      {},
    );
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private buildPharmacyFormData(
    data: AdminCreatePharmacyRequest | AdminUpdatePharmacyRequest,
  ): FormData {
    const fd = new FormData();
    fd.append('LegalName', data.legalName);
    fd.append('LicenseNumber', data.licenseNumber);
    if (data.logoFile) {
      fd.append('LogoFile', data.logoFile, data.logoFile.name);
    }
    if (data.logoUrl) {
      fd.append('LogoUrl', data.logoUrl);
    }
    if (data.verificationStatus != null) {
      fd.append('VerificationStatus', data.verificationStatus.toString());
    }
    return fd;
  }
}
