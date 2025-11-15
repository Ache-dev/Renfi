import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

export interface MetodoPago {
  id: string;
  nombre: string;
  permiteMixto: boolean;
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

export interface CrearFacturaPayload {
  reservaId?: string | number | null;
  total: number;
  fechaFactura?: string | null;
  estadoReserva?: string | null;
  nombreFinca?: string | null;
  municipio?: string | null;
  precioNoche?: number | null;
}

export interface CrearReservaConPagoPayload {
  reserva: CrearReservaPayload;
  pago: CrearPagoPayload;
  factura?: CrearFacturaPayload | null;
}

export interface ReservaConPagoResultado {
  reserva: Reserva;
  pago: Pago;
  factura?: Factura | null;
}

@Injectable({ providedIn: 'root' })
export class ReservaService {
  private readonly baseUrl = 'http://localhost:3000/api';

  constructor(private readonly http: HttpClient) {}

  obtenerMetodosPago(): Observable<MetodoPago[]> {
    return this.http.get<any>(`${this.baseUrl}/metododepago`).pipe(
      map((respuesta) => this.normalizarColeccion(respuesta).map((item) => this.mapearMetodoPago(item))),
      catchError((error: HttpErrorResponse) => {

        return of([]);
      })
    );
  }

  listarReservas(filtros?: ListaReservasFiltro): Observable<Reserva[]> {

    const params = this.buildParams(filtros);
    
    return this.http
      .get<any>(`${this.baseUrl}/reserva`, params ? { params } : {})
      .pipe(
        map((respuesta) => {

          try {
            const coleccion = this.normalizarColeccion(respuesta);

            const reservasMapeadas = coleccion.map((item, index) => {
              try {
                const reserva = this.mapearReserva(item);

                return reserva;
              } catch (errorMapeo) {

                return null;
              }
            }).filter((r): r is Reserva => r !== null);

            return reservasMapeadas;
          } catch (error) {

            return [];
          }
        }),
        map((reservas) => {
          const reservasFiltradas = this.aplicarFiltrosLocales(reservas, filtros);

          return reservasFiltradas;
        }),
        catchError((error: HttpErrorResponse) => {

          return of([]);
        })
      );
  }

  obtenerReservasPorUsuario(
    correo?: string | null,
    documento?: string | number | null,
    idUsuario?: number | null
  ): Observable<Reserva[]> {

    if (documento) {
      return this.http
        .get<any>(`${this.baseUrl}/reserva/usuario/${documento}`)
        .pipe(
          map((respuesta) => {
            const coleccion = this.normalizarColeccion(respuesta);
            const reservasMapeadas = coleccion.map((item) => this.mapearReserva(item))
              .filter((r): r is Reserva => r !== null);
            return reservasMapeadas.sort((a, b) => {
              const fechaA = new Date(a.fechaReserva || a.creadoEn || 0).getTime();
              const fechaB = new Date(b.fechaReserva || b.creadoEn || 0).getTime();
              return fechaB - fechaA;
            });
          }),
          catchError(() => {
            return of([]);
          })
        );
    }

    const filtros: ListaReservasFiltro = {};
    
    if (correo) {
      filtros.correo = correo;
    }
    if (idUsuario) {
      filtros.idUsuario = idUsuario;
    }

    if (Object.keys(filtros).length === 0) {
      return of([]);
    }
    
    return this.listarReservas(filtros).pipe(
      map((reservas) => {

        return reservas.sort((a, b) => {
          const fechaA = new Date(a.fechaReserva || a.creadoEn || 0).getTime();
          const fechaB = new Date(b.fechaReserva || b.creadoEn || 0).getTime();
          return fechaB - fechaA;
        });
      }),
      catchError(() => {
        return of([]);
      })
    );
  }

