import { Component } from '@angular/core';
import { ADMIN_RESOURCES } from '../admin-resources.config';

@Component({
  selector: 'app-pago-administrador',
  standalone: false,
  templateUrl: './pago-administrador.html',
  styleUrl: './pago-administrador.css'
})
export class PagoAdministrador {
  readonly config = ADMIN_RESOURCES['pagos'];

}
