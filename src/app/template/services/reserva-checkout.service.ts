import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UsuarioNormalizado } from './auth.service';
import { Factura, Reserva } from './reserva.service';

export interface ReservaCheckoutDraft {
  fincaId: string;
  fincaNombre: string;
  municipio?: string | null;
  precioNoche: number | null;
  fechaEntrada: string;
  fechaSalida: string;
  noches: number;
  huespedes: number;
  montoTotal: number;
  usuarioCorreo?: string | null;
  usuarioDocumento?: string | number | null;
  usuarioNombreCompleto?: string | null;
  usuario?: UsuarioNormalizado | null;
  fincaImagen?: string | null;
}

export interface ReservaCheckoutResult {
  reserva: Reserva;
  pago: PagoResumen;
  factura?: Factura | null;
}

export interface PagoResumen {
  id?: string;
  metodoNombre: string;
  monto: number;
  fechaPago: string;
  referencia?: string | null;
  estado?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ReservaCheckoutService {
  private readonly DRAFT_KEY = 'renfi_checkout_draft';
  private readonly RESULT_KEY = 'renfi_checkout_result';

  private readonly draftSubject = new BehaviorSubject<ReservaCheckoutDraft | null>(this.readDraft());
  private readonly resultSubject = new BehaviorSubject<ReservaCheckoutResult | null>(this.readResult());

  readonly draft$ = this.draftSubject.asObservable();
  readonly result$ = this.resultSubject.asObservable();

  setDraft(draft: ReservaCheckoutDraft): void {
    this.draftSubject.next(draft);
    this.persistDraft(draft);
  }

  getDraft(): ReservaCheckoutDraft | null {
    return this.draftSubject.value ?? this.readDraft();
  }

  clearDraft(): void {
    this.draftSubject.next(null);
    this.clearStorageKey(this.DRAFT_KEY);
  }

  setResult(result: ReservaCheckoutResult): void {
    this.resultSubject.next(result);
    this.persistResult(result);
  }

  consumeResult(): ReservaCheckoutResult | null {
    const value = this.resultSubject.value ?? this.readResult();
    this.resultSubject.next(null);
    this.clearStorageKey(this.RESULT_KEY);
    return value;
  }

  private readDraft(): ReservaCheckoutDraft | null {
    return this.readKey<ReservaCheckoutDraft>(this.DRAFT_KEY);
  }

  private readResult(): ReservaCheckoutResult | null {
    return this.readKey<ReservaCheckoutResult>(this.RESULT_KEY);
  }

  private persistDraft(draft: ReservaCheckoutDraft): void {
    this.writeKey(this.DRAFT_KEY, draft);
  }

  private persistResult(result: ReservaCheckoutResult): void {
    this.writeKey(this.RESULT_KEY, result);
  }

  private readKey<T>(key: string): T | null {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return null;
    }

    try {
      const raw = window.sessionStorage.getItem(key);
      if (!raw) {
        return null;
      }
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  private writeKey(key: string, value: unknown): void {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return;
    }

    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch {

    }
  }

  private clearStorageKey(key: string): void {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return;
    }

    try {
      window.sessionStorage.removeItem(key);
    } catch {

    }
  }
}
