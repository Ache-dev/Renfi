import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthStateService } from '../../template/services/auth-state.service';
import { Router } from '@angular/router';

/**
 * Interceptor HTTP para inyectar token JWT de autorización y manejar errores 401.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private readonly authState: AuthStateService,
    private readonly router: Router
  ) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authState.getTokenSnapshot();

    let authReq = req;
    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !req.url.includes('/login')) {
          this.authState.clearSession();
          this.router.navigate(['/iniciar-sesion']);
        }
        return throwError(() => error);
      })
    );
  }
}
