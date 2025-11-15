import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LoginResponse, UsuarioNormalizado } from './auth.service';

interface StoredSession {
  token?: string | null;
  usuario?: UsuarioNormalizado | null;
}

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private readonly SESSION_KEY = 'renfi_sesion';
  private readonly LOCAL_KEY = 'renfi_usuario';

  private readonly currentUserSubject = new BehaviorSubject<UsuarioNormalizado | null>(null);
  private readonly tokenSubject = new BehaviorSubject<string | null>(null);
  private readonly adminSubject = new BehaviorSubject<boolean>(false);
  private recordar = false;

  readonly currentUser$: Observable<UsuarioNormalizado | null> = this.currentUserSubject.asObservable();
  readonly token$: Observable<string | null> = this.tokenSubject.asObservable();
  readonly esAdmin$: Observable<boolean> = this.adminSubject.asObservable();

  constructor() {
    this.restoreSession();
  }

  setSession(respuesta: LoginResponse, recordar = false): void {
    const usuario = respuesta?.usuario ?? null;
    const token = respuesta?.token ?? null;

    this.currentUserSubject.next(usuario);
    this.tokenSubject.next(token);
    this.adminSubject.next(this.evaluarEsAdmin(usuario));
    this.recordar = recordar;
    this.persistSession({ usuario, token }, recordar);
  }

  clearSession(): void {
    this.currentUserSubject.next(null);
    this.tokenSubject.next(null);
    this.adminSubject.next(false);
    this.recordar = false;
    if (this.isBrowser()) {
      window.sessionStorage.removeItem(this.SESSION_KEY);
      window.localStorage.removeItem(this.LOCAL_KEY);
    }
  }

  getSnapshot(): UsuarioNormalizado | null {
    return this.currentUserSubject.value;
  }

  getTokenSnapshot(): string | null {
    return this.tokenSubject.value;
  }

  esAdminSnapshot(): boolean {
    return this.adminSubject.value;
  }

  esAdminUsuario(usuario: UsuarioNormalizado | null | undefined): boolean {
    return this.evaluarEsAdmin(usuario ?? null);
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  updateProfile(usuarioActualizado: UsuarioNormalizado, recordar = this.recordar): void {
    this.currentUserSubject.next(usuarioActualizado);
    this.adminSubject.next(this.evaluarEsAdmin(usuarioActualizado));
    const data: StoredSession = {
      usuario: usuarioActualizado,
      token: this.tokenSubject.value
    };
    this.recordar = recordar;
    this.persistSession(data, recordar);
  }

  recordarSesionActiva(): boolean {
    return this.recordar;
  }

  private restoreSession(): void {
    if (!this.isBrowser()) {
      return;
    }

    const sessionData = this.readStorage(this.SESSION_KEY, 'session');
    const localData = this.readStorage(this.LOCAL_KEY, 'local');
    const data = sessionData ?? localData;

    if (data) {
      this.currentUserSubject.next(data.usuario ?? null);
      this.tokenSubject.next(data.token ?? null);
      this.adminSubject.next(this.evaluarEsAdmin(data.usuario ?? null));
      this.recordar = !!localData;

      this.persistSession(data, !!localData);
    }
  }

  private persistSession(data: StoredSession, recordar: boolean): void {
    if (!this.isBrowser()) {
      return;
    }

    const payload = JSON.stringify(data);
    window.sessionStorage.setItem(this.SESSION_KEY, payload);

    if (recordar) {
      window.localStorage.setItem(this.LOCAL_KEY, payload);
    } else {
      window.localStorage.removeItem(this.LOCAL_KEY);
    }
  }

  private readStorage(key: string, tipo: 'session' | 'local'): StoredSession | null {
    if (!this.isBrowser()) {
      return null;
    }

    try {
      const storage = tipo === 'session' ? window.sessionStorage : window.localStorage;
      const raw = storage.getItem(key);
      if (!raw) {
        return null;
      }
      return JSON.parse(raw) as StoredSession;
    } catch (error) {

      return null;
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
  }

  private evaluarEsAdmin(usuario: UsuarioNormalizado | null): boolean {
    if (!usuario) {
      return false;
    }

    const rolNombre = usuario.Rol?.toString().toLowerCase().trim() ?? '';
    const idRol = usuario.IdRol ?? this.parseNumeroDesdeCadena(usuario.Rol);

    if (!rolNombre && idRol === undefined) {
      return false;
    }

    if (rolNombre.includes('admin')) {
      return true;
    }

    return idRol !== undefined ? idRol === 1 : false;
  }

  private parseNumeroDesdeCadena(valor: unknown): number | undefined {
    if (typeof valor === 'number') {
      return valor;
    }
    if (typeof valor === 'string') {
      const numero = Number(valor);
      if (!Number.isNaN(numero)) {
        return numero;
      }
    }
    return undefined;
  }
}
