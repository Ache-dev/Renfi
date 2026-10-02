import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { UsuarioApiDto, UsuarioNormalizado } from '../models/usuario.model';

/**
 * Servicio para consulta y gestión de usuarios.
 */
@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly baseUrl = `${environment.apiUrl}/usuario`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Obtiene la lista completa de usuarios.
   */
  getUsuarios(): Observable<UsuarioApiDto[]> {
    return this.http.get<any>(this.baseUrl).pipe(
      map((resp) => {
        if (Array.isArray(resp)) return resp;
        if (resp && typeof resp === 'object') {
          return (resp.data ?? resp.usuarios ?? [resp]) as UsuarioApiDto[];
        }
        return [];
      }),
      catchError(() => of([]))
    );
  }

  /**
   * Obtiene un usuario buscando por correo electrónico.
   */
  getUsuarioPorCorreo(correo: string): Observable<UsuarioApiDto | null> {
    const normalizado = (correo ?? '').trim().toLowerCase();
    if (!normalizado) return of(null);

    return this.getUsuarios().pipe(
      map((usuarios) => {
        const encontrado = usuarios.find((u) => {
          const email = (u.Correo ?? (u as any).correo ?? (u as any).CorreoElectronico ?? '').toString().trim().toLowerCase();
          return email === normalizado;
        });
        return encontrado ?? null;
      }),
      catchError(() => of(null))
    );
  }

  /**
   * Obtiene el documento o identificador asociado a un correo electrónico.
   */
  obtenerDocumentoPorCorreo(correo: string): Observable<string | number | null> {
    return this.getUsuarioPorCorreo(correo).pipe(
      map((usuario) => {
        if (!usuario) return null;
        return (
          usuario.NumeroDocumento ??
          (usuario as any).numeroDocumento ??
          (usuario as any).Documento ??
          usuario.IdUsuario ??
          null
        );
      })
    );
  }
}
