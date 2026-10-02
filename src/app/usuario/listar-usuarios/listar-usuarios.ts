import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../../core/services/usuario.service';
import { UsuarioApiDto } from '../../core/models/usuario.model';

@Component({
  selector: 'app-listar-usuarios',
  templateUrl: './listar-usuarios.html',
  styleUrls: ['./listar-usuarios.css'],
  standalone: false,
})
export class ListarUsuariosComponent implements OnInit {
  usuarios: UsuarioApiDto[] = [];
  loading = true;
  error = '';

  constructor(private readonly usuarioService: UsuarioService) {}

  ngOnInit() {
    this.usuarioService.getUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar usuarios';
        this.loading = false;
      }
    });
  }
}
