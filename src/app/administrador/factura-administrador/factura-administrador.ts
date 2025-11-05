import { Component } from '@angular/core';
import { ADMIN_RESOURCES } from '../admin-resources.config';

@Component({
  selector: 'app-factura-administrador',
  standalone: false,
  templateUrl: './factura-administrador.html',
  styleUrl: './factura-administrador.css'
})
export class FacturaAdministrador {
  readonly config = ADMIN_RESOURCES['facturas'];

}