  obtenerFechasOcupadas(fincaId: string | number): Observable<string[]> {
    return new Observable<string[]>(observer => {
      try {
        if (!fincaId || 
            fincaId === '' || 
            fincaId === 'undefined' || 
            fincaId === 'null' ||
            fincaId === null ||
            fincaId === undefined) {

          observer.next([]);
          observer.complete();
          return;
        }

        const timeoutId = setTimeout(() => {

          observer.next([]);
          observer.complete();
        }, 10000);
        
        this.listarReservas({ fincaId }).subscribe({
          next: (reservas) => {
            clearTimeout(timeoutId);
            
            try {

              if (!reservas || !Array.isArray(reservas) || reservas.length === 0) {

                observer.next([]);
                observer.complete();
                return;
              }
              
              const fechas = new Set<string>();
              
              for (const reserva of reservas) {
                if (!reserva) continue;
                
                try {
                  if (!reserva.fechaEntrada || !reserva.fechaSalida) continue;
                  
                  const rangoFechas = this.expandirRangoFechas(reserva);
                  if (!rangoFechas || rangoFechas.length === 0) continue;
                  
                  rangoFechas.forEach((fecha) => {
                    if (fecha && typeof fecha === 'string') {
                      fechas.add(fecha);
                    }
                  });
                } catch (error) {

                }
              }
              
              const fechasArray = Array.from(fechas).sort();

              observer.next(fechasArray);
              observer.complete();
            } catch (error) {

              observer.next([]);
              observer.complete();
            }
          },
          error: (error: HttpErrorResponse) => {
            clearTimeout(timeoutId);

            observer.next([]);
            observer.complete();
          },
          complete: () => {
            clearTimeout(timeoutId);
          }
        });
      } catch (error) {

        observer.next([]);
        observer.complete();
      }
    });
  }

  crearReserva(payload: CrearReservaPayload): Observable<Reserva> {
    const fechaEntradaISO = this.convertirFechaAISO(payload.fechaEntrada);
    const fechaSalidaISO = this.convertirFechaAISO(payload.fechaSalida);
    
    const entrada = new Date(fechaEntradaISO);
    const salida = new Date(fechaSalidaISO);
    
    if (salida <= entrada) {

      return throwError(() => new Error('La fecha de salida debe ser posterior a la fecha de entrada'));
    }

    const apiPayload = this.compactPayload({
      IdFinca: this.tryParseNumber(payload.fincaId),
      NumeroDocumentoUsuario: payload.usuarioDocumento ? this.tryParseNumber(payload.usuarioDocumento) : null,
      FechaReserva: new Date().toISOString(),
      FechaEntrada: fechaEntradaISO,
      FechaSalida: fechaSalidaISO,
      MontoReserva: payload.montoReserva,
      Estado: 'Activa'
    });

    return this.http.post<any>(`${this.baseUrl}/reserva`, apiPayload).pipe(
      map((respuesta) => {
        const idReserva = this.extraerIdDeRespuesta(respuesta, ['IdReserva', 'idReserva', 'Id', 'id']);

        if (!idReserva || idReserva <= 0) {
          throw new Error('El backend no devolvió un IdReserva válido. Verifica SP_RegistrarReserva.');
        }

        const reserva: Reserva = {
          id: String(idReserva),
          fincaId: String(payload.fincaId),
          fincaNombre: payload.fincaNombre ?? null,
          municipio: payload.municipio ?? null,
          fechaReserva: new Date().toISOString(),
          fechaEntrada: payload.fechaEntrada,
          fechaSalida: payload.fechaSalida,
          noches: payload.noches,
          huespedes: payload.huespedes,
          montoReserva: payload.montoReserva,
          estado: 'Activa',
          usuarioCorreo: payload.usuarioCorreo ?? null,
          usuarioNombre: payload.usuarioNombre ?? null,
          usuarioDocumento: payload.usuarioDocumento ? String(payload.usuarioDocumento) : null,
          idUsuario: payload.idUsuario ?? null,
          precioNoche: payload.precioNoche ?? null,
          creadoEn: new Date().toISOString(),
          pago: null,
          factura: null,
          meta: respuesta
        };

        return reserva;
      }),
      catchError((error: HttpErrorResponse) => {

        return throwError(() => new Error(`Error al crear reserva: ${error.error?.message || error.message}`));
      })
    );
  }

