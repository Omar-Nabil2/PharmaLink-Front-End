import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface ReminderDto {
  id: string;
  medicineName: string;
  dosage?: string;
  notes?: string;
  reminderTimes: string[];
  startDate: string;
  endDate?: string;
  notifyByEmail: boolean;
  notifyByWhatsApp: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface CreateReminderRequest {
  medicineName: string;
  dosage?: string;
  notes?: string;
  reminderTimes: string[];
  startDate: string;
  endDate?: string;
  prescriptionReviewMedicineId?: string;
  notifyByEmail: boolean;
  notifyByWhatsApp: boolean;
}

@Injectable({ providedIn: 'root' })
export class RemindersService {
  private api = inject(HttpClient);
  private base = `${environment.baseUrl}/medicine-reminders`;

  getAll() { return this.api.get<ReminderDto[]>(this.base); }
  create(dto: CreateReminderRequest) { return this.api.post<ReminderDto>(this.base, dto); }
  update(id: string, dto: CreateReminderRequest) { return this.api.put<ReminderDto>(`${this.base}/${id}`, dto); }
  delete(id: string) { return this.api.delete(`${this.base}/${id}`); }
  toggle(id: string) { return this.api.patch(`${this.base}/${id}/toggle`, {}); }
}
