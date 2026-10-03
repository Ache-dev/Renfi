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
    { label: 'Inicio', route: '/administrador', icon: 'inicio', description: 'Resumen general y reportes clave' },
    { label: 'Usuarios', route: '/administrador/usuarios', icon: 'usuarios', description: 'Gestiona clientes y administradores' },
    { label: 'Fincas', route: '/administrador/fincas', icon: 'fincas', description: 'Administra la información de las fincas' },
    { label: 'Reservas', route: '/administrador/reservas', icon: 'reservas', description: 'Control de reservas y estados' },
    { label: 'Pagos', route: '/administrador/pagos', icon: 'pagos', description: 'Pagos recibidos y pendientes' },
    { label: 'Facturas', route: '/administrador/facturas', icon: 'facturas', description: 'Emisión y seguimiento de facturas' },
    { label: 'Métodos de pago', route: '/administrador/metodos-de-pago', icon: 'metodos', description: 'Configura los métodos de pago disponibles' },
    { label: 'Imágenes', route: '/administrador/imagenes', icon: 'imagenes', description: 'Gestiona galerías y material multimedia' },
    { label: 'Municipios', route: '/administrador/municipios', icon: 'municipios', description: 'Cobertura y estadísticas por municipio' },
    { label: 'Roles', route: '/administrador/roles', icon: 'roles', description: 'Permisos y roles habilitados en Renfi' },
  ];

  sidebarColapsado = false;
  tituloActual = 'Inicio';
  descripcionActual = 'Resumen general y reportes clave';

  private readonly destroy$ = new Subject<void>();
  private detachResponsiveListener?: () => void;
  private compacto?: MediaQueryList;

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    this.configurarColapsoInicial();
    this.actualizarSeccionActiva(this.router.url);

    this.router.events
      .pipe(takeUntil(this.destroy$))
      .subscribe((evento) => {
        if (evento instanceof NavigationEnd) {
          this.actualizarSeccionActiva(evento.urlAfterRedirects);
          // En móvil el menú es un panel superpuesto: se cierra al navegar.
          if (this.compacto?.matches) {
            this.sidebarColapsado = true;
          }
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

    const preferCompact = window.matchMedia('(max-width: 1023.98px)');
    this.compacto = preferCompact;
    this.sidebarColapsado = preferCompact.matches;

    const listener = (event: MediaQueryListEvent) => {
      this.sidebarColapsado = event.matches;
    };

    preferCompact.addEventListener('change', listener);
    this.detachResponsiveListener = () => preferCompact.removeEventListener('change', listener);
  }

  private actualizarSeccionActiva(url: string): void {
    const limpio = url.split('?')[0];
    // '/administrador' es prefijo de todas las rutas: solo coincide exacto.
    const encontrado = this.navLinks.find((link) =>
      limpio === link.route || (link.route !== '/administrador' && limpio.startsWith(`${link.route}/`))
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
