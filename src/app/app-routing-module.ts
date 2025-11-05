import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InicioComponent } from './template/inicio-component/inicio-component';
import { DetalleFincaComponent } from './template/detalle-finca-component/detalle-finca-component';
import { IniciarSesionComponent } from './template/iniciar-sesion-component/iniciar-sesion-component';
import { RegistrarseComponent } from './template/registrarse-component/registrarse-component';
import { SobreNosotrosComponent } from './template/sobre-nosotros-component/sobre-nosotros-component';
import { MiCuentaUsuarios } from './usuario/mi-cuenta-usuarios/mi-cuenta-usuarios';
import { ComprovanteReservaUsuario } from './usuario/comprovante-reserva-usuario/comprovante-reserva-usuario';
import { Administrador } from './administrador/administrador';
import { InicioAdministrador } from './administrador/inicio-administrador/inicio-administrador';
import { UsuarioAdministrador } from './administrador/usuario-administrador/usuario-administrador';
import { FincaAdministrador } from './administrador/finca-administrador/finca-administrador';
import { ReservaAdministrador } from './administrador/reserva-administrador/reserva-administrador';
import { PagoAdministrador } from './administrador/pago-administrador/pago-administrador';
import { FacturaAdministrador } from './administrador/factura-administrador/factura-administrador';
import { MetododepagoAdministrador } from './administrador/metododepago-administrador/metododepago-administrador';
import { ImagenAdministrador } from './administrador/imagen-administrador/imagen-administrador';
import { MunicipioAdministrador } from './administrador/municipio-administrador/municipio-administrador';
import { RolAdministrador } from './administrador/rol-administrador/rol-administrador';
import { AdminGuard } from './administrador/guards/admin.guard';

const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'inicio', component: InicioComponent },
  { path: 'iniciar-sesion', component: IniciarSesionComponent },
  { path: 'registrarse', component: RegistrarseComponent },
  { path: 'fincas/:id', component: DetalleFincaComponent },
  { path: 'mi-cuenta', component: MiCuentaUsuarios },
  { path: 'reserva/comprobante', component: ComprovanteReservaUsuario },
  { path: 'sobre-nosotros', component: SobreNosotrosComponent },
  {
    path: 'administrador',
    component: Administrador,
    canActivate: [AdminGuard],
    canActivateChild: [AdminGuard],
    canMatch: [AdminGuard],
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
  },
  { path: '**', redirectTo: 'inicio' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
