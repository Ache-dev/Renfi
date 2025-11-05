import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { UsuarioModule } from '../usuario/usuario-module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderComponent } from './header-component/header-component';
import { FooterComponent } from './footer-component/footer-component';
import { InicioComponent } from './inicio-component/inicio-component';
import { FincasRelevantesComponent } from './fincas-relevantes-component/fincas-relevantes-component';
import { DetalleFincaComponent } from './detalle-finca-component/detalle-finca-component';
import { IniciarSesionComponent } from './iniciar-sesion-component/iniciar-sesion-component';
import { RegistrarseComponent } from './registrarse-component/registrarse-component';
import { SobreNosotrosComponent } from './sobre-nosotros-component/sobre-nosotros-component';



@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    InicioComponent,
    FincasRelevantesComponent,
    DetalleFincaComponent,
    IniciarSesionComponent,
    RegistrarseComponent,
    SobreNosotrosComponent
  ],
  imports: [
  CommonModule,
  HttpClientModule,
  FormsModule,
  ReactiveFormsModule,
  UsuarioModule
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    InicioComponent,
    FincasRelevantesComponent,
    DetalleFincaComponent
  ]
})
export class TemplateModule { }
