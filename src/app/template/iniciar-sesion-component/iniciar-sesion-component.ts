import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, finalize, takeUntil } from 'rxjs';
import { AuthService, LoginRequest, LoginResponse } from '../services/auth.service';
import { AuthStateService } from '../services/auth-state.service';
import { CryptoService } from '../services/crypto.service';

@Component({
  selector: 'app-iniciar-sesion-component',
  standalone: false,
  templateUrl: './iniciar-sesion-component.html',
  styleUrl: './iniciar-sesion-component.css'
})
export class IniciarSesionComponent implements OnDestroy {
  loginForm: FormGroup;
  autenticando = false;
  mensajeError = '';
  mensajeExito = '';
  mostrarModalRecuperacion = false;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly authState: AuthStateService,
    private readonly router: Router,
    private readonly cryptoService: CryptoService
  ) {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      recordarme: [false]
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  campoInvalido(controlName: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  goToRegister(): void {
    this.router.navigate(['/registrarse']);
  }

  onForgotPassword(event: Event): void {
    event.preventDefault();
    this.mostrarModalRecuperacion = true;
  }

  cerrarModal(): void {
    this.mostrarModalRecuperacion = false;
  }

  confirmarRecuperacion(): void {
    this.mostrarModalRecuperacion = false;
    this.router.navigate(['/sobre-nosotros'], { fragment: 'contacto' });
  }

  async onSubmit(): Promise<void> {
    this.mensajeError = '';
    this.mensajeExito = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { correo, password, recordarme } = this.loginForm.value;
    this.autenticando = true;

    const normalizado = correo.trim().toLowerCase();

    // Hashear la contraseña con SHA-512
    const hashedPassword = await this.cryptoService.hashSHA512(password);

    const payload: LoginRequest = {
      correo: normalizado,
      contrasena: hashedPassword,
      Correo: normalizado,
      Contrasena: hashedPassword
    };

    this.authService
      .iniciarSesion(payload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.autenticando = false))
      )
      .subscribe({
        next: (respuesta: LoginResponse) => {
          this.authState.setSession(respuesta, !!recordarme);

          const esAdmin = this.authState.esAdminSnapshot();
          const destino = esAdmin ? '/administrador' : '/inicio';

          this.mensajeExito = respuesta?.message ?? 'Inicio de sesión exitoso. Te estamos redirigiendo.';
          setTimeout(() => this.router.navigate([destino]), 900);
        },
        error: (error) => {
          if (error?.status === 0) {
            this.mensajeError = 'No fue posible conectar con el servidor. Intenta nuevamente en unos instantes.';
            return;
          }

          if (error?.status === 401) {
            this.mensajeError = 'Credenciales incorrectas. Verifica tu correo y contraseña.';
            return;
          }

          this.mensajeError =
            error?.error?.message ?? 'No fue posible iniciar sesión. Verifica tus credenciales.';
        }
      });
  }

}
