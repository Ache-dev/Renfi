import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface FincaDetalle {
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
  [key: string]: any;
}

export function mapearFinca(raw: any, index = 0): FincaDetalle {
  const id = pickField(
    raw,
    ['Id', 'id', 'IdFinca', 'FincaId', 'fincaId', 'ID', 'Codigo', 'codigo'],
    `${index}`
  )?.toString() ?? `${index}`;

  const nombre = pickField(raw, ['NombreFinca', 'nombreFinca', 'Nombre', 'nombre', 'Titulo', 'titulo'], 'Sin nombre');
  const descripcion = pickField(raw, ['Descripcion', 'descripcion', 'DescripcionFinca', 'descripcionFinca', 'Detalle', 'detalle', 'DetalleFinca', 'detalleFinca'], 'Descripción no disponible');
  const ubicacion = pickField(raw, ['Ubicacion', 'ubicacion', 'UbicacionFinca', 'ubicacionFinca', 'Direccion', 'direccion', 'Ciudad', 'ciudad', 'Municipio', 'municipio'], 'Ubicación no disponible');

  const precioRaw = pickField(raw, ['PrecioNoche', 'precioNoche', 'Precio', 'precio', 'ValorNoche', 'valorNoche', 'CostoNoche', 'costoNoche']);
  const capacidadRaw = pickField(raw, ['Capacidad', 'capacidad', 'NumeroHuespedes', 'numeroHuespedes', 'CapacidadMaxima', 'capacidadMaxima']);
  const habitacionesRaw = pickField(raw, ['Habitaciones', 'habitaciones', 'NumeroHabitaciones', 'numeroHabitaciones', 'HabitacionesDisponibles', 'habitacionesDisponibles']);
  const banosRaw = pickField(raw, ['Banos', 'banos', 'Baños', 'baños', 'NumeroBanos', 'numeroBanos', 'NumeroBaños', 'numeroBaños']);
  const telefono = pickField(raw, ['Telefono', 'telefono', 'Contacto', 'contacto', 'NumeroContacto', 'numeroContacto']);
  const email = pickField(raw, ['Email', 'email', 'Correo', 'correo', 'CorreoElectronico', 'correoElectronico']);
  const serviciosRaw = pickField(raw, ['Servicios', 'servicios', 'Amenidades', 'amenidades', 'Caracteristicas', 'caracteristicas', 'ServiciosIncluidos', 'serviciosIncluidos']);
  const reservasRaw = pickField(raw, ['Reservas', 'reservas', 'NumeroReservas', 'numeroReservas'], 0);
  const imagenEncontrada = pickField(
    raw,
    ['Imagen', 'imagen', 'ImagenUrl', 'imagenUrl', 'UrlImagen', 'urlImagen', 'Url', 'url', 'Foto', 'foto', 'FotoPrincipal', 'fotoPrincipal'],
    null
  );
  const imagenesColecciones = extraerColeccionesImagenes(raw);
  const imagenesDisponibles = construirGaleriaImagenes(imagenEncontrada, imagenesColecciones);
  const imagenUrl = imagenesDisponibles[0] ?? 'https://via.placeholder.com/280x200?text=Sin+Imagen';

  return {
    ...raw,
    id,
    nombre,
    descripcion,
    ubicacion,
    precioNoche: parseNumber(precioRaw),
    capacidad: parseNumber(capacidadRaw),
    habitaciones: parseNumber(habitacionesRaw),
    banos: parseNumber(banosRaw),
    telefono: telefono ?? null,
    email: email ?? null,
    servicios: Array.isArray(serviciosRaw) ? serviciosRaw.join(', ') : serviciosRaw ?? null,
    reservas: parseNumber(reservasRaw) ?? 0,
    imagenUrl,
    imagenesDisponibles
  };
}