  crearReservaConPago(payload: CrearReservaConPagoPayload): Observable<ReservaConPagoResultado> {

    return this.crearReserva(payload.reserva).pipe(
      switchMap((reserva) => {
        const idReservaNumerico = this.tryParseNumber(reserva.id);

        if (!idReservaNumerico || idReservaNumerico <= 0) {
          return throwError(() => new Error(`ID de reserva inválido: ${reserva.id}`));
        }

        const facturaPayload = {
          IdReserva: idReservaNumerico,
          Total: payload.pago.monto,
          FechaFactura: new Date().toISOString()
        };

        return this.http.post<any>(`${this.baseUrl}/factura`, this.compactPayload(facturaPayload)).pipe(
          switchMap((respuestaFactura) => {
            const idFactura = this.extraerIdDeRespuesta(respuestaFactura, ['IdFactura', 'idFactura', 'Id', 'id']);

            if (!idFactura || idFactura <= 0) {

              return throwError(() => new Error('El backend no devolvió un IdFactura válido. Verifica SP_RegistrarFactura.'));
            }

            const factura: Factura = {
              id: String(idFactura),
              reservaId: String(idReservaNumerico),
              total: payload.pago.monto,
              fechaFactura: facturaPayload.FechaFactura,
              meta: respuestaFactura
            };

            const metodoIdNumerico = this.tryParseNumber(payload.pago.metodoId);

            if (!metodoIdNumerico || metodoIdNumerico <= 0) {
              return throwError(() => new Error(`ID de método de pago inválido: ${payload.pago.metodoId}`));
            }

            const pagoPayload = {
              IdFactura: idFactura,
              IdMetodoDePago: metodoIdNumerico,
              Monto: Math.round(payload.pago.monto),
              FechaPago: new Date().toISOString(),
              EstadoPago: 'Pagado'
            };

            return this.http.post<any>(`${this.baseUrl}/pago`, this.compactPayload(pagoPayload)).pipe(
              map((respuestaPago) => {
                const idPago = this.extraerIdDeRespuesta(respuestaPago, ['IdPago', 'idPago', 'Id', 'id']);

                const pago: Pago = {
                  id: idPago ? String(idPago) : undefined,
                  reservaId: String(idReservaNumerico),
                  metodoId: String(metodoIdNumerico),
                  metodoNombre: payload.pago.metodoNombre,
                  monto: payload.pago.monto,
                  fechaPago: pagoPayload.FechaPago,
                  estado: 'Pagado',
                  meta: respuestaPago
                };

                return { reserva, factura, pago } satisfies ReservaConPagoResultado;
              }),
              catchError((errorPago) => {

                return this.cancelarReserva(idReservaNumerico).pipe(
                  switchMap(() => throwError(() => new Error(`Error al registrar el pago: ${errorPago.error?.message || errorPago.message}`)))
                );
              })
            );
          }),
          catchError((errorFactura) => {

            return this.cancelarReserva(idReservaNumerico).pipe(
              switchMap(() => throwError(() => new Error(`Error al crear la factura: ${errorFactura.error?.message || errorFactura.message}`)))
            );
          })
        );
      }),
      catchError((errorReserva) => {

        return throwError(() => new Error(`Error al crear la reserva: ${errorReserva.error?.message || errorReserva.message}`));
      })
    );
  }

  cancelarReserva(reservaId: string | number): Observable<boolean> {
    if (!reservaId) {
      return of(false);
    }

    const id = encodeURIComponent(String(reservaId));


    return this.http.delete<any>(`${this.baseUrl}/reserva/${id}`).pipe(
      map((respuesta) => {
        return true;
      }),
      catchError((error: HttpErrorResponse) => {
        return of(false);
      })
    );
  }

