import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Finca, FincaApiRaw } from '../models/finca.model';
import { ImagenService } from './imagen.service';
import { PLACEHOLDER_FINCA } from '../../template/services/finca-seleccionada.service';

/**
 * Servicio para la gestión de Fincas en Renfi.
 * Aplica principios de Clean Code encapsulando las peticiones HTTP
 * y la normalización de entidades.
 */
@Injectable({ providedIn: 'root' })
export class FincaService {
  private readonly baseUrl = `${environment.apiUrl}/finca`;

  constructor(
    private readonly http: HttpClient,
    private readonly imagenService: ImagenService
  ) {}

  /**
   * Obtiene la lista completa de fincas.
   */
  getFincas(): Observable<Finca[]> {
    return this.http.get<FincaApiRaw[] | FincaApiRaw>(this.baseUrl).pipe(
      map((respuesta) => this.normalizarColeccion<FincaApiRaw>(respuesta)),
      map((lista) => lista.map((raw, index) => this.mapearFinca(raw, index))),
      catchError(() => of([]))
    );
  }

  /**
   * Obtiene una finca por su identificador.
   */
  getFincaById(id: string): Observable<Finca | null> {
    return this.http.get<FincaApiRaw>(`${this.baseUrl}/${encodeURIComponent(id)}`).pipe(
      map((raw) => this.mapearFinca(raw)),
      catchError(() =>
        // Fallback: buscar en la lista completa si el backend devuelve colección
        this.getFincas().pipe(
          map((fincas) => fincas.find((f) => f.id === id) ?? null)
        )
      )
    );
  }

  /**
   * Obtiene las fincas enriquecidas con sus imágenes desde la API multimedia.
   */
  getFincasConImagenes(): Observable<Finca[]> {
    return this.getFincas().pipe(
      switchMap((fincas) => {
        if (!fincas.length) {
          return of([]);
        }

        const consultas$ = fincas.map((finca) => {
          if (!finca.id || finca.id === 'sin-id') {
            return of(finca);
          }

          return this.imagenService.getImagenesPorFinca(finca.id).pipe(
            map((imagenes) => {
              if (imagenes.length > 0) {
                return {
                  ...finca,
                  imagenUrl: imagenes[0],
                  imagenesDisponibles: imagenes
                };
              }
              return finca;
            }),
            catchError(() => of(finca))
          );
        });

        return forkJoin(consultas$);
      })
    );
  }

  /**
   * Mapea un DTO de la API a la entidad limpia Finca.
   */
  mapearFinca(raw: FincaApiRaw, index = 0): Finca {
    const id = this.pickField(
      raw,
      ['Id', 'id', 'IdFinca', 'FincaId', 'fincaId', 'ID', 'Codigo', 'codigo'],
      `${index}`
    )?.toString() ?? `${index}`;

    const nombre = this.pickField(
      raw,
      ['NombreFinca', 'nombreFinca', 'Nombre', 'nombre', 'Titulo', 'titulo'],
      'Sin nombre'
    );
    const descripcion = this.pickField(
      raw,
      ['Descripcion', 'descripcion', 'DescripcionFinca', 'descripcionFinca', 'Detalle', 'detalle', 'DetalleFinca', 'detalleFinca'],
      'Descripción no disponible'
    );
    const ubicacion = this.pickField(
      raw,
      ['Ubicacion', 'ubicacion', 'UbicacionFinca', 'ubicacionFinca', 'Direccion', 'direccion', 'Ciudad', 'ciudad', 'Municipio', 'municipio', 'NombreMunicipio'],
      'Ubicación no disponible'
    );

    const precioRaw = this.pickField(raw, ['PrecioNoche', 'precioNoche', 'Precio', 'precio', 'ValorNoche', 'valorNoche', 'CostoNoche', 'costoNoche']);
    const capacidadRaw = this.pickField(raw, ['Capacidad', 'capacidad', 'NumeroHuespedes', 'numeroHuespedes', 'CapacidadMaxima', 'capacidadMaxima']);
    const habitacionesRaw = this.pickField(raw, ['Habitaciones', 'habitaciones', 'NumeroHabitaciones', 'numeroHabitaciones', 'HabitacionesDisponibles']);
    const banosRaw = this.pickField(raw, ['Banos', 'banos', 'Baños', 'baños', 'NumeroBanos', 'numeroBanos']);
    const telefono = this.pickField(raw, ['Telefono', 'telefono', 'Contacto', 'contacto', 'NumeroContacto']);
    const email = this.pickField(raw, ['Email', 'email', 'Correo', 'correo', 'CorreoElectronico']);
    const serviciosRaw = this.pickField(raw, ['Servicios', 'servicios', 'Amenidades', 'amenidades', 'Caracteristicas']);
    const reservasRaw = this.pickField(raw, ['Reservas', 'reservas', 'NumeroReservas', 'numeroReservas'], 0);

    const imagenEncontrada = this.pickField(
      raw,
      ['Imagen', 'imagen', 'ImagenUrl', 'imagenUrl', 'UrlImagen', 'urlImagen', 'Url', 'url', 'Foto', 'foto'],
      null
    );

    const imagenUrl = imagenEncontrada ? String(imagenEncontrada) : PLACEHOLDER_FINCA;

    return {
      ...(raw as Record<string, unknown>),
      id,
      nombre: String(nombre),
      descripcion: String(descripcion),
      ubicacion: String(ubicacion),
      precioNoche: this.parseNumber(precioRaw),
      capacidad: this.parseNumber(capacidadRaw),
      habitaciones: this.parseNumber(habitacionesRaw),
      banos: this.parseNumber(banosRaw),
      telefono: telefono ? String(telefono) : null,
      email: email ? String(email) : null,
      servicios: Array.isArray(serviciosRaw) ? serviciosRaw.join(', ') : serviciosRaw ? String(serviciosRaw) : null,
      reservas: this.parseNumber(reservasRaw) ?? 0,
      imagenUrl,
      imagenesDisponibles: [imagenUrl]
    };
  }

  private normalizarColeccion<T>(respuesta: unknown): T[] {
    if (Array.isArray(respuesta)) {
      return respuesta as T[];
    }
    if (respuesta && typeof respuesta === 'object') {
      const objeto = respuesta as Record<string, unknown>;
      const candidatas = ['fincas', 'data', 'items', 'rows', 'result'];
      for (const clave of candidatas) {
        if (Array.isArray(objeto[clave])) {
          return objeto[clave] as T[];
        }
      }
      return [respuesta as T];
    }
    return [];
  }

  private pickField(source: FincaApiRaw, keys: string[], fallback: unknown = null): unknown {
    if (!source || typeof source !== 'object') {
      return fallback;
    }
    const record = source as Record<string, unknown>;
    for (const key of keys) {
      if (record[key] !== undefined && record[key] !== null && record[key] !== '') {
        return record[key];
      }
    }
    return fallback;
  }

  private parseNumber(valor: unknown): number | null {
    if (typeof valor === 'number' && Number.isFinite(valor)) {
      return valor;
    }
    if (typeof valor === 'string') {
      const limpio = valor.replace(/[^0-9.,-]/g, '').replace(',', '.');
      const parseado = Number(limpio);
      return Number.isNaN(parseado) ? null : parseado;
    }
    return null;
  }
}
