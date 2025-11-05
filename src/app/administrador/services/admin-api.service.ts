import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

type Primitive = string | number | boolean | null | undefined;

export interface AdminRequestOptions {
  params?: Record<string, Primitive | Primitive[]> | HttpParams;
  headers?: Record<string, string>;
}

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly baseUrl = 'http://localhost:3000/api';

  constructor(private readonly http: HttpClient) {}

  list<T = unknown>(path: string, options?: AdminRequestOptions): Observable<T> {
    return this.http
      .get<T>(this.composeUrl(path), this.buildOptions(options))
      .pipe(catchError(this.handleError));
  }

  retrieve<T = unknown>(path: string, options?: AdminRequestOptions): Observable<T> {
    return this.http
      .get<T>(this.composeUrl(path), this.buildOptions(options))
      .pipe(catchError(this.handleError));
  }

  create<T = unknown>(path: string, payload: unknown, options?: AdminRequestOptions): Observable<T> {
    return this.http
      .post<T>(this.composeUrl(path), payload, this.buildOptions(options))
      .pipe(catchError(this.handleError));
  }

  update<T = unknown>(path: string, payload: unknown, options?: AdminRequestOptions): Observable<T> {
    return this.http
      .put<T>(this.composeUrl(path), payload, this.buildOptions(options))
      .pipe(catchError(this.handleError));
  }

  patch<T = unknown>(path: string, payload: unknown, options?: AdminRequestOptions): Observable<T> {
    return this.http
      .patch<T>(this.composeUrl(path), payload, this.buildOptions(options))
      .pipe(catchError(this.handleError));
  }

  delete<T = unknown>(path: string, options?: AdminRequestOptions): Observable<T> {
    return this.http
      .delete<T>(this.composeUrl(path), this.buildOptions(options))
      .pipe(catchError(this.handleError));
  }

  private composeUrl(path: string): string {
    if (!path) {
      return this.baseUrl;
    }

    if (/^https?:/i.test(path)) {
      return path;
    }

    const normalizado = path.startsWith('/') ? path.slice(1) : path;
    return `${this.baseUrl}/${normalizado}`;
  }

  private buildOptions(options?: AdminRequestOptions) {
    if (!options) {
      return {};
    }

    const { params, headers } = options;
    const built: Record<string, unknown> = {};

    if (params instanceof HttpParams) {
      built['params'] = params;
    } else if (params) {
      built['params'] = this.mapToHttpParams(params);
    }

    if (headers) {
      built['headers'] = headers;
    }

    return built;
  }

  private mapToHttpParams(params: Record<string, Primitive | Primitive[]>): HttpParams {
    let httpParams = new HttpParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }

      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (item !== undefined && item !== null) {
            httpParams = httpParams.append(key, String(item));
          }
        });
        return;
      }

      httpParams = httpParams.append(key, String(value));
    });

    return httpParams;
  }

  private handleError(error: HttpErrorResponse) {

    const mensaje = error.error?.message || error.error?.error || error.message || 'Error desconocido en la solicitud.';
    return throwError(() => new Error(mensaje));
  }
}
