import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ImagenFinca } from '../models/imagen.model';

/**
 * Servicio para la galería de imágenes de las fincas.
 * Los archivos se suben a la API, que los valida, optimiza (WebP, máx. 1600 px) y los
 * aloja en Supabase Storage. `UrlImagen` es la URL pública lista para mostrar.
 */
@Injectable({ providedIn: 'root' })
export class ImagenService {
  private readonly baseUrl = `${environment.apiUrl}/imagen`;
  private readonly fincaUrl = `${environment.apiUrl}/finca`;

  /** Límites que también valida la API (se revisan aquí para dar un error inmediato). */
  static readonly MAX_BYTES = 5 * 1024 * 1024;
  static readonly MAX_IMAGENES_POR_FINCA = 10;
  static readonly TIPOS_ACEPTADOS = ['image/jpeg', 'image/png', 'image/webp'];

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
   * Galería completa de una finca (portada primero), con todos los datos de cada imagen.
   * Si falla, propaga el error para que la pantalla lo muestre.
   */
  getGaleria(fincaId: string | number): Observable<ImagenFinca[]> {
    return this.http
      .get<ImagenFinca[]>(`${this.baseUrl}/finca/${encodeURIComponent(fincaId)}`)
      .pipe(map((resp) => (Array.isArray(resp) ? resp : [])));
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
            if (!mapa.has(clave) || img.EsPortada === true) {
              mapa.set(clave, url);
            }
          }
        }
        return mapa;
      }),
      catchError(() => of(new Map<string, string>()))
    );
  }

  /**
   * Revisa un archivo antes de enviarlo. Devuelve el mensaje de error o null si es válido.
   */
  validarArchivo(archivo: File): string | null {
    if (!ImagenService.TIPOS_ACEPTADOS.includes(archivo.type)) {
      return 'Formato no permitido. Usa una imagen JPG, PNG o WebP.';
    }
    if (archivo.size > ImagenService.MAX_BYTES) {
      return 'La imagen supera el tamaño máximo de 5 MB.';
    }
    if (archivo.size === 0) {
      return 'El archivo está vacío.';
    }
    return null;
  }

  /**
   * Sube una imagen a la galería de la finca (multipart/form-data, campo "imagen").
   * La primera imagen de una finca queda como portada.
   */
  subirImagen(
    fincaId: string | number,
    archivo: File,
    opciones: { textoAlternativo?: string; esPortada?: boolean } = {}
  ): Observable<ImagenFinca> {
    const error = this.validarArchivo(archivo);
    if (error) {
      return throwError(() => new Error(error));
    }

    const form = new FormData();
    form.append('imagen', archivo, archivo.name);
    if (opciones.textoAlternativo?.trim()) {
      form.append('TextoAlternativo', opciones.textoAlternativo.trim());
    }
    if (opciones.esPortada) {
      form.append('EsPortada', 'true');
    }

    // Sin Content-Type: el navegador agrega el boundary del multipart
    return this.http
      .post<{ imagen: ImagenFinca }>(`${this.fincaUrl}/${encodeURIComponent(fincaId)}/imagenes`, form)
      .pipe(
        map((resp) => resp.imagen),
        catchError((err) => throwError(() => new Error(err?.error?.message || 'No se pudo subir la imagen.')))
      );
  }

  /**
   * Marca una imagen como portada de su finca (la anterior deja de serlo).
   */
  establecerPortada(idImagen: string | number): Observable<ImagenFinca> {
    return this.http.put<{ imagen: ImagenFinca }>(`${this.baseUrl}/${encodeURIComponent(idImagen)}`, { EsPortada: true }).pipe(
      map((resp) => resp.imagen),
      catchError((err) => throwError(() => new Error(err?.error?.message || 'No se pudo cambiar la portada.')))
    );
  }

  /**
   * Elimina una imagen (fila y archivo). Si era la portada, la siguiente la reemplaza.
   */
  eliminar(idImagen: string | number): Observable<void> {
    return this.http.delete(`${this.baseUrl}/${encodeURIComponent(idImagen)}`).pipe(
      map(() => undefined),
      catchError((err) => throwError(() => new Error(err?.error?.message || 'No se pudo eliminar la imagen.')))
    );
  }

  private extraerUrl(item: any): string | null {
    if (!item) return null;
    if (typeof item === 'string') return item;
    const url = item.UrlImagen ?? item.urlImagen ?? item.Imagen ?? item.imagen ?? item.Url ?? item.url;
    return typeof url === 'string' && url.trim().length > 0 ? url.trim() : null;
  }
}
