import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';

export interface Drug {
  drugId: string;
  genericName: string;
  brandName: string;
  drugBankId: string;
  rxNormCui: string;
  ndcCode: string;
  strength: string;
  form: string;
  price: number;
  manufacturer: string;
  arabicName: string;
  drugClass: string;
  requiresPrescription: boolean;
  isActive: boolean;
  category: string;
  availabilityStatus: string;
}

@Injectable({
  providedIn: 'root'
})
export class DrugService {
  private readonly baseUrl = environment.localUrl + '/Drugs';

  constructor(private http: HttpClient) {}

  getDrugById(id: string): Observable<Drug> {
    return this.http.get<any>(`${this.baseUrl}/${id}`)
      .pipe(map(response => {
        if (!response) return response;
        return response.value !== undefined ? response.value : response;
      }));
  }
}
