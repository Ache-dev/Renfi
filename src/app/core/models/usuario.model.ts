/**
 * Modelos de Usuario para autenticación y gestión de perfil.
 */

export interface UsuarioNormalizado {
  IdUsuario?: number;
  NumeroDocumento?: number | string;
  NombreUsuario?: string;
  ApellidoUsuario?: string;
  Telefono?: string;
  Correo?: string;
  Estado?: string;
  Rol?: string;
  IdRol?: number;
}

export interface RegistroUsuarioRequest {
  IdRol: number;
  NombreUsuario: string;
  ApellidoUsuario: string;
  Telefono: string;
  Contrasena: string;
  Correo: string;
  Estado: string;
}

export interface LoginRequest {
  correo: string;
  contrasena: string;
  Correo?: string;
  Contrasena?: string;
}

export interface LoginResponse {
  token?: string;
  usuario?: UsuarioNormalizado | null;
  user?: unknown;
  message?: string;
}

export interface UsuarioApiDto {
  IdUsuario?: number;
  NumeroDocumento?: number | string;
  NombreUsuario?: string;
  ApellidoUsuario?: string;
  Telefono?: string;
  Correo?: string;
  Estado?: string;
  IdRol?: number;
  NombreRol?: string;
  Rol?: string;
  Contrasena?: string;
  Contraseña?: string;
  [key: string]: unknown;
}