  private extraerIdDeRespuesta(respuesta: any, keys: string[]): number | null {

    let id = this.pickNumber(respuesta, keys);
    if (id !== null && id > 0) {

      return id;
    }

    const nested = respuesta?.data ?? respuesta?.resultado ?? respuesta?.result;
    if (nested) {
      id = this.pickNumber(nested, keys);
      if (id !== null && id > 0) {

        return id;
      }
    }

    if (respuesta?.recordset && Array.isArray(respuesta.recordset) && respuesta.recordset.length > 0) {
      id = this.pickNumber(respuesta.recordset[0], keys);
      if (id !== null && id > 0) {

        return id;
      }
    }

    if (respuesta?.recordsets && Array.isArray(respuesta.recordsets) && respuesta.recordsets.length > 0) {
      const firstRecordset = respuesta.recordsets[0];
      if (Array.isArray(firstRecordset) && firstRecordset.length > 0) {
        id = this.pickNumber(firstRecordset[0], keys);
        if (id !== null && id > 0) {

          return id;
        }
      }
    }

    if (Array.isArray(respuesta) && respuesta.length > 0) {
      id = this.pickNumber(respuesta[0], keys);
      if (id !== null && id > 0) {

        return id;
      }
    }

    return null;
  }

  private buildParams(filtros?: ListaReservasFiltro): HttpParams | undefined {
    if (!filtros || Object.keys(filtros).length === 0) {
      return undefined;
    }

    let params = new HttpParams();

    const append = (key: string, valor: string | number | null | undefined) => {
      if (valor !== undefined && valor !== null && valor !== '') {
        const valorStr = String(valor).trim();
        if (valorStr) {
          params = params.append(key, valorStr);
        }
      }
    };

    append('Correo', filtros.correo ?? null);
    append('NumeroDocumento', filtros.documento ?? null);
    append('IdUsuario', filtros.idUsuario ?? null);
    append('IdFinca', filtros.fincaId ?? null);

    const hasParams = params.keys().length > 0;
    
    return hasParams ? params : undefined;
  }

  private aplicarFiltrosLocales(reservas: Reserva[], filtros?: ListaReservasFiltro): Reserva[] {
    if (!filtros || Object.keys(filtros).length === 0) {

      return reservas;
    }


    const reservasFiltradas = reservas.filter((reserva) => {
      let cumpleFiltros = true;

      if (filtros.correo) {
        const correoReserva = (reserva.usuarioCorreo ?? '').toLowerCase().trim();
        const correoFiltro = filtros.correo.toString().toLowerCase().trim();
        const coincideCorreo = correoReserva === correoFiltro || correoReserva.includes(correoFiltro);
        
        if (!coincideCorreo) {

          cumpleFiltros = false;
        } else {

        }
      }

      if (filtros.documento && cumpleFiltros) {
        const docReserva = (reserva.usuarioDocumento ?? reserva.idUsuario?.toString() ?? '').toLowerCase().trim();
        const docFiltro = filtros.documento.toString().toLowerCase().trim();
        const coincideDocumento = docReserva === docFiltro || docReserva.includes(docFiltro);
        
        if (!coincideDocumento) {

          cumpleFiltros = false;
        } else {

        }
      }

      if (filtros.idUsuario && cumpleFiltros) {
        const coincideUsuario = reserva.idUsuario !== undefined && 
                               reserva.idUsuario !== null && 
                               reserva.idUsuario === filtros.idUsuario;
        
        if (!coincideUsuario) {

          cumpleFiltros = false;
        } else {

        }
      }

      if (filtros.fincaId && cumpleFiltros) {
        const fincaIdStr = filtros.fincaId.toString();
        const fincaIdNum = this.tryParseNumber(filtros.fincaId);
        const coincideFinca = reserva.fincaId === fincaIdStr || 
                             this.tryParseNumber(reserva.fincaId) === fincaIdNum;
        
        if (!coincideFinca) {

          cumpleFiltros = false;
        } else {

        }
      }

      return cumpleFiltros;
    });

    return reservasFiltradas;
  }

  private normalizarColeccion<T>(entrada: T | T[] | null | undefined): T[] {
    if (!entrada) {
      return [];
    }
    return Array.isArray(entrada) ? entrada : [entrada];
  }

