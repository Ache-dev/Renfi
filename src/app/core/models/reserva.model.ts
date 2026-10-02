import { Pago } from './pago.model';
import { Factura } from './factura.model';

export interface Reserva {
  id: string;
  fincaId: string;
  fincaNombre: string | null;
  municipio?: string | null;
  fechaReserva?: string | null;
  fechaEntrada: string;
  fechaSalida: string;
  noches?: number | null;
  huespedes?: number | null;
  montoReserva?: number | null;
  estado?: string | null;
  usuarioCorreo?: string | null;
  usuarioNombre?: string | null;
  usuarioDocumento?: string | null;
  idUsuario?: number | null;
  precioNoche?: number | null;
  creadoEn?: string | null;
  pago?: Pago | null;
  factura?: Factura | null;
  meta?: Record<string, unknown> | null;
}

export interface ListaReservasFiltro {
  correo?: string | null;
  documento?: string | number | null;
  idUsuario?: number | null;
  fincaId?: string | number | null;
}

export interface CrearReservaPayload {
  fincaId: string;
  fincaNombre?: string | null;
  municipio?: string | null;
  fechaEntrada: string;
  fechaSalida: string;
  noches: number;
  huespedes: number;
  montoReserva: number;
  usuarioCorreo?: string | null;
  usuarioNombre?: string | null;
  usuarioDocumento?: string | number | null;
  idUsuario?: number | null;
  precioNoche?: number | null;
}
