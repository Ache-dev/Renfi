import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ListarUsuariosComponent } from './listar-usuarios/listar-usuarios';
import { MiCuentaUsuarios } from './mi-cuenta-usuarios/mi-cuenta-usuarios';
import { ComprovanteReservaUsuario } from './comprovante-reserva-usuario/comprovante-reserva-usuario';

@NgModule({
  declarations: [
    ListarUsuariosComponent,
    MiCuentaUsuarios,
    ComprovanteReservaUsuario
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  exports: [
    ListarUsuariosComponent,
    MiCuentaUsuarios
  ],
  providers: [DatePipe]
})
export class UsuarioModule { }
