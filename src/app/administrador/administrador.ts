import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

interface AdminNavLink {
  label: string;
  route: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-administrador',
  standalone: false,
  templateUrl: './administrador.html',
  styleUrl: './administrador.css'
})
export class Administrador implements OnInit, OnDestroy {
  navLinks: AdminNavLink[] = [
    { label: 'Inicio', route: '/administrador', icon: '📊', description: 'Resumen general y reportes clave' },
    { label: 'Usuarios', route: '/administrador/usuarios', icon: '🧑‍🤝‍🧑', description: 'Gestiona clientes y administradores' },
    { label: 'Fincas', route: '/administrador/fincas', icon: '🏡', description: 'Administra la información de las fincas' },
    { label: 'Reservas', route: '/administrador/reservas', icon: '🗓️', description: 'Control de reservas y estados' },
    { label: 'Pagos', route: '/administrador/pagos', icon: '💳', description: 'Pagos recibidos y pendientes' },
    { label: 'Facturas', route: '/administrador/facturas', icon: '📄', description: 'Emisión y seguimiento de facturas' },
    { label: 'Métodos de pago', route: '/administrador/metodos-de-pago', icon: '👛', description: 'Configura los métodos de pago disponibles' },
    { label: 'Imágenes', route: '/administrador/imagenes', icon: '🖼️', description: 'Gestiona galerías y material multimedia' },
    { label: 'Municipios', route: '/administrador/municipios', icon: '📍', description: 'Cobertura y estadísticas por municipio' },
    { label: 'Roles', route: '/administrador/roles', icon: '🛡️', description: 'Permisos y roles habilitados en Renfi' },
  ];

  sidebarColapsado = false;
  tituloActual = 'Inicio';
  descripcionActual = 'Resumen general y reportes clave';

  private readonly destroy$ = new Subject<void>();
  private detachResponsiveListener?: () => void;

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    this.configurarColapsoInicial();
    this.actualizarSeccionActiva(this.router.url);

    this.router.events
      .pipe(takeUntil(this.destroy$))
      .subscribe((evento) => {
        if (evento instanceof NavigationEnd) {
          this.actualizarSeccionActiva(evento.urlAfterRedirects);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.detachResponsiveListener?.();
  }

  alternarSidebar(): void {
    this.sidebarColapsado = !this.sidebarColapsado;
  }

  private configurarColapsoInicial(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const preferCompact = window.matchMedia('(max-width: 1024px)');
    if (preferCompact.matches) {
      this.sidebarColapsado = true;
    }

    const listener = (event: MediaQueryListEvent) => {
      if (event.matches) {
        this.sidebarColapsado = true;
      }
    };

    preferCompact.addEventListener('change', listener);
    this.detachResponsiveListener = () => preferCompact.removeEventListener('change', listener);
  }

  private actualizarSeccionActiva(url: string): void {
    const limpio = url.split('?')[0];
    const encontrado = this.navLinks.find((link) =>
      limpio === link.route || limpio.startsWith(`${link.route}/`)
    );
    if (encontrado) {
      this.tituloActual = encontrado.label;
      this.descripcionActual = encontrado.description;
    } else {
      this.tituloActual = 'Inicio';
      this.descripcionActual = 'Resumen general y reportes clave';
    }
  }
}
