import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

interface DuenoNavLink {
  label: string;
  route: string;
  icon: 'inicio' | 'fincas' | 'reservas' | 'ingresos';
  description: string;
}

@Component({
  selector: 'app-dueno',
  standalone: false,
  templateUrl: './dueno.html',
  // Misma carcasa que el panel de administración
  styleUrl: '../administrador/administrador.css'
})
export class Dueno implements OnInit, OnDestroy {
  readonly navLinks: DuenoNavLink[] = [
    { label: 'Resumen', route: '/mi-finca', icon: 'inicio', description: 'Cómo va tu negocio de un vistazo' },
    { label: 'Mis fincas', route: '/mi-finca/fincas', icon: 'fincas', description: 'Crea tus fincas y personaliza fotos, comodidades y reglas' },
    { label: 'Reservas', route: '/mi-finca/reservas', icon: 'reservas', description: 'Reservas recibidas: confirma, finaliza o cancela' },
    { label: 'Ingresos', route: '/mi-finca/ingresos', icon: 'ingresos', description: 'Pagos recibidos por tus fincas' }
  ];

  sidebarColapsado = false;
  tituloActual = 'Resumen';
  descripcionActual = this.navLinks[0].description;

  private readonly destroy$ = new Subject<void>();
  private detachResponsiveListener?: () => void;
  private compacto?: MediaQueryList;

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    this.configurarColapsoInicial();
    this.actualizarSeccionActiva(this.router.url);

    this.router.events.pipe(takeUntil(this.destroy$)).subscribe((evento) => {
      if (evento instanceof NavigationEnd) {
        this.actualizarSeccionActiva(evento.urlAfterRedirects);
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
    const compacto = window.matchMedia('(max-width: 1023.98px)');
    this.compacto = compacto;
    this.sidebarColapsado = compacto.matches;
    const listener = (e: MediaQueryListEvent) => (this.sidebarColapsado = e.matches);
    compacto.addEventListener('change', listener);
    this.detachResponsiveListener = () => compacto.removeEventListener('change', listener);
  }

  private actualizarSeccionActiva(url: string): void {
    const limpio = url.split('?')[0];
    const encontrado = this.navLinks.find((l) => limpio === l.route || (l.route !== '/mi-finca' && limpio.startsWith(`${l.route}/`)));
    const actual = encontrado ?? this.navLinks[0];
    this.tituloActual = actual.label;
    this.descripcionActual = actual.description;
  }
}
