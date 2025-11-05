import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { TemplateModule } from './template/template-module';
import { UsuarioModule } from './usuario/usuario-module';
import { Administrador } from './administrador/administrador';
import { InicioAdministrador } from './administrador/inicio-administrador/inicio-administrador';
import { FincaAdministrador } from './administrador/finca-administrador/finca-administrador';
import { UsuarioAdministrador } from './administrador/usuario-administrador/usuario-administrador';
import { RolAdministrador } from './administrador/rol-administrador/rol-administrador';
import { ImagenAdministrador } from './administrador/imagen-administrador/imagen-administrador';
import { ReservaAdministrador } from './administrador/reserva-administrador/reserva-administrador';
import { FacturaAdministrador } from './administrador/factura-administrador/factura-administrador';
import { PagoAdministrador } from './administrador/pago-administrador/pago-administrador';
import { MetododepagoAdministrador } from './administrador/metododepago-administrador/metododepago-administrador';
import { MunicipioAdministrador } from './administrador/municipio-administrador/municipio-administrador';
import { HeaderAdministrador } from './administrador/header-administrador/header-administrador';
import { ResourceCrudComponent } from './administrador/resource-crud/resource-crud';
import { DragScrollDirective } from './administrador/resource-crud/drag-scroll.directive';

@NgModule({
  declarations: [
    App,
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
    BrowserModule,
    AppRoutingModule,
    TemplateModule,
    UsuarioModule,
    HttpClientModule,
    ReactiveFormsModule,
    DragScrollDirective
  ],
  providers: [],
  bootstrap: [App]
})
export class AppModule {}
