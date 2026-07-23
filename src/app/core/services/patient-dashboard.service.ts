import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '@environments/environment';
import { PatientDashboardData } from '../interfaces/patient-dashboard.interface';

@Injectable({
  providedIn: 'root'
})
export class PatientDashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `https://localhost:5001/api/v1/Dashboard?recentOrdersCount=5`; 

  getDashboardData(recentOrdersCount: number = 5): Observable<PatientDashboardData> {
    const params = new HttpParams().set('recentOrdersCount', recentOrdersCount.toString());

    return this.http.get<PatientDashboardData>(this.apiUrl, { params }).pipe(
      catchError(error => {
        console.error('PatientDashboardService error:', error);
        return throwError(() => new Error('Failed to load dashboard data.'));
      })
    );
  }
}