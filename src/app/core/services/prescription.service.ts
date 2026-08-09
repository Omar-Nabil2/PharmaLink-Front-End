import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEventType, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface PrescriptionUploadResponse {
  id: string;
  fileUrl: string;
  status: string;
  uploadedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class PrescriptionService {
  private apiUrl = `${environment.baseUrl}/OrderPrescriptions`;

  constructor(private http: HttpClient) {}

  uploadPrescription(file: File): Observable<HttpEvent<PrescriptionUploadResponse>> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<PrescriptionUploadResponse>(this.apiUrl, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  // Admin/Pharmacist endpoint to get file URL.
  // Actually, backend returns file stream. So we need to handle blob.
  getPrescriptionFile(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/file`, { responseType: 'blob' });
  }
}
