import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Property } from '../../interfaces/property.interface';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  private path: string = 'http://localhost:8080/api/properties';

  #http = inject(HttpClient);

  fetchProperties(): Observable<Property[]> {
    return this.#http.get<Property[]>(this.path);
  }

  findById(id: number): Observable<Property> {
    return this.#http.get<Property>(`${this.path}/${id}`);
  }
}