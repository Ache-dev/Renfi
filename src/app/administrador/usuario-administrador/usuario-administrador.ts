import { Component } from '@angular/core';
import { ADMIN_RESOURCES } from '../admin-resources.config';

@Component({
  selector: 'app-usuario-administrador',
  standalone: false,
  templateUrl: './usuario-administrador.html',
  styleUrl: './usuario-administrador.css'
})
export class UsuarioAdministrador {
  readonly config = ADMIN_RESOURCES['usuarios'];

}
