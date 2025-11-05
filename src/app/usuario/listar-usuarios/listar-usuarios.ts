import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Usuario {
  IdUsuario: number;
  NombreUsuario: string;
  ApellidoUsuario: string;
  Telefono: string;
  Correo: string;
  Contraseña: string;
  Rol: string;
}

@Component({
  selector: 'app-listar-usuarios',
  templateUrl: './listar-usuarios.html',
  styleUrls: ['./listar-usuarios.css'],
  standalone: false,
})
export class ListarUsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  loading = true;
  error = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<Usuario[]>('http://localhost:3000/api/usuario').subscribe({
      next: data => {
        this.usuarios = data;
        this.loading = false;
      },
      error: err => {
        this.error = 'Error al cargar usuarios';
        this.loading = false;
      }
    });
  }
}
