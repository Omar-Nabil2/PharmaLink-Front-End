import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
import { MedicineImageScanResponse } from '@core/interfaces/ai-scan.interface';

@Injectable({
  providedIn: 'root'
})
export class AiScanService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  scanMedicineImage(file: File): Observable<HttpEvent<MedicineImageScanResponse>> {
    const formData = new FormData();
    formData.append('File', file);

    return this.http.request<MedicineImageScanResponse>(
      new HttpRequest('POST', `${this.baseUrl}/ai/scan-medicine-image`, formData, {
        reportProgress: true,
        responseType: 'json'
      })
    );
  }
}