  private mapearReserva(raw: any): Reserva {
    if (!raw || typeof raw !== 'object') {

      const fallbackId = `res-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      return {
        id: fallbackId,
        fincaId: '',
        fincaNombre: null,
        fechaEntrada: this.formatearFecha(new Date()),
        fechaSalida: this.formatearFecha(new Date()),
        meta: null
      };
    }

    try {
      const idReserva =
        this.pickString(raw, ['IdReserva', 'idReserva', 'Id', 'id', 'ReservaId', 'reservaId']) ??
        this.pickNumber(raw, ['IdReserva', 'idReserva', 'Id', 'id', 'ReservaId', 'reservaId'])?.toString() ??
        `res-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const fincaId =
        this.pickString(raw, ['IdFinca', 'idFinca', 'FincaId', 'fincaId']) ??
        this.pickNumber(raw, ['IdFinca', 'idFinca', 'FincaId', 'fincaId'])?.toString() ??
        '';
      
      if (!fincaId) {

      }
      
      const fechaEntradaRaw = this.pickString(raw, ['FechaEntrada', 'fechaEntrada']);
      const fechaSalidaRaw = this.pickString(raw, ['FechaSalida', 'fechaSalida']);
      
      const fechaActual = new Date();
      const fechaEntrada = fechaEntradaRaw ? this.formatearFechaDesdeISO(fechaEntradaRaw) : this.formatearFecha(fechaActual);
      const fechaSalida = fechaSalidaRaw ? this.formatearFechaDesdeISO(fechaSalidaRaw) : fechaEntrada;
      
      if (!fechaEntrada || !fechaSalida) {

      }
      
      const reserva: Reserva = {
        id: idReserva,
        fincaId,
        fincaNombre: this.pickString(raw, ['NombreFinca', 'nombreFinca', 'Finca']) ?? null,
        municipio: this.pickString(raw, ['NombreMunicipio', 'Municipio', 'municipio']) ?? null,
        fechaReserva: this.pickString(raw, ['FechaReserva', 'fechaReserva', 'CreadoEn', 'creadoEn']) ?? null,
        fechaEntrada,
        fechaSalida,
        noches:
          this.pickNumber(raw, ['Noches', 'noches', 'CantidadNoches', 'cantidadNoches']) ??
          this.calcularNoches(fechaEntrada, fechaSalida) ?? 1,
        huespedes: this.pickNumber(raw, ['Huespedes', 'huespedes', 'NumeroPersonas']) ?? null,
        montoReserva: this.pickNumber(raw, ['MontoReserva', 'Monto', 'TotalReserva', 'Total', 'Valor']) ?? null,
        estado: this.pickString(raw, ['Estado', 'estado', 'EstadoReserva', 'estadoReserva']) ?? null,
        usuarioCorreo: this.pickString(raw, ['Correo', 'correo', 'CorreoUsuario']) ?? null,
        usuarioNombre: this.pickString(raw, ['NombreUsuario', 'nombreUsuario', 'Usuario']) ?? null,
        usuarioDocumento:
          this.pickString(raw, ['NumeroDocumento', 'numeroDocumento', 'Documento', 'documento']) ??
          this.pickNumber(raw, ['NumeroDocumento', 'numeroDocumento', 'IdUsuario', 'idUsuario'])?.toString() ??
          null,
        idUsuario: this.pickNumber(raw, ['IdUsuario', 'idUsuario', 'UsuarioId', 'usuarioId']) ?? null,
        precioNoche: this.pickNumber(raw, ['PrecioFinca', 'precioFinca', 'Precio', 'precio', 'ValorNoche']) ?? null,
        creadoEn: this.pickString(raw, ['CreadoEn', 'creadoEn', 'createdAt']) ?? null,
        pago: this.mapearPago(this.extraerPago(raw)),
        factura: this.mapearFactura(this.extraerFactura(raw)),
        meta: raw as Record<string, unknown>
      };

      return reserva;
    } catch (error) {

      const fallbackId = `res-error-${Date.now()}`;
      const fechaActual = new Date();
      return {
        id: fallbackId,
        fincaId: '',
        fincaNombre: null,
        fechaEntrada: this.formatearFecha(fechaActual),
        fechaSalida: this.formatearFecha(fechaActual),
        meta: raw as Record<string, unknown>
      };
    }
  }

