import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';

export interface RegistroUsuarioRequest {
  IdRol: number;
  NombreUsuario: string;
  ApellidoUsuario: string;
  Telefono: string;
  Contrasena: string;
  Correo: string;
  Estado: string;
}

export interface LoginRequest {
  correo: string;
  contrasena: string;
  Correo?: string;
  Contrasena?: string;
}

export interface LoginResponse {
  token?: string;
  usuario?: UsuarioNormalizado | null;
  user?: unknown;
  message?: string;
}

export interface UsuarioApiDto {
  [key: string]: unknown;
}

export interface UsuarioNormalizado {
  IdUsuario?: number;
  NombreUsuario?: string;
  ApellidoUsuario?: string;
  Telefono?: string;
  Correo?: string;
  Estado?: string;
  Rol?: string;
  IdRol?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = 'http://localhost:3000/api/usuario';

  constructor(private readonly http: HttpClient) {}

  registrarUsuario(payload: RegistroUsuarioRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/`, payload);
  }

  iniciarSesion(payload: LoginRequest): Observable<LoginResponse> {
    const correo = (payload.correo ?? payload.Correo ?? '').trim().toLowerCase();
    const contrasena = payload.contrasena ?? payload.Contrasena ?? '';

    const apiPayload = {
      correo,
      contrasena,
      Correo: correo,
      Contrasena: contrasena
    };

    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, apiPayload).pipe(
      map((respuesta) => ({
        ...respuesta,
        usuario: this.normalizarUsuario((respuesta?.usuario ?? respuesta?.user ?? null) as UsuarioApiDto | null),
        message: respuesta?.message
      })),
      catchError((error) => {
        if (error?.status === 404 || error?.status === 500) {
          return this.fallbackLogin(correo, contrasena);
        }
        return throwError(() => error);
      })
    );
  }

  actualizarPerfil(idUsuario: number, payload: Partial<RegistroUsuarioRequest>): Observable<UsuarioNormalizado> {
    return this.http
      .put<UsuarioApiDto>(`${this.apiUrl}/${idUsuario}`, payload)
      .pipe(map((respuesta) => this.normalizarUsuario(respuesta) ?? this.mapearDesdePayload(idUsuario, payload)));
  }

  private fallbackLogin(correo: string, contrasena: string): Observable<LoginResponse> {
    return this.http.get<UsuarioApiDto[]>(`${this.apiUrl}`).pipe(
      map((usuarios) => {
        const candidato = usuarios.find((usuario) => {
          const correoUsuario = this.pickString(usuario, ['Correo', 'correo', 'CorreoElectronico', 'correoElectronico'])?.trim().toLowerCase() ?? '';
          const passwordUsuario = this.pickString(usuario, ['Contrasena', 'Contraseña', 'Password', 'password']) ?? '';
          return correoUsuario === correo && passwordUsuario === contrasena;
        });

        if (!candidato) {
          throw { status: 401, error: { message: 'Credenciales incorrectas. Verifica tu correo y contraseña.' } };
        }

        return {
          token: undefined,
          usuario: this.normalizarUsuario(candidato),
          message: 'Inicio de sesión exitoso.'
        } satisfies LoginResponse;
      })
    );
  }

  private normalizarUsuario(usuario: UsuarioApiDto | null | undefined): UsuarioNormalizado | null {
    if (!usuario) {
      return null;
    }

    return {
      IdUsuario: this.pickNumber(usuario, ['IdUsuario', 'idUsuario']),
      NombreUsuario: this.pickString(usuario, ['NombreUsuario', 'nombre', 'Nombre']),
      ApellidoUsuario: this.pickString(usuario, ['ApellidoUsuario', 'apellido', 'Apellido']),
      Telefono: this.pickString(usuario, ['Telefono', 'telefono', 'TelefonoUsuario']),
      Correo: this.pickString(usuario, ['Correo', 'correo', 'CorreoElectronico', 'correoElectronico']),
      Estado: this.pickString(usuario, ['Estado', 'estado']),
      Rol: this.pickString(usuario, ['Rol', 'rol']),
      IdRol: this.pickNumber(usuario, ['IdRol', 'idRol'])
    };
  }

  private pickString(usuario: UsuarioApiDto, keys: string[]): string | undefined {
    for (const key of keys) {
      const valor = usuario[key];
      if (typeof valor === 'string') {
        return valor;
      }
      if (typeof valor === 'number') {
        return String(valor);
      }
    }
    return undefined;
  }

  private pickNumber(usuario: UsuarioApiDto, keys: string[]): number | undefined {
    for (const key of keys) {
      const valor = usuario[key];
      if (typeof valor === 'number') {
        return valor;
      }
      if (typeof valor === 'string') {
        const parsed = Number(valor);
        if (!Number.isNaN(parsed)) {
          return parsed;
        }
      }
    }
    return undefined;
  }

  private mapearDesdePayload(idUsuario: number, payload: Partial<RegistroUsuarioRequest>): UsuarioNormalizado {
    return {
      IdUsuario: idUsuario,
      NombreUsuario: payload.NombreUsuario,
      ApellidoUsuario: payload.ApellidoUsuario,
      Telefono: payload.Telefono,
      Correo: payload.Correo,
      Estado: payload.Estado,
      Rol: payload.IdRol !== undefined ? String(payload.IdRol) : undefined,
      IdRol: payload.IdRol
    };
  }
}
