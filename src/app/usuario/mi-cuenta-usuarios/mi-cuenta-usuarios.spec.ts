import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthStateService } from '../../template/services/auth-state.service';
import { MiCuentaUsuarios } from './mi-cuenta-usuarios';

describe('MiCuentaUsuarios', () => {
  let component: MiCuentaUsuarios;
  let fixture: ComponentFixture<MiCuentaUsuarios>;
  let http: HttpTestingController;
  const api = environment.apiUrl;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [MiCuentaUsuarios],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: AuthStateService,
          useValue: {
            currentUser$: new BehaviorSubject({ Correo: 'c@renfi.com', NumeroDocumento: 1001, NombreUsuario: 'C' }),
            recordarSesionActiva: () => false
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(MiCuentaUsuarios);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    http.expectOne(`${api}/reserva/usuario/1001`).flush([]);
    expect(component).toBeTruthy();
  });

  it('lista reservas mapeadas y cancela una con DELETE', () => {
    http.expectOne(`${api}/reserva/usuario/1001`).flush([
      { IdReserva: 1, IdFinca: 2, NombreFinca: 'La Palma', FechaEntrada: '2030-02-01T12:00:00.000Z', FechaSalida: '2030-02-03T12:00:00.000Z', Estado: 'Activa', FechaReserva: '2030-01-01T00:00:00.000Z' },
      { IdReserva: 2, IdFinca: 3, NombreFinca: 'El Roble', FechaEntrada: '2030-03-01T12:00:00.000Z', FechaSalida: '2030-03-02T12:00:00.000Z', Estado: 'Activa', FechaReserva: '2030-01-02T00:00:00.000Z' }
    ]);
    expect(component.reservas.map((r) => r.fincaNombre).sort()).toEqual(['El Roble', 'La Palma']);
    expect(component.reservas.find((r) => r.id === '1')!.noches).toBe(2);

    component.cancelarReserva(component.reservas.find((r) => r.id === '1')!);
    component.confirmarCancelacion();
    http.expectOne(`${api}/reserva/1`).flush({ message: 'ok' });
    expect(component.reservas.map((r) => r.id)).toEqual(['2']);
  });

  it('un error de la API muestra su mensaje', () => {
    http.expectOne(`${api}/reserva/usuario/1001`).flush({ message: 'Servicio caído' }, { status: 500, statusText: 'Error' });
    expect(component.errorReservas).toBe('Servicio caído');
    expect(component.reservas.length).toBe(0);
  });
});
