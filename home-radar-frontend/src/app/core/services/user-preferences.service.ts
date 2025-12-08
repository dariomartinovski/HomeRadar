import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { UserPreferences } from "../../interfaces/user-preferences.interface";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class UserPreferencesService {
  private path: string = 'http://localhost:8080/api/user-preferences';

  #http = inject(HttpClient);

  getDefaultPreferences(): Observable<UserPreferences> {
    return this.#http.get<UserPreferences>(`${this.path}/default`);
  }

  getUserPreference(): Observable<UserPreferences> {
    return this.#http.get<UserPreferences>(this.path);
  }

  createOrUpdateUserPreference(
    request: UserPreferences
  ): Observable<UserPreferences> {
    return this.#http.post<UserPreferences>(this.path, request);
  }
}
