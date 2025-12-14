import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {PerkType} from '../../interfaces/perk-type.interface';
import {CreatePerkTypeRequest} from '../../interfaces/requests/create-perk-type.request';

@Injectable({
  providedIn: 'root'
})
export class PerkTypeService {
  private apiUrl = 'http://localhost:8080/api/perk-types';

  constructor(private http: HttpClient) {}

  getAllPerkTypes(): Observable<PerkType[]> {
    return this.http.get<PerkType[]>(this.apiUrl);
  }

  getPerkTypeById(id: number): Observable<PerkType> {
    return this.http.get<PerkType>(`${this.apiUrl}/${id}`);
  }

  createPerkType(request: FormData): Observable<PerkType> {
    return this.http.post<PerkType>(this.apiUrl, request);
  }

  deletePerkType(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
