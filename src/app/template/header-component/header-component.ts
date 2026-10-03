import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthStateService } from '../services/auth-state.service';
import { UsuarioNormalizado } from '../services/auth.service';

@Component({
  selector: 'app-header-component',
  templateUrl: './header-component.html',
  styleUrls: ['./header-component.css'],
  standalone: false
})
export class HeaderComponent {
  readonly esAdmin$: Observable<boolean>;
  readonly usuario$: Observable<UsuarioNormalizado | null>;
  menuAbierto = false;

  constructor(private router: Router, private authState: AuthStateService) {
    this.esAdmin$ = this.authState.esAdmin$;
    this.usuario$ = this.authState.currentUser$;
  }

  alternarMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  @HostListener('document:keydown.escape')
  cerrarMenu() {
    this.menuAbierto = false;
  }

  logout() {
    this.cerrarMenu();
    this.authState.clearSession();
    void this.router.navigate(['/inicio']);
  }

  getInicial(usuario: UsuarioNormalizado | null): string {
    const base = String(usuario?.NombreUsuario || usuario?.Correo || 'R').trim();
    return base.charAt(0).toUpperCase();
  }

  getNombreCorto(usuario: UsuarioNormalizado | null): string {
    if (!usuario) {
      return 'Invitado';
    }

    const nombreLimpio = String(usuario.NombreUsuario ?? '').trim();
    const apellidoLimpio = String(usuario.ApellidoUsuario ?? '').trim();

    if (!nombreLimpio && !apellidoLimpio) {
      return usuario.Correo ?? 'Usuario Renfi';
    }

    return `${nombreLimpio}${apellidoLimpio ? ` ${apellidoLimpio.charAt(0).toUpperCase()}.` : ''}`.trim();
  }
}
