import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize, Subject, switchMap, takeUntil, of } from 'rxjs';
import { AuthStateService } from '../../template/services/auth-state.service';
import { AuthService, UsuarioNormalizado } from '../../template/services/auth.service';
import { Reserva, ReservaService } from '../../template/services/reserva.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-mi-cuenta-usuarios',
  standalone: false,
  templateUrl: './mi-cuenta-usuarios.html',
  styleUrl: './mi-cuenta-usuarios.css'
})
export class MiCuentaUsuarios implements OnInit, OnDestroy {
  cuentaForm: FormGroup;
  usuarioActual: UsuarioNormalizado | null = null;
  reservas: Reserva[] = [];
  cargando = true;
  guardando = false;
  reservasCargando = false;
  mensajeExito = '';
  mensajeError = '';
  mensajeReservas = '';
  errorReservas = '';
  cancelandoReservaId: string | null = null;

  mostrarModalCancelacion = false;
  reservaACancelar: Reserva | null = null;

  private readonly destroy$ = new Subject<void>();
  private recordarSesion = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authState: AuthStateService,
    private readonly authService: AuthService,
    private readonly reservaService: ReservaService,
    private readonly http: HttpClient
  ) {
    this.cuentaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      correo: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{7,}$/)]]
    });
  }

  ngOnInit(): void {
    this.authState.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((usuario) => {
        this.usuarioActual = usuario;
        this.cargando = false;
        this.mensajeError = '';
        this.mensajeExito = '';
        this.mensajeReservas = '';
        this.errorReservas = '';

        if (usuario) {
          this.recordarSesion = this.authState.recordarSesionActiva();
          this.patchForm(usuario);
          this.cargarReservas(usuario);
        } else {
          this.cuentaForm.reset({
            nombre: '',
            apellido: '',
            telefono: '',
            correo: { value: '', disabled: true }
          });
          this.reservas = [];
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  campoInvalido(controlName: string): boolean {
    const control = this.cuentaForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  onSubmit(): void {
    this.mensajeError = '';
    this.mensajeExito = '';

    if (this.cuentaForm.invalid) {
      this.cuentaForm.markAllAsTouched();
      return;
    }

    if (!this.usuarioActual) {
      this.mensajeError = 'Debes iniciar sesión para actualizar tu información.';
      return;
    }

    const { nombre, apellido, telefono } = this.cuentaForm.getRawValue();
    const payload = {
      NombreUsuario: nombre.trim(),
      ApellidoUsuario: apellido.trim(),
      Telefono: telefono.trim()
    };

    const usuarioId = this.usuarioActual.IdUsuario ?? null;

    this.guardando = true;

    if (usuarioId) {
      this.authService
        .actualizarPerfil(usuarioId, payload)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => (this.guardando = false))
        )
        .subscribe({
          next: (actualizado: UsuarioNormalizado) => {
            const usuarioNormalizado: UsuarioNormalizado = {
              ...this.usuarioActual,
              ...actualizado,
              NombreUsuario: actualizado.NombreUsuario ?? payload.NombreUsuario,
              ApellidoUsuario: actualizado.ApellidoUsuario ?? payload.ApellidoUsuario,
              Telefono: actualizado.Telefono ?? payload.Telefono
            };
            this.authState.updateProfile(usuarioNormalizado, this.recordarSesion);
            this.mensajeExito = 'Tus datos se han actualizado correctamente.';
          },
          error: (error: unknown) => {

            this.aplicarActualizacionLocal(payload);
          }
        });
    } else {
      this.aplicarActualizacionLocal(payload);
    }
  }

  refrescarReservas(): void {
    if (this.usuarioActual) {
      this.cancelandoReservaId = null;
      this.cargarReservas(this.usuarioActual, { mostrarMensaje: true });
    }
  }

  cancelarReserva(reserva: Reserva): void {
    if (!this.usuarioActual) {
      this.errorReservas = 'Debes iniciar sesión para gestionar tus reservas.';
      return;
    }

    this.reservaACancelar = reserva;
    this.mostrarModalCancelacion = true;
  }

  cerrarModal(): void {
    this.mostrarModalCancelacion = false;
    this.reservaACancelar = null;
  }

  confirmarCancelacion(): void {
    if (!this.reservaACancelar || !this.usuarioActual) {
      return;
    }

    const reserva = this.reservaACancelar;
    this.cerrarModal();

    this.errorReservas = '';
    this.mensajeReservas = '';
    this.cancelandoReservaId = reserva.id;

    this.reservaService
      .cancelarReserva(reserva.id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.cancelandoReservaId = null;
        })
      )
      .subscribe({
        next: (exito) => {
          if (exito) {

            this.reservas = this.reservas.filter(r => r.id !== reserva.id);
            this.mensajeReservas = 'La reserva se canceló correctamente.';

            setTimeout(() => {
              this.mensajeReservas = '';
            }, 5000);
          } else {
            this.errorReservas = 'No fue posible cancelar la reserva. Intenta nuevamente.';
          }
        },
        error: (error: unknown) => {
          this.errorReservas = 'No fue posible cancelar la reserva. Intenta nuevamente.';
        }
      });
  }

  private aplicarActualizacionLocal(payload: { NombreUsuario: string; ApellidoUsuario: string; Telefono: string }): void {
    const usuarioActual = this.usuarioActual;
    if (!usuarioActual) {
      this.guardando = false;
      this.mensajeError = 'No fue posible actualizar la información. Intenta iniciar sesión nuevamente.';
      return;
    }

    const actualizado: UsuarioNormalizado = {
      ...usuarioActual,
      NombreUsuario: payload.NombreUsuario,
      ApellidoUsuario: payload.ApellidoUsuario,
      Telefono: payload.Telefono
    };

    this.authState.updateProfile(actualizado, this.recordarSesion);
    this.guardando = false;
    this.mensajeExito = 'Tus datos se han actualizado y se sincronizarán cuando haya conexión.';
  }

  private patchForm(usuario: UsuarioNormalizado): void {
    this.cuentaForm.patchValue({
      nombre: usuario.NombreUsuario ?? '',
      apellido: usuario.ApellidoUsuario ?? '',
      telefono: usuario.Telefono ?? '',
      correo: usuario.Correo ?? ''
    }, { emitEvent: false });
  }

  private cargarReservas(
    usuario: UsuarioNormalizado,
    opciones: { mostrarMensaje?: boolean; mensajeExito?: string } = {}
  ): void {
    const { mostrarMensaje = false, mensajeExito } = opciones;
    const correo = usuario.Correo?.trim() ?? null;
    const idUsuario = usuario.IdUsuario ?? null;

    let documento = (usuario as any).NumeroDocumento ?? 
                    (usuario as any).Documento ?? 
                    (usuario as any).numeroDocumento ?? 
                    null;

    if (!correo && !idUsuario && !documento) {
      this.reservas = [];
      this.errorReservas = 'No pudimos identificar tu usuario para obtener las reservas.';
      return;
    }

    if (mostrarMensaje || mensajeExito) {
      this.mensajeReservas = '';
    }
    this.errorReservas = '';
    this.reservasCargando = true;

    const obtenerDocumento$ = !documento && correo ? 
      this.http.get<any[]>('http://localhost:3000/api/usuario').pipe(
        switchMap(usuarios => {
          const usuarioCompleto = usuarios.find(u => 
            u.Correo?.toLowerCase() === correo?.toLowerCase()
          );
          documento = usuarioCompleto?.NumeroDocumento ?? usuarioCompleto?.IdUsuario ?? null;
          return of(documento);
        })
      ) : of(documento);

    obtenerDocumento$
      .pipe(
        switchMap(() => this.reservaService.obtenerReservasPorUsuario(correo, documento, idUsuario)),
        takeUntil(this.destroy$),
        finalize(() => {
          this.reservasCargando = false;
        })
      )
      .subscribe({
        next: (reservas) => {

          const reservasActivas = reservas.filter(r => {
            const estado = (r.estado || '').toLowerCase();
            return estado !== 'cancelada' && estado !== 'cancelado';
          });

          this.reservas = [...reservasActivas].sort((a, b) => {
            const fechaA = a.creadoEn ? new Date(a.creadoEn).getTime() : 0;
            const fechaB = b.creadoEn ? new Date(b.creadoEn).getTime() : 0;
            return fechaB - fechaA;
          });

          if (mensajeExito) {
            this.mensajeReservas = mensajeExito;
          } else if (mostrarMensaje) {
            this.mensajeReservas = this.reservas.length
              ? 'Tus reservas se sincronizaron correctamente.'
              : 'No encontramos reservas asociadas a tu cuenta.';
          }
        },
        error: (error: unknown) => {
          this.errorReservas = 'No fue posible cargar tus reservas. Intenta nuevamente en unos minutos.';
        }
      });
  }

}
