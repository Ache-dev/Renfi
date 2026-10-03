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
  usuariosFiltrados: UsuarioApiDto[] = [];
  loading = true;
  error = '';
  busqueda = '';

  constructor(private readonly usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.loading = true;
    this.error = '';
    this.usuarioService.getUsuarios().subscribe({
      next: (data) => {
        this.usuarios = Array.isArray(data) ? data : [];
        this.aplicarFiltro();
        this.loading = false;
      },
      error: () => {
        this.error = 'No fue posible cargar el directorio de usuarios. Intenta de nuevo más tarde.';
        this.loading = false;
      }
    });
  }

  onBusqueda(termino: string): void {
    this.busqueda = termino.toLowerCase().trim();
    this.aplicarFiltro();
  }

  private aplicarFiltro(): void {
    if (!this.busqueda) {
      this.usuariosFiltrados = [...this.usuarios];
      return;
    }

    this.usuariosFiltrados = this.usuarios.filter((u) => {
      const nombre = `${u.NombreUsuario || ''} ${u.ApellidoUsuario || ''}`.toLowerCase();
      const correo = (u.Correo || '').toLowerCase();
      const rol = (u.Rol || u.NombreRol || '').toLowerCase();
      const telefono = (u.Telefono || '').toLowerCase();
      return (
        nombre.includes(this.busqueda) ||
        correo.includes(this.busqueda) ||
        rol.includes(this.busqueda) ||
        telefono.includes(this.busqueda)
      );
    });
  }

  getInicial(usuario: UsuarioApiDto): string {
    const fuente = usuario.NombreUsuario || usuario.Correo || 'U';
    return fuente.charAt(0).toUpperCase();
  }

  getRolTexto(usuario: UsuarioApiDto): string {
    return usuario.Rol || usuario.NombreRol || 'Usuario';
  }
}

