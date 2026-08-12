import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface RecurringRunDto {
  id: string;
  status: string;
  scheduledAt: string;
  processedAt?: string;
  orderId?: string;
}

export interface RecurringDto {
  id: string;
  name: string;
  notes?: string;
  intervalDays: number;
  startDate: string;
  endDate?: string;
  nextRunDate: string;
  fulfillmentMode: string;
  preferredBranchId?: string;
  preferredBranchName?: string;
  requireConfirmation: boolean;
  status: string;
  createdAt: string;
  recentRuns: RecurringRunDto[];
}

@Injectable({ providedIn: 'root' })
export class RecurringPrescriptionsService {
  private api = inject(HttpClient);
  private base = `${environment.apiUrl}/api/recurring-prescriptions`;

  getAll() { return this.api.get<RecurringDto[]>(this.base); }
  create(dto: any) { return this.api.post<RecurringDto>(this.base, dto); }
  update(id: string, dto: any) { return this.api.put<RecurringDto>(`${this.base}/${id}`, dto); }
  delete(id: string) { return this.api.delete(`${this.base}/${id}`); }
  pause(id: string) { return this.api.patch(`${this.base}/${id}/pause`, {}); }
  resume(id: string) { return this.api.patch(`${this.base}/${id}/resume`, {}); }
  skip(runId: string) { return this.api.post(`${this.base}/runs/${runId}/skip`, {}); }
}
