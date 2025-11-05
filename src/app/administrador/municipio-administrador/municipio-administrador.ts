import { Component } from '@angular/core';
import { ADMIN_RESOURCES } from '../admin-resources.config';

@Component({
  selector: 'app-municipio-administrador',
  standalone: false,
  templateUrl: './municipio-administrador.html',
  styleUrl: './municipio-administrador.css'
})
export class MunicipioAdministrador {
  readonly config = ADMIN_RESOURCES['municipios'];

}
