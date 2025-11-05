import { Component } from '@angular/core';
import { ADMIN_RESOURCES } from '../admin-resources.config';

@Component({
  selector: 'app-rol-administrador',
  standalone: false,
  templateUrl: './rol-administrador.html',
  styleUrl: './rol-administrador.css'
})
export class RolAdministrador {
  readonly config = ADMIN_RESOURCES['roles'];

}
