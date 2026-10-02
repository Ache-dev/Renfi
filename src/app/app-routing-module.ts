import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InicioComponent } from './template/inicio-component/inicio-component';
import { DetalleFincaComponent } from './template/detalle-finca-component/detalle-finca-component';
import { IniciarSesionComponent } from './template/iniciar-sesion-component/iniciar-sesion-component';
import { RegistrarseComponent } from './template/registrarse-component/registrarse-component';
import { SobreNosotrosComponent } from './template/sobre-nosotros-component/sobre-nosotros-component';
import { MiCuentaUsuarios } from './usuario/mi-cuenta-usuarios/mi-cuenta-usuarios';
import { ComprovanteReservaUsuario } from './usuario/comprovante-reserva-usuario/comprovante-reserva-usuario';
import { PasarelaPagoUsuario } from './usuario/pasarela-pago-usuario/pasarela-pago-usuario';
import { AdminGuard } from './administrador/guards/admin.guard';

const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'inicio', component: InicioComponent },
  { path: 'iniciar-sesion', component: IniciarSesionComponent },
  { path: 'registrarse', component: RegistrarseComponent },
  { path: 'fincas/:id', component: DetalleFincaComponent },
  { path: 'mi-cuenta', component: MiCuentaUsuarios },
  { path: 'reserva/pago', component: PasarelaPagoUsuario },
  { path: 'reserva/comprobante', component: ComprovanteReservaUsuario },
  { path: 'sobre-nosotros', component: SobreNosotrosComponent },
  {
    path: 'administrador',
    canActivate: [AdminGuard],
    canMatch: [AdminGuard],
    loadChildren: () => import('./administrador/administrador-module').then((m) => m.AdministradorModule)
  },
  { path: '**', redirectTo: 'inicio' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