export function crearIndiceImagenesPorFinca(imagenes: any[]): Map<string, string> {
  const indice = new Map<string, string>();

  if (!Array.isArray(imagenes)) {
    return indice;
  }

  imagenes.forEach((item) => {
    const fincaId = pickField(item, ['IdFinca', 'idFinca', 'FincaId', 'fincaId', 'Id', 'id'], null);
    const url = pickField(item, ['UrlImagen', 'urlImagen', 'Imagen', 'imagen', 'Url', 'url'], null);
    const urlNormalizada = normalizarUrlImagen(url);

    if (fincaId !== undefined && fincaId !== null && urlNormalizada) {
      const clave = String(fincaId);
      if (!indice.has(clave)) {
        indice.set(clave, urlNormalizada);
      }
    }
  });

  return indice;
}

function pickField(source: any, keys: string[], fallback: any = null) {
  if (!source) {
    return fallback;
  }

  const tried = new Set<string>();

  for (const key of keys) {
    const baseVariants = [key, lowerFirst(key), key.toLowerCase(), toSnakeCase(key)];
    const variations = new Set<string>();

    baseVariants.forEach((variant) => {
      if (variant) {
        variations.add(variant);
        variations.add(capitalize(variant));
      }
    });

    for (const variant of variations) {
      if (!variant || tried.has(variant)) {
        continue;
      }

      tried.add(variant);

      const value = source[variant];
      if (value !== undefined && value !== null && value !== '') {
        return value;
      }
    }
  }

  return fallback;
}

function construirGaleriaImagenes(valorDirecto: unknown, colecciones: unknown[]): string[] {
  const galerias: string[] = [];

  const directa = normalizarUrlImagen(valorDirecto);
  if (directa) {
    galerias.push(directa);
  }

  colecciones.forEach((coleccion) => {
    if (!Array.isArray(coleccion)) {
      return;
    }
    coleccion.forEach((entrada) => {
      const url = normalizarUrlImagen(
        pickField(entrada, ['UrlImagen', 'urlImagen', 'Imagen', 'imagen', 'Url', 'url', 'Foto', 'foto'], null) ?? entrada
      );
      if (url && !galerias.includes(url)) {
        galerias.push(url);
      }
    });
  });

  return galerias;
}

function extraerColeccionesImagenes(raw: any): unknown[] {
  if (!raw || typeof raw !== 'object') {
    return [];
  }

  const posiblesClaves = ['Imagenes', 'imagenes', 'ImagenesFinca', 'imagenesFinca', 'Fotos', 'fotos'];
  const colecciones: unknown[] = [];

  posiblesClaves.forEach((clave) => {
    const variaciones = [clave, lowerFirst(clave), toSnakeCase(clave)];
    variaciones.forEach((variante) => {
      const valor = (raw as Record<string, unknown>)[variante];
      if (Array.isArray(valor)) {
        colecciones.push(valor);
      }
    });
  });

  return colecciones;
}

function normalizarUrlImagen(valor: unknown): string | null {
  if (typeof valor === 'string') {
    const limpia = valor.trim();
    return limpia.length ? limpia : null;
  }
  return null;
}

function parseNumber(value: any): number | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9.,-]/g, '').replace(',', '.');
    const parsed = parseFloat(cleaned);
    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
}

function lowerFirst(text: string) {
  if (!text) {
    return text;
  }
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function toSnakeCase(text: string) {
  if (!text) {
    return text;
  }

  return text
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[-\s]+/g, '_')
    .toLowerCase();
}

function capitalize(text: string) {
  if (!text) {
    return text;
  }

  return text.charAt(0).toUpperCase() + text.slice(1);
}

@Injectable({
  providedIn: 'root'
})
export class FincaSeleccionadaService {
  private readonly selectedFinca$ = new BehaviorSubject<FincaDetalle | null>(null);

  setFinca(finca: FincaDetalle | null) {
    this.selectedFinca$.next(finca);
  }

  getFinca(): Observable<FincaDetalle | null> {
    return this.selectedFinca$.asObservable();
  }

  getSnapshot(): FincaDetalle | null {
    return this.selectedFinca$.value;
  }
}
