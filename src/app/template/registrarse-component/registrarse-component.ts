import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { CryptoService } from '../services/crypto.service';

@Component({
  selector: 'app-registrarse-component',
  standalone: false,
  templateUrl: './registrarse-component.html',
  styleUrl: './registrarse-component.css'
})
export class RegistrarseComponent implements OnDestroy {
  registroForm: FormGroup;
  enviando = false;
  mensajeError = '';
  mensajeExito = '';
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly cryptoService: CryptoService
  ) {
    this.registroForm = this.fb.group(
      {
        nombre: ['', [Validators.required, Validators.minLength(2)]],
        apellido: ['', [Validators.required, Validators.minLength(2)]],
        correo: ['', [Validators.required, Validators.email]],
        telefono: [
          '',
          [Validators.required, Validators.pattern(/^[0-9]{10,}$/)]
        ],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
        terminos: [false, [Validators.requiredTrue]]
      },
      { validators: this.passwordMatchValidator }
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  campoInvalido(controlName: string): boolean {
    const control = this.registroForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  goToLogin(): void {
    this.router.navigate(['/iniciar-sesion']);
  }

  async onSubmit(): Promise<void> {
    this.mensajeError = '';
    this.mensajeExito = '';

    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }

    const { nombre, apellido, correo, telefono, password } = this.registroForm.getRawValue();

    // Hashear la contraseña con SHA-512
    const hashedPassword = await this.cryptoService.hashSHA512(password);

    const payload = {
      IdRol: 2,
      NombreUsuario: nombre.trim(),
      ApellidoUsuario: apellido.trim(),
      Telefono: telefono.trim(),
      Contrasena: hashedPassword,
      Correo: correo.trim().toLowerCase(),
      Estado: 'Activo'
    };

    this.enviando = true;

    this.authService
      .registrarUsuario(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.enviando = false;
          this.mensajeExito = '¡Registro exitoso! Te redirigiremos al inicio de sesión.';
          setTimeout(() => this.router.navigate(['/iniciar-sesion']), 1800);
          this.registroForm.reset({
            nombre: '',
            apellido: '',
            correo: '',
            telefono: '',
            password: '',
            confirmPassword: '',
            terminos: false
          });
        },
        error: (error) => {
          this.enviando = false;
          this.mensajeError =
            error?.error?.message ?? 'Ocurrió un error al registrar al usuario. Inténtalo nuevamente.';
        }
      });
  }

  private passwordMatchValidator(group: FormGroup): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    if (password && confirm && password !== confirm) {
      return { passwordMismatch: true };
    }
    return null;
  }

}
