import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, of, throwError } from 'rxjs';
import { finalize, switchMap, takeUntil } from 'rxjs/operators';
import { ReservaCheckoutDraft, ReservaCheckoutService } from '../../template/services/reserva-checkout.service';
import { ReservaService } from '../../template/services/reserva.service';
import { AuthStateService } from '../../template/services/auth-state.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { PLACEHOLDER_FINCA } from '../../template/services/finca-seleccionada.service';

@Component({
  selector: 'app-pasarela-pago-usuario',
  standalone: false,
  templateUrl: './pasarela-pago-usuario.html',
  styleUrl: './pasarela-pago-usuario.css'
})
export class PasarelaPagoUsuario implements OnInit, OnDestroy {
  readonly placeholderFinca = PLACEHOLDER_FINCA;
  draft: ReservaCheckoutDraft | null = null;
  pagoForm: FormGroup;
  procesando = false;
  error: string | null = null;
  exito = false;

  private readonly destroy$ = new Subject<void>();

  // Ids según el seed de MetodoDePago; se reemplaza por GET /metododepago al iniciar.
  metodosPago: { id: string | number; nombre: string }[] = [
    { id: 1, nombre: 'Efectivo' },
    { id: 2, nombre: 'Transferencia Bancaria' },
    { id: 3, nombre: 'Tarjeta de Crédito' },
    { id: 4, nombre: 'Nequi / Daviplata' }
  ];

  constructor(
    private readonly checkoutService: ReservaCheckoutService,
    private readonly reservaService: ReservaService,
    private readonly authState: AuthStateService,
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly usuarioService: UsuarioService
  ) {
    this.pagoForm = this.fb.group({
      metodoPago: ['1', [Validators.required]],
      aceptaTerminos: [false, [Validators.requiredTrue]]
    });
  }

  ngOnInit(): void {
    this.draft = this.checkoutService.getDraft();
    this.reservaService.obtenerMetodosPago().pipe(takeUntil(this.destroy$)).subscribe((m) => {
      if (m.length) {
        this.metodosPago = m;
        this.pagoForm.patchValue({ metodoPago: String(m[0].id) });
      }
    });

    if (!this.draft) {
      this.error = 'No hay información de reserva disponible. Por favor, inicia el proceso desde la página de la finca.';
      return;
    }

    if (!this.authState.isAuthenticated()) {
      // Sin sesión no se muestra el formulario mientras se redirige al login.
      this.draft = null;
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
    if (this.pagoForm.invalid || !this.draft || this.procesando) {
      this.pagoForm.markAllAsTouched();
      return;
    }

    const usuario = this.authState.getSnapshot();
    if (!usuario) {
      this.error = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
      return;
    }

    const draft = this.draft;
    if (!parseInt(draft.fincaId, 10)) {
      this.error = 'ID de finca no válido.';
      return;
    }

    this.procesando = true;
    this.error = null;

    const documento$ = draft.usuarioDocumento ?? usuario.NumeroDocumento ?? (usuario as any).numeroDocumento
      ? of(draft.usuarioDocumento ?? usuario.NumeroDocumento ?? (usuario as any).numeroDocumento)
      : this.usuarioService.obtenerDocumentoPorCorreo(usuario.Correo ?? "");

    documento$
      .pipe(
        switchMap((documento) => {
          if (!documento) {
            return throwError(() => new Error('No se pudo obtener el número de documento del usuario'));
          }
          return this.pagar(draft, documento);
        }),
        takeUntil(this.destroy$),
        finalize(() => (this.procesando = false))
      )
      .subscribe({
        next: ({ reserva, pago, factura }) => {
          this.checkoutService.setResult({
            reserva,
            factura,
            pago: {
              id: pago.id,
              metodoNombre: pago.metodoNombre ?? '',
              monto: pago.monto ?? 0,
              fechaPago: pago.fechaPago ?? new Date().toISOString(),
              referencia: pago.referencia,
              estado: pago.estado
            }
          });
          this.checkoutService.clearDraft();
          this.router.navigate(['/reserva/comprobante']);
        },
        error: (err) => {
          this.error = err?.error?.message || err?.message || 'Error al procesar la reserva. Por favor, intenta nuevamente.';
        }
      });
  }

  private pagar(draft: ReservaCheckoutDraft, documento: string | number) {
    const dia = (f: string) => (f.includes('T') ? f : f + 'T12:00:00.000Z');
    const metodoId = this.pagoForm.get('metodoPago')?.value;
    const metodo = this.metodosPago.find((m) => String(m.id) === String(metodoId));
    const monto = Number(draft.montoTotal) || 0;

    return this.reservaService.crearReservaConPago({
      reserva: {
        fincaId: String(parseInt(draft.fincaId, 10)),
        fincaNombre: draft.fincaNombre,
        municipio: draft.municipio,
        fechaEntrada: dia(draft.fechaEntrada),
        fechaSalida: dia(draft.fechaSalida),
        noches: Number(draft.noches) || 1,
        huespedes: Number(draft.huespedes) || 1,
        montoReserva: monto,
        usuarioCorreo: draft.usuarioCorreo,
        usuarioNombre: draft.usuarioNombreCompleto,
        usuarioDocumento: documento,
        precioNoche: Number(draft.precioNoche) || 0
      },
      pago: { monto, metodoId, metodoNombre: metodo?.nombre ?? '' }
    });
  }

  onImageError(): void {
    if (this.draft) {
      this.draft.fincaImagen = this.placeholderFinca;
    }
  }

  volver(): void {
    this.router.navigate(this.draft ? ['/fincas', this.draft.fincaId] : ['/inicio']);
  }
}