  private extraerPago(raw: any): any {
    if (!raw || typeof raw !== 'object') {
      return null;
    }

    if (raw.Pago || raw.pago) {
      return raw.Pago ?? raw.pago;
    }

    if (Array.isArray(raw.Pagos) && raw.Pagos.length) {
      return raw.Pagos[0];
    }

    if (Array.isArray(raw.pagos) && raw.pagos.length) {
      return raw.pagos[0];
    }

    return null;
  }

  private extraerFactura(raw: any): any {
    if (!raw || typeof raw !== 'object') {
      return null;
    }

    if (raw.Factura || raw.factura) {
      return raw.Factura ?? raw.factura;
    }

    if (Array.isArray(raw.Facturas) && raw.Facturas.length) {
      return raw.Facturas[0];
    }

    if (Array.isArray(raw.facturas) && raw.facturas.length) {
      return raw.facturas[0];
    }

    return null;
  }

  private mapearPago(raw: any): Pago | null {
    if (!raw || typeof raw !== 'object') {
      return null;
    }

    return {
      id:
        this.pickString(raw, ['IdPago', 'idPago', 'Id', 'id']) ??
        this.pickNumber(raw, ['IdPago', 'idPago', 'Id', 'id'])?.toString() ??
        undefined,
      reservaId:
        this.pickString(raw, ['IdReserva', 'idReserva', 'ReservaId', 'reservaId']) ??
        this.pickNumber(raw, ['IdReserva', 'idReserva'])?.toString() ??
        undefined,
      metodoId:
        this.pickString(raw, ['IdMetodoDePago', 'idMetodoDePago']) ??
        this.pickNumber(raw, ['IdMetodoDePago', 'idMetodoDePago'])?.toString() ??
        null,
      metodoNombre: this.pickString(raw, ['NombreMetodoDePago', 'nombreMetodoDePago', 'Metodo', 'metodo']) ?? null,
      monto: this.pickNumber(raw, ['Monto', 'monto', 'Valor', 'valor', 'Total', 'total']) ?? null,
      fechaPago: this.pickString(raw, ['FechaPago', 'fechaPago']) ?? null,
      estado: this.pickString(raw, ['EstadoPago', 'estadoPago', 'Estado', 'estado']) ?? null,
      referencia: this.pickString(raw, ['Referencia', 'referencia', 'Codigo', 'codigo']) ?? null,
      pagoMixto: this.pickBoolean(raw, ['PagoMixto', 'pagoMixto']),
      meta: raw as Record<string, unknown>
    };
  }

  private mapearFactura(raw: any): Factura | null {
    if (!raw || typeof raw !== 'object') {
      return null;
    }

    return {
      id:
        this.pickString(raw, ['IdFactura', 'idFactura', 'Id', 'id']) ??
        this.pickNumber(raw, ['IdFactura', 'idFactura', 'Id', 'id'])?.toString() ??
        undefined,
      reservaId:
        this.pickString(raw, ['IdReserva', 'idReserva', 'ReservaId', 'reservaId']) ??
        this.pickNumber(raw, ['IdReserva', 'idReserva'])?.toString() ??
        undefined,
      total: this.pickNumber(raw, ['Total', 'total', 'TotalFactura', 'totalFactura']) ?? null,
      fechaFactura: this.pickString(raw, ['FechaFactura', 'fechaFactura', 'FechaEmision', 'fechaEmision']) ?? null,
      estadoReserva: this.pickString(raw, ['EstadoReserva', 'estadoReserva']) ?? null,
      nombreFinca: this.pickString(raw, ['NombreFinca', 'nombreFinca']) ?? null,
      municipio: this.pickString(raw, ['NombreMunicipio', 'Municipio', 'municipio']) ?? null,
      precioNoche: this.pickNumber(raw, ['PrecioFinca', 'precioFinca', 'Precio', 'precio']) ?? null,
      meta: raw as Record<string, unknown>
    };
  }

