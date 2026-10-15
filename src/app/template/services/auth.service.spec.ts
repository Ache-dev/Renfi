import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;
  const api = `${environment.apiUrl}/usuario`;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('iniciarSesion envía el correo en minúsculas y devuelve token y usuario normalizado', () => {
    let res: any;
    service.iniciarSesion({ correo: '  Juan@Mail.com ', contrasena: 'clave123' }).subscribe((r) => (res = r));
    const req = http.expectOne(`${api}/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.Correo).toBe('juan@mail.com');
    expect(req.request.body.Contrasena).toBe('clave123');
    req.flush({ token: 'jwt-1', usuario: { NumeroDocumento: 2, NombreUsuario: 'Juan', IdRol: 2, NombreRol: 'Cliente', Correo: 'juan@mail.com' } });
    expect(res.token).toBe('jwt-1');
    expect(res.usuario.NumeroDocumento).toBe(2);
    expect(res.usuario.NombreUsuario).toBe('Juan');
  });

  it('credenciales inválidas (401) se propagan tal cual', () => {
    let err: any;
    service.iniciarSesion({ correo: 'a@b.com', contrasena: 'x' }).subscribe({ error: (e) => (err = e) });
    http.expectOne(`${api}/login`).flush({ message: 'Credenciales inválidas.' }, { status: 401, statusText: 'Unauthorized' });
    expect(err.status).toBe(401);
    expect(err.error.message).toBe('Credenciales inválidas.');
  });

  it('un error del servidor NO activa un login de respaldo que lea la lista de usuarios', () => {
    let err: any;
    let res: any;
    service.iniciarSesion({ correo: 'a@b.com', contrasena: 'x' }).subscribe({ next: (r) => (res = r), error: (e) => (err = e) });
    http.expectOne(`${api}/login`).flush({ message: 'Error interno' }, { status: 500, statusText: 'Server Error' });
    http.expectNone(api); // no hay GET /usuario
    expect(res).toBeUndefined();
    expect(err.status).toBe(500);
  });

  it('un 404 tampoco activa el respaldo', () => {
    let err: any;
    service.iniciarSesion({ correo: 'a@b.com', contrasena: 'x' }).subscribe({ error: (e) => (err = e) });
    http.expectOne(`${api}/login`).flush({}, { status: 404, statusText: 'Not Found' });
    http.expectNone(api);
    expect(err.status).toBe(404);
  });
});
