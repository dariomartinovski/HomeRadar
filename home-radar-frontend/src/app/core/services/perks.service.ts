import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Perk } from '../../interfaces/perk.interface';
import { PerkType } from '../../enums/perk-type.enum';

@Injectable({
  providedIn: 'root'
})
export class PerkService {
  private path: string = 'http://localhost:8080/api/perks';

  #http = inject(HttpClient);

  fetchPerks(): Observable<Perk[]> {
    return this.#http.get<Perk[]>(this.path);
  }

  findById(id: number): Observable<Perk> {
    return this.#http.get<Perk>(`${this.path}/${id}`);
  }

  findAllCategories(): Observable<PerkType[]> {
    return this.#http.get<PerkType[]>(`${this.path}/categories`);
  }
}