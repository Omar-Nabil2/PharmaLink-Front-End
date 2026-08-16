import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import {
  PrescriptionAnalyticsRagRequest,
  PrescriptionAnalyticsRagResponse,
} from '@core/models/prescription-analytics-rag.model';

@Injectable({ providedIn: 'root' })
export class PrescriptionAnalyticsRagService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.baseUrl}/prescription-analytics`;

  queryAnalytics(
    request: PrescriptionAnalyticsRagRequest,
  ): Observable<PrescriptionAnalyticsRagResponse> {
    return this.http.post<PrescriptionAnalyticsRagResponse>(
      `${this.apiUrl}/ask`,
      request,
    );
  }

  reindex(): Observable<{ queuedCount: number }> {
    return this.http.post<{ queuedCount: number }>(
      `${this.apiUrl}/reindex`,
      {},
    );
  }
}