  private mapearMetodoPago(raw: any): MetodoPago {
    if (!raw || typeof raw !== 'object') {
      return {
        id: '',
        nombre: 'Método de pago',
        permiteMixto: false
      };
    }

    const id =
      this.pickString(raw, ['IdMetodoDePago', 'idMetodoDePago', 'Id', 'id']) ??
      this.pickNumber(raw, ['IdMetodoDePago', 'idMetodoDePago', 'Id', 'id'])?.toString() ??
      '';

    return {
      id,
      nombre: this.pickString(raw, ['NombreMetodoDePago', 'nombreMetodoDePago', 'Nombre', 'nombre']) ?? 'Método de pago',
      permiteMixto: this.pickBoolean(raw, ['PagoMixto', 'pagoMixto']) ?? false
    };
  }

  private expandirRangoFechas(reserva: Reserva | { fechaEntrada: string; fechaSalida: string; noches?: number | null }): string[] {
    try {
      if (!reserva) {

        return [];
      }
      
      if (!reserva.fechaEntrada || typeof reserva.fechaEntrada !== 'string') {

        return [];
      }
      
      const inicio = this.normalizarFecha(reserva.fechaEntrada);
      
      if (!inicio || !(inicio instanceof Date) || Number.isNaN(inicio.getTime())) {

        return [];
      }
      
      const salida = this.normalizarFecha(reserva.fechaSalida);
      
      let noches = reserva.noches;
      
      if (!noches || noches <= 0) {
        if (inicio && salida instanceof Date && !Number.isNaN(salida.getTime())) {
          noches = Math.max(1, Math.round((salida.getTime() - inicio.getTime()) / (24 * 60 * 60 * 1000)));
        } else {
          noches = 1;
        }
      }

      if (!noches || noches <= 0 || !Number.isFinite(noches)) {

        return [this.formatearFecha(inicio)];
      }

      const fechas: string[] = [];
      const maxNoches = Math.min(Math.floor(noches), 365);
      
      for (let i = 0; i < maxNoches; i++) {
        try {
          const fecha = new Date(inicio.getTime());
          fecha.setDate(fecha.getDate() + i);
          
          if (Number.isNaN(fecha.getTime())) {

            continue;
          }
          
          const fechaFormateada = this.formatearFecha(fecha);
          if (fechaFormateada && typeof fechaFormateada === 'string') {
            fechas.push(fechaFormateada);
          }
        } catch (errorFecha) {

        }
      }
      
      return fechas;
    } catch (error) {

      return [];
    }
  }

  private normalizarFecha(valor: string | null | undefined): Date | null {
    if (!valor || valor === '') {
      return null;
    }

    try {

      const fecha = new Date(valor);
      if (!Number.isNaN(fecha.getTime()) && fecha.getFullYear() > 1900) {
        fecha.setHours(0, 0, 0, 0);
        return fecha;
      }

      const fallback = new Date(`${valor}T00:00:00`);
      if (!Number.isNaN(fallback.getTime()) && fallback.getFullYear() > 1900) {
        fallback.setHours(0, 0, 0, 0);
        return fallback;
      }

      return null;
    } catch (error) {

      return null;
    }
  }

  private formatearFechaDesdeISO(fechaISO: string): string {
    if (!fechaISO || fechaISO === '') {

      return this.formatearFecha(new Date());
    }
    
    try {
      const fecha = new Date(fechaISO);
      if (Number.isNaN(fecha.getTime())) {

        return this.formatearFecha(new Date());
      }
      return this.formatearFecha(fecha);
    } catch (error) {

      return this.formatearFecha(new Date());
    }
  }

