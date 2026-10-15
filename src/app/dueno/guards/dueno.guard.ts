import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, CanMatch, Router, UrlTree } from '@angular/router';
import { Observable, combineLatest, map, take } from 'rxjs';
import { AuthStateService } from '../../template/services/auth-state.service';

/**
 * Deja entrar al panel "Mi finca" a los dueños de finca (y al administrador).
 * La API vuelve a validar el rol en cada petición: este guard solo evita mostrar pantallas inútiles.
 */
@Injectable({ providedIn: 'root' })
export class DuenoGuard implements CanActivate, CanActivateChild, CanMatch {
  constructor(private readonly authState: AuthStateService, private readonly router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.verificar();
  }

  canActivateChild(): Observable<boolean | UrlTree> {
    return this.verificar();
  }

  canMatch(): Observable<boolean | UrlTree> {
    return this.verificar();
  }

  private verificar(): Observable<boolean | UrlTree> {
    return combineLatest([this.authState.esDueno$, this.authState.esAdmin$]).pipe(
      take(1),
      map(([dueno, admin]) => (dueno || admin ? true : this.router.createUrlTree(['/inicio'])))
    );
  }
}
