import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, CanMatch, Route, Router, UrlSegment, UrlTree } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthStateService } from '../../template/services/auth-state.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate, CanActivateChild, CanMatch {

  constructor(private readonly authState: AuthStateService, private readonly router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.verificarAcceso();
  }

  canActivateChild(): Observable<boolean | UrlTree> {
    return this.verificarAcceso();
  }

  canMatch(_route: Route, _segments: UrlSegment[]): Observable<boolean | UrlTree> {
    return this.verificarAcceso();
  }

  private verificarAcceso(): Observable<boolean | UrlTree> {
    return this.authState.esAdmin$.pipe(
      take(1),
      map((esAdmin) => esAdmin ? true : this.router.createUrlTree(['/inicio']))
    );
  }
}
