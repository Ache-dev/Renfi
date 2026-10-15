import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HeaderAdministrador } from '../header-administrador/header-administrador';
import { ResourceCrudComponent } from '../resource-crud/resource-crud';
import { FincasGestionComponent } from './fincas-gestion/fincas-gestion';
import { GaleriaFincaComponent } from './galeria-finca/galeria-finca';

/**
 * Piezas que comparten el panel del administrador y el del dueño de finca.
 */
@NgModule({
  declarations: [HeaderAdministrador, ResourceCrudComponent, FincasGestionComponent, GaleriaFincaComponent],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  exports: [HeaderAdministrador, ResourceCrudComponent, FincasGestionComponent, GaleriaFincaComponent]
})
export class AdminSharedModule {}
