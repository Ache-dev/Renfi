import { Component } from '@angular/core';
import { ADMIN_RESOURCES } from '../admin-resources.config';

@Component({
  selector: 'app-metododepago-administrador',
  standalone: false,
  templateUrl: './metododepago-administrador.html',
  styleUrl: './metododepago-administrador.css'
})
export class MetododepagoAdministrador {
  readonly config = ADMIN_RESOURCES['metodos-de-pago'];

}
