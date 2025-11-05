import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthStateService } from '../../template/services/auth-state.service';
import { UsuarioNormalizado } from '../../template/services/auth.service';

@Component({
  selector: 'app-header-administrador',
  standalone: false,
  templateUrl: './header-administrador.html',
  styleUrl: './header-administrador.css'
})
export class HeaderAdministrador {
  @Input() titulo = 'Inicio';
  @Input() descripcion = '';
  @Input() sidebarColapsado = false;
  @Output() readonly menuToggle = new EventEmitter<void>();

  readonly usuario$: Observable<UsuarioNormalizado | null>;

  constructor(private readonly authState: AuthStateService) {
    this.usuario$ = this.authState.currentUser$;
  }

  alternar(): void {
    this.menuToggle.emit();
  }

}