  private formatearFecha(fecha: Date | null | undefined): string {
    if (!fecha || !(fecha instanceof Date) || Number.isNaN(fecha.getTime())) {

      fecha = new Date();
    }
    
    try {
      const year = fecha.getFullYear();
      const month = `${fecha.getMonth() + 1}`.padStart(2, '0');
      const day = `${fecha.getDate()}`.padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {

      const now = new Date();
      return `${now.getFullYear()}-01-01`;
    }
  }

  private calcularNoches(inicio: string | null | undefined, salida: string | null | undefined): number | null {
    try {
      const fechaInicio = this.normalizarFecha(inicio ?? null);
      const fechaSalida = this.normalizarFecha(salida ?? null);

      if (!fechaInicio || !fechaSalida) {
        return null;
      }

      if (!(fechaInicio instanceof Date) || !(fechaSalida instanceof Date)) {
        return null;
      }

      if (Number.isNaN(fechaInicio.getTime()) || Number.isNaN(fechaSalida.getTime())) {
        return null;
      }

      const diff = fechaSalida.getTime() - fechaInicio.getTime();
      
      if (diff <= 0) {
        return 1;
      }

      const noches = Math.max(1, Math.round(diff / (24 * 60 * 60 * 1000)));
      
      return Number.isFinite(noches) ? noches : 1;
    } catch (error) {

      return null;
    }
  }

  private pickString(source: any, keys: string[]): string | null {
    const valor = this.pickValue(source, keys);
    if (valor === undefined || valor === null) {
      return null;
    }
    if (typeof valor === 'string') {
      return valor;
    }
    if (typeof valor === 'number' || typeof valor === 'boolean') {
      return String(valor);
    }
    return null;
  }

  private pickNumber(source: any, keys: string[]): number | null {
    const valor = this.pickValue(source, keys);
    if (valor === undefined || valor === null || valor === '') {
      return null;
    }
    if (typeof valor === 'number' && Number.isFinite(valor)) {
      return valor;
    }
    if (typeof valor === 'string') {
      const parsed = Number(valor.replace(/[^0-9.,-]/g, '').replace(',', '.'));
      return Number.isNaN(parsed) ? null : parsed;
    }
    return null;
  }

  private pickBoolean(source: any, keys: string[]): boolean | null {
    const valor = this.pickValue(source, keys);
    if (valor === undefined || valor === null || valor === '') {
      return null;
    }
    if (typeof valor === 'boolean') {
      return valor;
    }
    if (typeof valor === 'number') {
      return valor !== 0;
    }
    if (typeof valor === 'string') {
      const normalized = valor.trim().toLowerCase();
      if (['true', '1', 'si', 'sí', 'yes'].includes(normalized)) {
        return true;
      }
      if (['false', '0', 'no'].includes(normalized)) {
        return false;
      }
    }
    return null;
  }

  private pickValue(source: any, keys: string[]): any {
    if (!source || typeof source !== 'object') {
      return null;
    }

    for (const key of keys) {
      const variantes = [
        key,
        key.toLowerCase(),
        this.lowerFirst(key),
        this.toSnakeCase(key),
        key.toUpperCase()
      ];

      for (const variante of variantes) {
        if (variante in source && source[variante] !== undefined) {
          return source[variante];
        }
      }
    }

    return null;
  }

  private lowerFirst(text: string): string {
    if (!text) {
      return text;
    }
    return text.charAt(0).toLowerCase() + text.slice(1);
  }

  private toSnakeCase(text: string): string {
    if (!text) {
      return text;
    }
    return text
      .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
      .replace(/[-\s]+/g, '_')
      .toLowerCase();
  }

  private tryParseNumber(valor: string | number | null | undefined): number | null {
    if (valor === undefined || valor === null || valor === '') {
      return null;
    }
    if (typeof valor === 'number') {
      return Number.isFinite(valor) ? valor : null;
    }
    const parsed = Number(valor);
    return Number.isNaN(parsed) ? null : parsed;
  }

  private convertirFechaAISO(fecha: string | null | undefined): string {
    if (!fecha) {
      return new Date().toISOString();
    }

    if (fecha.includes('T') && fecha.includes('Z')) {
      return fecha;
    }


    if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return `${fecha}T12:00:00.000Z`;
    }

    const fechaObj = new Date(fecha);
    if (!Number.isNaN(fechaObj.getTime())) {

      fechaObj.setHours(12, 0, 0, 0);
      return fechaObj.toISOString();
    }

    return new Date().toISOString();
  }

  private compactPayload(payload: Record<string, unknown>): Record<string, unknown> {
    const limpio: Record<string, unknown> = {};
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        limpio[key] = value;
      }
    });
    return limpio;
  }
}
