import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { CrearReservaPayload, ReservaService } from './reserva.service';

describe('ReservaService', () => {
  let service: ReservaService;
  let http: HttpTestingController;
  const api = environment.apiUrl;

  const reserva: CrearReservaPayload = {
    fincaId: '3',
    fincaNombre: 'Finca X',
    fechaEntrada: '2030-01-10T12:00:00.000Z',
    fechaSalida: '2030-01-13T12:00:00.000Z',
    noches: 3,
    huespedes: 4,
    montoReserva: 900000,
    usuarioDocumento: '1001'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ReservaService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('crearReserva envía finca, documento, fechas y monto', () => {
    let res: any;
    service.crearReserva(reserva).subscribe((r) => (res = r));
    const req = http.expectOne(`${api}/reserva`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.IdFinca).toBe(3);
    expect(req.request.body.NumeroDocumentoUsuario).toBe(1001);
    expect(req.request.body.MontoReserva).toBe(900000);
    expect(req.request.body.FechaEntrada).toContain('2030-01-10');
    expect(req.request.body.FechaSalida).toContain('2030-01-13');
    req.flush({ IdReserva: 7, IdFactura: 11 });
    expect(res.id).toBe('7');
    expect(res.huespedes).toBe(4);
  });

  it('crearReservaConPago hace reserva -> pago con el IdFactura devuelto y nunca POST /factura', () => {
    let res: any;
    service
      .crearReservaConPago({ reserva, pago: { monto: 900000, metodoId: '3', metodoNombre: 'Tarjeta de Crédito' } })
      .subscribe((r) => (res = r));

    http.expectOne(`${api}/reserva`).flush({ IdReserva: 7, IdFactura: 11 });
    const pago = http.expectOne(`${api}/pago`);
    expect(pago.request.body).toEqual(
      jasmine.objectContaining({ IdFactura: 11, IdMetodoDePago: 3, Monto: 900000 })
    );
    pago.flush({ IdPago: 5 });
    http.expectNone(`${api}/factura`);

    expect(res.reserva.id).toBe('7');
    expect(res.factura.id).toBe('11');
    expect(res.pago.metodoNombre).toBe('Tarjeta de Crédito');
    expect(res.pago.estado).toBe('Pagado');
  });

  it('propaga el mensaje de la API si falla la reserva', () => {
    let err: any;
    service
      .crearReservaConPago({ reserva, pago: { monto: 1, metodoId: 1, metodoNombre: 'x' } })
      .subscribe({ error: (e) => (err = e) });
    http.expectOne(`${api}/reserva`).flush({ message: 'Fechas no disponibles' }, { status: 409, statusText: 'Conflict' });
    expect(err.message).toBe('Fechas no disponibles');
    http.expectNone(`${api}/pago`);
  });

  it('si el pago falla cancela la reserva y propaga el mensaje', () => {
    let err: any;
    service
      .crearReservaConPago({ reserva, pago: { monto: 1, metodoId: 1, metodoNombre: 'x' } })
      .subscribe({ error: (e) => (err = e) });
    http.expectOne(`${api}/reserva`).flush({ IdReserva: 7, IdFactura: 11 });
    http.expectOne(`${api}/pago`).flush({ message: 'Pago rechazado' }, { status: 400, statusText: 'Bad Request' });
    // un cliente no puede borrar reservas (solo el administrador): se cancela con PUT de estado
    const cancelacion = http.expectOne(`${api}/reserva/7`);
    expect(cancelacion.request.method).toBe('PUT');
    expect(cancelacion.request.body).toEqual({ Estado: 'Cancelada' });
    cancelacion.flush({});
    expect(err.message).toBe('Pago rechazado');
  });

  it('cancelarReserva usa PUT con estado Cancelada y nunca DELETE', () => {
    let ok: boolean | undefined;
    service.cancelarReserva(12).subscribe((r) => (ok = r));
    const req = http.expectOne(`${api}/reserva/12`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ Estado: 'Cancelada' });
    req.flush({});
    expect(ok).toBeTrue();
  });

  it('cancelarReserva devuelve false si la API la rechaza (reserva ajena)', () => {
    let ok: boolean | undefined;
    service.cancelarReserva(12).subscribe((r) => (ok = r));
    http.expectOne(`${api}/reserva/12`).flush({ message: 'No tienes permisos' }, { status: 403, statusText: 'Forbidden' });
    expect(ok).toBeFalse();
  });

  it('obtenerReservasPorUsuario usa /reserva/usuario/:doc y mapea campos', () => {
    let res: any[] = [];
    service.obtenerReservasPorUsuario(null, 1001).subscribe((r) => (res = r));
    http.expectOne(`${api}/reserva/usuario/1001`).flush([
      { IdReserva: 9, IdFinca: 2, NombreFinca: 'La Palma', FechaEntrada: '2030-02-01T12:00:00.000Z', FechaSalida: '2030-02-04T12:00:00.000Z', MontoReserva: 300, Estado: 'Activa' }
    ]);
    expect(res.length).toBe(1);
    expect(res[0].id).toBe('9');
    expect(res[0].fincaNombre).toBe('La Palma');
    expect(res[0].noches).toBe(3);
  });

  it('obtenerReservasPorUsuario propaga el error de la API', () => {
    let err: any;
    service.obtenerReservasPorUsuario(null, 1001).subscribe({ error: (e) => (err = e) });
    http.expectOne(`${api}/reserva/usuario/1001`).flush({ message: 'Número de documento inválido' }, { status: 400, statusText: 'Bad Request' });
    expect(err.error.message).toBe('Número de documento inválido');
  });

  it('obtenerFechasOcupadas usa el endpoint público de fechas ocupadas (sin listar reservas)', () => {
    let fechas: string[] = [];
    service.obtenerFechasOcupadas(2).subscribe((f) => (fechas = f));
    const req = http.expectOne(`${api}/reserva/finca/2/ocupadas`);
    expect(req.request.method).toBe('GET');
    // la API solo devuelve fechas de reservas activas, sin datos personales
    req.flush([
      { IdFinca: 2, FechaEntrada: '2030-03-10T00:00:00', FechaSalida: '2030-03-12T00:00:00' },
      { IdFinca: 2, FechaEntrada: '2030-03-20T00:00:00', FechaSalida: '2030-03-21T00:00:00' }
    ]);
    expect(fechas).toEqual(['2030-03-10', '2030-03-11', '2030-03-20']);
  });

  it('obtenerFechasOcupadas devuelve [] si la API falla o no hay finca', () => {
    let fechas: string[] | undefined;
    service.obtenerFechasOcupadas(2).subscribe((f) => (fechas = f));
    http.expectOne(`${api}/reserva/finca/2/ocupadas`).flush({}, { status: 500, statusText: 'Error' });
    expect(fechas).toEqual([]);

    let sinFinca: string[] | undefined;
    service.obtenerFechasOcupadas('').subscribe((f) => (sinFinca = f));
    expect(sinFinca).toEqual([]);
  });
});
