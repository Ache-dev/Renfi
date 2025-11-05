import { Component } from '@angular/core';
import { ADMIN_RESOURCES } from '../admin-resources.config';

@Component({
  selector: 'app-reserva-administrador',
  standalone: false,
  templateUrl: './reserva-administrador.html',
  styleUrl: './reserva-administrador.css'
})
export class ReservaAdministrador {
  readonly config = ADMIN_RESOURCES['reservas'];

}
