import { Component } from '@angular/core';
import { ADMIN_RESOURCES } from '../admin-resources.config';

@Component({
  selector: 'app-finca-administrador',
  standalone: false,
  templateUrl: './finca-administrador.html',
  styleUrl: './finca-administrador.css'
})
export class FincaAdministrador {
  readonly config = ADMIN_RESOURCES['fincas'];

}
