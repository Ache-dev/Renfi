import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  FincaGestion,
  FincaPayload,
  ImagenGestion,
  MunicipioOpcion,
  PagoDueno,
  ReservaDueno,
  UsuarioOpcion
} from '../models/gestion-finca.model';

export type ModoGestion = 'admin' | 'dueno';

/**
 * Acceso a la API para administrar fincas, su galería y lo que las fincas reciben
 * (reservas y pagos). Lo usan el panel del administrador y el del dueño de finca;
 * la API es quien decide qué puede hacer cada uno.
 */
@Injectable({ providedIn: 'root' })
export class GestionFincasService {
  private readonly api = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  /** Administrador: todas las fincas. Dueño: solo las suyas. */
  listarFincas(modo: ModoGestion): Observable<FincaGestion[]> {
    const ruta = modo === 'admin' ? 'finca' : 'finca/mias';
    return this.http.get<FincaGestion[]>(`${this.api}/${ruta}`).pipe(
      map((fincas) => (Array.isArray(fincas) ? fincas : [])),
      catchError(this.errorLegible)
    );
  }

  crearFinca(payload: FincaPayload): Observable<{ IdFinca: number; finca: FincaGestion | null }> {
    return this.http.post<{ IdFinca: number; finca: FincaGestion | null }>(`${this.api}/finca`, payload).pipe(catchError(this.errorLegible));
  }

  actualizarFinca(id: number, payload: FincaPayload): Observable<{ finca: FincaGestion | null }> {
    return this.http.put<{ finca: FincaGestion | null }>(`${this.api}/finca/${id}`, payload).pipe(catchError(this.errorLegible));
  }

  eliminarFinca(id: number): Observable<unknown> {
    return this.http.delete(`${this.api}/finca/${id}`).pipe(catchError(this.errorLegible));
  }

  listarMunicipios(): Observable<MunicipioOpcion[]> {
    return this.http.get<MunicipioOpcion[]>(`${this.api}/municipio`).pipe(
      map((lista) => (Array.isArray(lista) ? lista : []).sort((a, b) => a.NombreMunicipio.localeCompare(b.NombreMunicipio, 'es'))),
      catchError(this.errorLegible)
    );
  }

  /** Solo el administrador puede listar usuarios (para elegir el dueño de una finca). */
  listarUsuarios(): Observable<UsuarioOpcion[]> {
    return this.http.get<UsuarioOpcion[]>(`${this.api}/usuario`).pipe(
      map((lista) => (Array.isArray(lista) ? lista : [])),
      catchError(this.errorLegible)
    );
  }

  // ---- Galería ----

  listarImagenes(idFinca: number): Observable<ImagenGestion[]> {
    return this.http.get<ImagenGestion[]>(`${this.api}/imagen/finca/${idFinca}`).pipe(
      map((lista) => (Array.isArray(lista) ? lista : [])),
      catchError(this.errorLegible)
    );
  }

  subirImagen(idFinca: number, archivo: File, textoAlternativo?: string): Observable<unknown> {
    const datos = new FormData();
    datos.append('imagen', archivo, archivo.name);
    if (textoAlternativo) {
      datos.append('TextoAlternativo', textoAlternativo);
    }
    return this.http.post(`${this.api}/finca/${idFinca}/imagenes`, datos).pipe(catchError(this.errorLegible));
  }

  actualizarImagen(id: number, cambios: Partial<Pick<ImagenGestion, 'EsPortada' | 'Orden' | 'TextoAlternativo'>>): Observable<unknown> {
    return this.http.put(`${this.api}/imagen/${id}`, cambios).pipe(catchError(this.errorLegible));
  }

  eliminarImagen(id: number): Observable<unknown> {
    return this.http.delete(`${this.api}/imagen/${id}`).pipe(catchError(this.errorLegible));
  }

  // ---- Lo que reciben las fincas del dueño ----

  listarMisReservas(): Observable<ReservaDueno[]> {
    return this.http.get<ReservaDueno[]>(`${this.api}/reserva/mis-fincas`).pipe(
      map((lista) => (Array.isArray(lista) ? lista : [])),
      catchError(this.errorLegible)
    );
  }

  cambiarEstadoReserva(id: number, estado: string): Observable<unknown> {
    return this.http.put(`${this.api}/reserva/${id}/estado`, { Estado: estado }).pipe(catchError(this.errorLegible));
  }

  listarMisPagos(): Observable<PagoDueno[]> {
    return this.http.get<PagoDueno[]>(`${this.api}/pago/mis-fincas`).pipe(
      map((lista) => (Array.isArray(lista) ? lista : [])),
      catchError(this.errorLegible)
    );
  }

  private errorLegible(error: HttpErrorResponse) {
    const mensaje =
      error.error?.message || error.error?.error || (error.status === 0 ? 'No hay conexión con el servidor.' : error.message) || 'Error en la solicitud.';
    return throwError(() => new Error(mensaje));
  }
}
