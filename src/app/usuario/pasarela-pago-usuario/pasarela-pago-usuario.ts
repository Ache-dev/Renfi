import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { finalize, switchMap, takeUntil } from 'rxjs/operators';
import { ReservaCheckoutDraft, ReservaCheckoutService } from '../../template/services/reserva-checkout.service';
import { ReservaService } from '../../template/services/reserva.service';
import { AuthStateService } from '../../template/services/auth-state.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-pasarela-pago-usuario',
  standalone: false,
  templateUrl: './pasarela-pago-usuario.html',
  styleUrl: './pasarela-pago-usuario.css'
})
export class PasarelaPagoUsuario implements OnInit, OnDestroy {
  draft: ReservaCheckoutDraft | null = null;
  pagoForm: FormGroup;
  procesando = false;
  error: string | null = null;
  exito = false;

  private readonly destroy$ = new Subject<void>();

  metodosPago = [
    { id: 1, nombre: 'Tarjeta de Crédito' },
    { id: 2, nombre: 'Tarjeta de Débito' },
    { id: 3, nombre: 'Transferencia Bancaria' },
    { id: 4, nombre: 'PSE' },
    { id: 5, nombre: 'Efectivo' }
  ];

  constructor(
    private readonly checkoutService: ReservaCheckoutService,
    private readonly reservaService: ReservaService,
    private readonly authState: AuthStateService,
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly http: HttpClient
  ) {
    this.pagoForm = this.fb.group({
      metodoPago: ['1', [Validators.required]],
      aceptaTerminos: [false, [Validators.requiredTrue]]
    });
  }

  ngOnInit(): void {
    this.draft = this.checkoutService.getDraft();

    if (!this.draft) {
      this.error = 'No hay información de reserva disponible. Por favor, inicia el proceso desde la página de la finca.';
      return;
    }

    const usuario = this.authState.getSnapshot();

    if (!this.authState.isAuthenticated()) {
      this.error = 'Debes iniciar sesión para completar la reserva.';
      setTimeout(() => {
        this.router.navigate(['/iniciar-sesion']);
      }, 2000);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  confirmarPago(): void {
    if (this.pagoForm.invalid || !this.draft) {
      this.pagoForm.markAllAsTouched();
      return;
    }

    const usuario = this.authState.getSnapshot();
    if (!usuario) {
      this.error = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
      return;
    }

    this.procesando = true;
    this.error = null;

    const idFinca = this.draft.fincaId ? parseInt(this.draft.fincaId, 10) : null;

    let documento = this.draft.usuarioDocumento ?? 
                    usuario.NumeroDocumento ?? 
                    (usuario as any).numeroDocumento ?? 
                    (usuario as any).Documento ?? 
                    (usuario as any).documento;
    
    const metodoPagoId = parseInt(this.pagoForm.get('metodoPago')?.value, 10);

    if (!idFinca) {
      this.error = 'ID de finca no válido.';
      this.procesando = false;
      return;
    }

    if (!documento && usuario.Correo) {
      this.http.get<any[]>('http://localhost:3000/api/usuario')
        .pipe(
          switchMap(usuarios => {
            const usuarioCompleto = usuarios.find(u => 
              (u.Correo?.toLowerCase() === usuario.Correo?.toLowerCase())
            );

            documento = usuarioCompleto?.NumeroDocumento ?? usuarioCompleto?.IdUsuario;
            
            if (!documento) {
              throw new Error('No se pudo obtener el número de documento del usuario');
            }

            return this.crearReservaConDocumento(documento, idFinca, metodoPagoId);
          }),
          takeUntil(this.destroy$),
          finalize(() => {
            this.procesando = false;
          })
        )
        .subscribe({
          next: (resultado) => {
            this.exito = true;
            this.checkoutService.clearDraft();
            
            setTimeout(() => {
              this.router.navigate(['/mi-cuenta']);
            }, 2000);
          },
          error: (err) => {
            this.error = err?.message || err?.error?.message || 'Error al procesar la reserva. Por favor, intenta nuevamente.';
          }
        });
      
      return;
    }

    this.crearReservaConDocumento(documento, idFinca, metodoPagoId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.procesando = false;
        })
      )
      .subscribe({
        next: (resultado) => {
          this.exito = true;
          this.checkoutService.clearDraft();
          
          setTimeout(() => {
            this.router.navigate(['/mi-cuenta']);
          }, 2000);
        },
        error: (err) => {
          this.error = err?.error?.message || 'Error al procesar la reserva. Por favor, intenta nuevamente.';
        }
      });
  }

  private crearReservaConDocumento(documento: any, idFinca: number | null, metodoPagoId: number) {

    const fincaIdNumerico = typeof this.draft!.fincaId === 'string' 
      ? parseInt(this.draft!.fincaId, 10) 
      : this.draft!.fincaId;

    const fechaEntrada = this.draft!.fechaEntrada.includes('T') 
      ? this.draft!.fechaEntrada 
      : this.draft!.fechaEntrada + 'T12:00:00.000Z';
    
    const fechaSalida = this.draft!.fechaSalida.includes('T') 
      ? this.draft!.fechaSalida 
      : this.draft!.fechaSalida + 'T12:00:00.000Z';

    const reservaData = {
      fincaId: String(fincaIdNumerico),
      fincaNombre: this.draft!.fincaNombre,
      municipio: this.draft!.municipio,
      fechaEntrada: fechaEntrada,
      fechaSalida: fechaSalida,
      noches: Number(this.draft!.noches) || 1,
      huespedes: Number(this.draft!.huespedes) || 1,
      montoReserva: Number(this.draft!.montoTotal) || 0,
      usuarioCorreo: this.draft!.usuarioCorreo,
      usuarioNombre: this.draft!.usuarioNombreCompleto,
      usuarioDocumento: documento,
      precioNoche: Number(this.draft!.precioNoche) || 0
    };

    return this.reservaService.crearReserva(reservaData);
  }

  volver(): void {
    this.router.navigate(['/inicio']);
  }

  get nombreMetodoPago(): string {
    const id = this.pagoForm.get('metodoPago')?.value;
    const metodo = this.metodosPago.find(m => m.id.toString() === id);
    return metodo?.nombre || 'Método de pago';
  }
}
