import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Administrador } from './administrador';
import { InicioAdministrador } from './inicio-administrador/inicio-administrador';
import { UsuarioAdministrador } from './usuario-administrador/usuario-administrador';
import { FincaAdministrador } from './finca-administrador/finca-administrador';
import { ReservaAdministrador } from './reserva-administrador/reserva-administrador';
import { PagoAdministrador } from './pago-administrador/pago-administrador';
import { FacturaAdministrador } from './factura-administrador/factura-administrador';
import { MetododepagoAdministrador } from './metododepago-administrador/metododepago-administrador';
import { ImagenAdministrador } from './imagen-administrador/imagen-administrador';
import { MunicipioAdministrador } from './municipio-administrador/municipio-administrador';
import { RolAdministrador } from './rol-administrador/rol-administrador';

const routes: Routes = [
  {
    path: '',
    component: Administrador,
    children: [
      { path: '', component: InicioAdministrador },
      { path: 'usuarios', component: UsuarioAdministrador },
      { path: 'fincas', component: FincaAdministrador },
      { path: 'reservas', component: ReservaAdministrador },
      { path: 'pagos', component: PagoAdministrador },
      { path: 'facturas', component: FacturaAdministrador },
      { path: 'metodos-de-pago', component: MetododepagoAdministrador },
      { path: 'imagenes', component: ImagenAdministrador },
      { path: 'municipios', component: MunicipioAdministrador },
      { path: 'roles', component: RolAdministrador }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdministradorRoutingModule {}
