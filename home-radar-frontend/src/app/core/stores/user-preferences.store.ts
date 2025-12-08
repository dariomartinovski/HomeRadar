import {inject, Injectable} from '@angular/core';
import {BehaviorSubject, firstValueFrom, Subject, switchMap, tap} from 'rxjs';
import { UserPreferences } from '../../interfaces/user-preferences.interface';
import {UserPreferencesService} from '../services/user-preferences.service';

@Injectable({
  providedIn: 'root'
})
export class UserPreferencesStore {
  private readonly _preferences$ = new BehaviorSubject<UserPreferences | null>(null);
  private readonly refreshTrigger$ = new Subject<void>();

  readonly preferences$ = this._preferences$.asObservable();

  constructor(private service: UserPreferencesService) {
    this.refreshTrigger$
      .pipe(
        switchMap(() => this.service.getDefaultPreferences()),
        tap(prefs => this._preferences$.next(prefs))
      )
      .subscribe();
  }

  refresh() {
    this.refreshTrigger$.next();
  }

  setPreferences(prefs: UserPreferences) {
    this._preferences$.next(prefs);
  }

  get snapshot(): UserPreferences | null {
    return this._preferences$.value;
  }
}
// If something needs to be changed
//updateRadius(newRadius: number) {
//   const prefs = this.preferencesStore.snapshot;
//   if (!prefs) return;
//
//   this.preferencesStore.setPreferences({
//     ...prefs,
//     radius: newRadius
//   });
// }
