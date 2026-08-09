import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { PrescriptionHistoryAnswer, PrescriptionHistoryQuestionRequest } from '@core/interfaces/prescription-history.interface';

@Injectable({ providedIn: 'root' })
export class PrescriptionHistoryService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.baseUrl}/prescription-history`;

  ask(question: string): Observable<PrescriptionHistoryAnswer> {
    const payload: PrescriptionHistoryQuestionRequest = { question };
    return this.http.post<PrescriptionHistoryAnswer>(`${this.endpoint}/ask`, payload);
  }
}
