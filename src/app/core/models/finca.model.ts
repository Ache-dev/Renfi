/**
 * Modelo de entidad Finca en Renfi.
 */
export interface Finca {
  id: string;
  nombre: string;
  descripcion: string | null;
  ubicacion: string | null;
  precioNoche: number | null;
  capacidad: number | null;
  habitaciones: number | null;
  banos: number | null;
  telefono: string | null;
  email: string | null;
  servicios: string | null;
  reservas: number | null;
  imagenUrl: string | null;
  imagenesDisponibles?: string[];
  [key: string]: unknown;
}

/**
 * Representación sin procesar de una Finca devuelta por la API REST.
 */
export interface FincaApiRaw {
  Id?: number | string;
  id?: number | string;
  IdFinca?: number | string;
  FincaId?: number | string;
  fincaId?: number | string;
  Nombre?: string;
  NombreFinca?: string;
  nombreFinca?: string;
  Descripcion?: string;
  Direccion?: string;
  Ubicacion?: string;
  Precio?: number | string;
  PrecioNoche?: number | string;
  Capacidad?: number | string;
  NumeroHabitaciones?: number | string;
  Habitaciones?: number | string;
  NumeroBanos?: number | string;
  Banos?: number | string;
  Baños?: number | string;
  Telefono?: string;
  Correo?: string;
  Email?: string;
  Servicios?: string | string[];
  Estado?: string;
  NombreMunicipio?: string;
  [key: string]: unknown;
}

/**
 * Filtros para el catálogo o búsqueda de fincas.
 */
export interface FiltrosFinca {
  query?: string;
  municipio?: string;
  estado?: string;
  capacidad?: number | null;
  precioMin?: number | null;
  precioMax?: number | null;
  calificacion?: number | null;
  ordenarPor?: 'relevancia' | 'precio-asc' | 'precio-desc' | 'capacidad' | 'nombre';
}
