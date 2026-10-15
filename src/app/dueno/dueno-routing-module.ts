import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Dueno } from './dueno';
import { InicioDueno } from './inicio-dueno/inicio-dueno';
import { MisFincasDueno } from './mis-fincas-dueno/mis-fincas-dueno';
import { ReservasDueno } from './reservas-dueno/reservas-dueno';
import { IngresosDueno } from './ingresos-dueno/ingresos-dueno';

const routes: Routes = [
  {
    path: '',
    component: Dueno,
    children: [
      { path: '', component: InicioDueno },
      { path: 'fincas', component: MisFincasDueno },
      { path: 'reservas', component: ReservasDueno },
      { path: 'ingresos', component: IngresosDueno }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DuenoRoutingModule {}
