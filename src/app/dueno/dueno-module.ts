import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminSharedModule } from '../administrador/shared/admin-shared-module';
import { DuenoRoutingModule } from './dueno-routing-module';
import { Dueno } from './dueno';
import { InicioDueno } from './inicio-dueno/inicio-dueno';
import { MisFincasDueno } from './mis-fincas-dueno/mis-fincas-dueno';
import { ReservasDueno } from './reservas-dueno/reservas-dueno';
import { IngresosDueno } from './ingresos-dueno/ingresos-dueno';

@NgModule({
  declarations: [Dueno, InicioDueno, MisFincasDueno, ReservasDueno, IngresosDueno],
  imports: [CommonModule, RouterModule, AdminSharedModule, DuenoRoutingModule]
})
export class DuenoModule {}
