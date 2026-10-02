export interface MetodoPago {
  id: string | number;
  nombre: string;
  permiteMixto?: boolean;
}

export interface Pago {
  id?: string;
  reservaId?: string;
  metodoId?: string | null;
  metodoNombre: string | null;
  monto: number | null;
  fechaPago: string | null;
  estado?: string | null;
  referencia?: string | null;
  pagoMixto?: boolean | null;
  meta?: Record<string, unknown> | null;
}

export interface CrearPagoPayload {
  reservaId?: string | number | null;
  facturaId?: string | number | null;
  monto: number;
  metodoId?: string | number | null;
  metodoNombre: string;
  pagoMixto?: boolean | null;
  referencia?: string | null;
  fechaPago?: string | null;
  estadoPago?: string | null;
}
