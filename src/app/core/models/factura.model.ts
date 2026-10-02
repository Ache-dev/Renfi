export interface Factura {
  id?: string;
  reservaId?: string;
  total: number | null;
  fechaFactura: string | null;
  estadoReserva?: string | null;
  nombreFinca?: string | null;
  municipio?: string | null;
  precioNoche?: number | null;
  meta?: Record<string, unknown> | null;
}

export interface CrearFacturaPayload {
  reservaId?: string | number | null;
  total: number;
  fechaFactura?: string | null;
  estadoReserva?: string | null;
  nombreFinca?: string | null;
  municipio?: string | null;
  precioNoche?: number | null;
}
