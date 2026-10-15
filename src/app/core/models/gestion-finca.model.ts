/**
 * Modelos del panel de gestión de fincas (administrador y dueño de finca).
 * Reflejan tal cual lo que devuelve la API (campos en PascalCase).
 */

export interface ImagenGestion {
  IdImagen: number;
  IdFinca: number;
  UrlImagen: string;
  Orden: number;
  EsPortada: boolean;
  TextoAlternativo: string | null;
  Ancho?: number | null;
  Alto?: number | null;
}

export interface FincaGestion {
  IdFinca: number;
  IdMunicipio: number;
  NumeroDocumentoUsuario: number;
  NombreFinca: string;
  Direccion: string;
  InformacionAdicional: string | null;
  Capacidad: number;
  Precio: number;
  Estado: string;
  Calificacion: number | null;
  Habitaciones: number;
  Banos: number;
  Camas: number;
  NochesMinimas: number;
  Comodidades: string[];
  Reglas: string | null;
  HoraEntrada: string | null;
  HoraSalida: string | null;
  PermiteMascotas: boolean;
  PermiteEventos: boolean;
  Latitud: number | null;
  Longitud: number | null;
  UrlPortada: string | null;
  Imagenes: ImagenGestion[];
  NombreMunicipio: string | null;
  NombrePropietario: string | null;
  ApellidoPropietario: string | null;
}

/** Datos que se envían al crear o editar una finca. */
export type FincaPayload = Partial<Omit<FincaGestion, 'IdFinca' | 'UrlPortada' | 'Imagenes' | 'NombreMunicipio' | 'NombrePropietario' | 'ApellidoPropietario'>>;

export interface MunicipioOpcion {
  IdMunicipio: number;
  NombreMunicipio: string;
}

export interface UsuarioOpcion {
  NumeroDocumento: number;
  NombreUsuario: string;
  ApellidoUsuario: string;
  Correo: string;
  Rol?: string;
}

export interface ReservaDueno {
  IdReserva: number;
  IdFinca: number;
  NombreFinca: string | null;
  NombreMunicipio: string | null;
  FechaReserva: string | null;
  FechaEntrada: string;
  FechaSalida: string;
  MontoReserva: number;
  Estado: string | null;
  NombreCliente: string | null;
  ApellidoCliente: string | null;
  TelefonoCliente: string | null;
  CorreoCliente: string | null;
}

export interface PagoDueno {
  IdPago: number;
  IdFactura: number;
  IdReserva: number | null;
  IdFinca: number | null;
  NombreFinca: string | null;
  Monto: number;
  FechaPago: string | null;
  EstadoPago: string | null;
  NombreMetodoDePago: string | null;
}

export const ESTADOS_FINCA = ['Disponible', 'No disponible'] as const;
export const ESTADOS_RESERVA = ['Activa', 'Confirmada', 'Finalizada', 'Cancelada'] as const;
