import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Property } from '../../interfaces/property.interface';
import { Coordinate } from '../../interfaces/coordinate.interface';
import { HomeRadarScore } from '../../interfaces/home-radar-score.interface';

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

  fetchPropertiesFiltered(
    title?: string,
    area?: string
  ): Observable<Property[]> {
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

  createProperty(formData: FormData): Observable<Property> {
    return this.#http.post<Property>(this.path, formData);
  }

  calculateCircleScore(
    center: Coordinate,
    radius: number
  ): Observable<HomeRadarScore> {
    return this.#http.get<HomeRadarScore>(
      `${this.path}/circle/score?latitude=${center.latitude}&longitude=${center.longitude}&radius=${radius}`
    );
  }
}
