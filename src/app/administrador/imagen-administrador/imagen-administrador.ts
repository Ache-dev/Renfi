import { Component } from '@angular/core';
import { ADMIN_RESOURCES } from '../admin-resources.config';

@Component({
  selector: 'app-imagen-administrador',
  standalone: false,
  templateUrl: './imagen-administrador.html',
  styleUrl: './imagen-administrador.css'
})
export class ImagenAdministrador {
  readonly config = ADMIN_RESOURCES['imagenes'];

}
