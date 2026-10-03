import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { PasarelaPagoUsuario } from './pasarela-pago-usuario';
import { ReservaCheckoutService } from '../../template/services/reserva-checkout.service';
import { ReservaService } from '../../template/services/reserva.service';
import { AuthStateService } from '../../template/services/auth-state.service';
import { UsuarioService } from '../../core/services/usuario.service';

describe('PasarelaPagoUsuario', () => {
  let component: PasarelaPagoUsuario;
  let fixture: ComponentFixture<PasarelaPagoUsuario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [PasarelaPagoUsuario],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PasarelaPagoUsuario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('PasarelaPagoUsuario.confirmarPago', () => {
  const draft: any = {
    fincaId: '3', fincaNombre: 'Finca X', fechaEntrada: '2030-01-10', fechaSalida: '2030-01-13',
    noches: 3, huespedes: 2, montoTotal: 900000, precioNoche: 300000, usuarioDocumento: '1001'
  };
  let component: PasarelaPagoUsuario;
  let checkout: jasmine.SpyObj<ReservaCheckoutService>;
  let reservas: jasmine.SpyObj<ReservaService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    checkout = jasmine.createSpyObj('ReservaCheckoutService', ['getDraft', 'setResult', 'clearDraft']);
    checkout.getDraft.and.returnValue(draft);
    reservas = jasmine.createSpyObj('ReservaService', ['obtenerMetodosPago', 'crearReservaConPago']);
    reservas.obtenerMetodosPago.and.returnValue(of([{ id: '3', nombre: 'Tarjeta de Crédito', permiteMixto: false }]));
    router = jasmine.createSpyObj('Router', ['navigate']);
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [PasarelaPagoUsuario],
      providers: [
        { provide: ReservaCheckoutService, useValue: checkout },
        { provide: ReservaService, useValue: reservas },
        { provide: AuthStateService, useValue: { isAuthenticated: () => true, getSnapshot: () => ({ Correo: 'a@b.c', NumeroDocumento: 1001 }) } },
        { provide: UsuarioService, useValue: {} },
        { provide: Router, useValue: router }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
    const fixture = TestBed.createComponent(PasarelaPagoUsuario);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.pagoForm.patchValue({ aceptaTerminos: true });
  });

  it('exito: setResult, limpia borrador y navega al comprobante', () => {
    const reserva: any = { id: '7', fincaId: '3', fincaNombre: 'Finca X', fechaEntrada: 'a', fechaSalida: 'b' };
    reservas.crearReservaConPago.and.returnValue(of({
      reserva,
      factura: { id: '11', total: 900000, fechaFactura: 'x' },
      pago: { id: '5', metodoNombre: 'Tarjeta de Crédito', monto: 900000, fechaPago: 'x', referencia: 'PAGO-5', estado: 'Pagado' }
    }));
    component.confirmarPago();
    const arg = reservas.crearReservaConPago.calls.mostRecent().args[0];
    expect(arg.pago.metodoId).toBe('3');
    expect(arg.pago.monto).toBe(900000);
    expect(checkout.setResult).toHaveBeenCalled();
    expect(checkout.setResult.calls.mostRecent().args[0].pago.metodoNombre).toBe('Tarjeta de Crédito');
    expect(checkout.clearDraft).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/reserva/comprobante']);
    expect(component.procesando).toBeFalse();
  });

  it('error 409: muestra el mensaje de la API, conserva el formulario y procesando=false', () => {
    reservas.crearReservaConPago.and.returnValue(throwError(() => ({ error: { message: 'La finca ya está reservada en esas fechas' } })));
    component.confirmarPago();
    expect(component.error).toBe('La finca ya está reservada en esas fechas');
    expect(component.draft).not.toBeNull();
    expect(component.procesando).toBeFalse();
    expect(checkout.setResult).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
