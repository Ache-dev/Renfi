import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ImagenFinca } from '../models/imagen.model';

/**
 * Servicio para gestión de imágenes multimedia de fincas.
 */
@Injectable({ providedIn: 'root' })
export class ImagenService {
  private readonly baseUrl = `${environment.apiUrl}/imagen`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Obtiene todas las imágenes registradas en el sistema.
   */
  getImagenes(): Observable<ImagenFinca[]> {
    return this.http.get<ImagenFinca[]>(this.baseUrl).pipe(
      map((resp) => (Array.isArray(resp) ? resp : [])),
      catchError(() => of([]))
    );
  }

  /**
   * Obtiene las URLs de las imágenes asociadas a una finca específica.
   */
  getImagenesPorFinca(fincaId: string | number): Observable<string[]> {
    return this.http.get<any>(`${this.baseUrl}/finca/${encodeURIComponent(fincaId)}`).pipe(
      map((resp) => {
        const coleccion = Array.isArray(resp) ? resp : resp?.data ?? [];
        return coleccion
          .map((item: any) => this.extraerUrl(item))
          .filter((url: string | null): url is string => Boolean(url));
      }),
      catchError(() => of([]))
    );
  }

  /**
   * Construye un mapa ID Finca -> URL imagen principal.
   */
  getIndiceImagenes(): Observable<Map<string, string>> {
    return this.getImagenes().pipe(
      map((imagenes) => {
        const mapa = new Map<string, string>();
        for (const img of imagenes) {
          const fId = img.IdFinca ?? img.idFinca;
          const url = this.extraerUrl(img);
          if (fId !== undefined && fId !== null && url) {
            const clave = String(fId);
            if (!mapa.has(clave)) {
              mapa.set(clave, url);
            }
          }
        }
        return mapa;
      }),
      catchError(() => of(new Map<string, string>()))
    );
  }

  private extraerUrl(item: any): string | null {
    if (!item) return null;
    if (typeof item === 'string') return item;
    const url = item.UrlImagen ?? item.urlImagen ?? item.Imagen ?? item.imagen ?? item.Url ?? item.url;
    return typeof url === 'string' && url.trim().length > 0 ? url.trim() : null;
  }
}
