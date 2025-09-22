import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Property } from '../../interfaces/property.interface';
import { Coordinate } from '../../interfaces/coordinate.interface';
import { HomeRadarScore } from '../../interfaces/home-radar-score.interface';
import { PropertyFilterRequest } from '../../interfaces/requests/property-filter.request';

@Injectable({
  providedIn: 'root',
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

  fetchPropertiesFiltered(filters: PropertyFilterRequest): Observable<Property[]> {
    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        params = params.set(key, value.toString());
      }
    });

    return this.#http.get<Property[]>(`${this.path}/filter`, { params });
  }

  findAreas(): Observable<string[]> {
    return this.#http.get<string[]>(`${this.path}/areas`);
  }

  createProperty(formData: FormData): Observable<Property> {
    return this.#http.post<Property>(this.path, formData);
  }

  calculateCircleScore(
    center: Coordinate,
    radius: number,
    filters: PropertyFilterRequest
  ): Observable<HomeRadarScore> {
    
    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        params = params.set(key, value.toString());
      }
    });

    if (center != null){
      params = params.set("latitude", center.latitude);
      params = params.set("longitude", center.longitude);
    }

    if (radius != null){
      params = params.set("radius", radius);
    }

    return this.#http.get<HomeRadarScore>(
      `${this.path}/circle/score`, { params }
    );
    // ?latitude=${center.latitude}&longitude=${center.longitude}&radius=${radius}
  }
}
