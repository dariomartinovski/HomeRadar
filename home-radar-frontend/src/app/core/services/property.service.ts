import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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

  fetchPropertiesFiltered(title?: string, area?: string): Observable<Property[]> {
    let params = new HttpParams();
    
    if (title) {
      params = params.set('title', title);
    }
    if (area) {
      params = params.set('area', area);
    }

    return this.#http.get<Property[]>(`${this.path}/filter`, { params });
  }

  findAreas(): Observable<string[]> {
    return this.#http.get<string[]>(`${this.path}/areas`);
  }
}