import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AdministradorRoutingModule } from './administrador-routing-module';
import { Administrador } from './administrador';
import { InicioAdministrador } from './inicio-administrador/inicio-administrador';
import { FincaAdministrador } from './finca-administrador/finca-administrador';
import { UsuarioAdministrador } from './usuario-administrador/usuario-administrador';
import { RolAdministrador } from './rol-administrador/rol-administrador';
import { ImagenAdministrador } from './imagen-administrador/imagen-administrador';
import { ReservaAdministrador } from './reserva-administrador/reserva-administrador';
import { FacturaAdministrador } from './factura-administrador/factura-administrador';
import { PagoAdministrador } from './pago-administrador/pago-administrador';
import { MetododepagoAdministrador } from './metododepago-administrador/metododepago-administrador';
import { MunicipioAdministrador } from './municipio-administrador/municipio-administrador';
import { HeaderAdministrador } from './header-administrador/header-administrador';
import { ResourceCrudComponent } from './resource-crud/resource-crud';
import { DragScrollDirective } from './resource-crud/drag-scroll.directive';

@NgModule({
  declarations: [
    Administrador,
    InicioAdministrador,
    FincaAdministrador,
    UsuarioAdministrador,
    RolAdministrador,
    ImagenAdministrador,
    ReservaAdministrador,
    FacturaAdministrador,
    PagoAdministrador,
    MetododepagoAdministrador,
    MunicipioAdministrador,
    HeaderAdministrador,
    ResourceCrudComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AdministradorRoutingModule,
    DragScrollDirective
  ],
  exports: [
    Administrador
  ]
})
export class AdministradorModule {}
