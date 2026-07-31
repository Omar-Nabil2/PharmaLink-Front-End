import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@environments/environment';
import {
  AnswerMedicalInquiryRequest,
  CreateMedicalInquiryRequest,
  MedicalInquiry,
} from '@core/interfaces/medical-inquiry.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MedicalInquiryService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.localUrl}/MedicalInquiries`;

  create(request: CreateMedicalInquiryRequest): Observable<MedicalInquiry> {
    return this.http.post<MedicalInquiry>(this.url, request);
  }

  getMine(): Observable<MedicalInquiry[]> {
    return this.http.get<MedicalInquiry[]>(`${this.url}/my`);
  }

  getForReviewTeam(): Observable<MedicalInquiry[]> {
    return this.http.get<MedicalInquiry[]>(`${this.url}/review-team`);
  }

  answer(id: string, request: AnswerMedicalInquiryRequest): Observable<MedicalInquiry> {
    return this.http.put<MedicalInquiry>(`${this.url}/${id}/answer`, request);
  }
}
