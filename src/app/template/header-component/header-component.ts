import { Component } from '@angular/core';
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

  constructor(private router: Router, private authState: AuthStateService) {
    this.esAdmin$ = this.authState.esAdmin$;
  }

  get usuario$() {
    return this.authState.currentUser$;
  }

  goToHome() {
    this.navigateTo('/inicio');
  }

  goToLogin() {
    this.navigateTo('/iniciar-sesion');
  }

  goToRegister() {
    this.navigateTo('/registrarse');
  }

  goToAbout() {
    this.navigateTo('/sobre-nosotros');
  }

  goToAccount() {
    this.navigateTo('/mi-cuenta');
  }

  goToAdmin() {
    this.navigateTo('/administrador');
  }

  logout() {
    this.authState.clearSession();
    this.navigateTo('/inicio');
  }

  getNombreCorto(usuario: UsuarioNormalizado | null): string {
    if (!usuario) {
      return 'Invitado';
    }

    const nombre = usuario.NombreUsuario ?? '';
    const apellido = usuario.ApellidoUsuario ?? '';

    const nombreLimpio = String(nombre).trim();
    const apellidoLimpio = String(apellido).trim();

    if (!nombreLimpio && !apellidoLimpio) {
      return usuario.Correo ?? 'Usuario Renfi';
    }

    return `${nombreLimpio}${apellidoLimpio ? ` ${apellidoLimpio.charAt(0).toUpperCase()}.` : ''}`.trim();
  }

  private navigateTo(path: string) {
    this.closeMenu();
    void this.router.navigate([path]);
  }

  private closeMenu() {
    const navbar = document.getElementById('mainNavbar');
    if (navbar && navbar.classList.contains('show')) {

      const collapse = new (window as any).bootstrap.Collapse(navbar, { toggle: false });
      collapse.hide();
    }
  }
}
