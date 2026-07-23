import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '@environments/environment';
import { MedicineSearchDTO, PharmacyBranchSearchDTO } from '@pages/inventory/search.model';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  /** GET `/drugs/search?term=` — medicine lookup for the DrugId control. */
  searchMedicines(term: string): Observable<MedicineSearchDTO[]> {
    const params = new HttpParams().set('term', term.trim());
    return this.http
      .get<MedicineSearchDTO[]>(`${this.baseUrl}/drugs/search`, { params })
      .pipe(catchError(() => of([])));
  }

  /** GET `/pharmacies/branches/search?term=` — branch lookup for the BranchId control. */
  searchBranches(term: string): Observable<PharmacyBranchSearchDTO[]> {
    const params = new HttpParams().set('term', term.trim());
    return this.http
      .get<PharmacyBranchSearchDTO[]>(`${this.baseUrl}/pharmacies/branches/search`, { params })
      .pipe(catchError(() => of([])));
  }
}
