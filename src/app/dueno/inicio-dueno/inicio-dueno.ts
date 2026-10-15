import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, forkJoin, of } from 'rxjs';
import { catchError, finalize, takeUntil } from 'rxjs/operators';
import { FincaGestion, PagoDueno, ReservaDueno } from '../../core/models/gestion-finca.model';
import { GestionFincasService } from '../../core/services/gestion-fincas.service';
import { AuthStateService } from '../../template/services/auth-state.service';

interface Paso {
  titulo: string;
  detalle: string;
  hecho: boolean;
  ruta: string;
  accion: string;
}

@Component({
  selector: 'app-inicio-dueno',
  standalone: false,
  templateUrl: './inicio-dueno.html',
  styleUrls: ['../../administrador/shared/panel.css', './inicio-dueno.css']
})
export class InicioDueno implements OnInit, OnDestroy {
  nombre = '';
  fincas: FincaGestion[] = [];
  reservas: ReservaDueno[] = [];
  pagos: PagoDueno[] = [];
  cargando = true;
  error = '';

  private readonly destroy$ = new Subject<void>();

  constructor(private readonly gestion: GestionFincasService, private readonly authState: AuthStateService) {}

  ngOnInit(): void {
    this.nombre = this.authState.getSnapshot()?.NombreUsuario ?? '';
    forkJoin({
      fincas: this.gestion.listarFincas('dueno'),
      // Si reservas o pagos fallan no se tumba el resumen entero
      reservas: this.gestion.listarMisReservas().pipe(catchError(() => of([] as ReservaDueno[]))),
      pagos: this.gestion.listarMisPagos().pipe(catchError(() => of([] as PagoDueno[])))
    })
      .pipe(takeUntil(this.destroy$), finalize(() => (this.cargando = false)))
      .subscribe({
        next: ({ fincas, reservas, pagos }) => {
          this.fincas = fincas;
          this.reservas = reservas;
          this.pagos = pagos;
        },
        error: (err: Error) => (this.error = err.message)
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private estado(r: ReservaDueno): string {
    return String(r.Estado ?? 'Activa').toLowerCase();
  }

  get porConfirmar(): number {
    return this.reservas.filter((r) => this.estado(r) === 'activa').length;
  }

  get fincasDisponibles(): number {
    return this.fincas.filter((f) => f.Estado === 'Disponible').length;
  }

  get cobrado(): number {
    return this.pagos.filter((p) => String(p.EstadoPago ?? '').toLowerCase() === 'pagado').reduce((s, p) => s + Number(p.Monto ?? 0), 0);
  }

  get proximas(): ReservaDueno[] {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return this.reservas
      .filter((r) => ['activa', 'confirmada'].includes(this.estado(r)) && new Date(r.FechaSalida) >= hoy)
      .sort((a, b) => new Date(a.FechaEntrada).getTime() - new Date(b.FechaEntrada).getTime())
      .slice(0, 5);
  }

  /** Guía de arranque: se muestra mientras falte algo para recibir reservas. */
  get pasos(): Paso[] {
    return [
      {
        titulo: 'Publica tu primera finca',
        detalle: 'Nombre, municipio, precio por noche y capacidad.',
        hecho: this.fincas.length > 0,
        ruta: '/mi-finca/fincas',
        accion: 'Crear finca'
      },
      {
        titulo: 'Sube las fotos',
        detalle: 'Las fincas con fotos reciben muchas más reservas.',
        hecho: this.fincas.length > 0 && this.fincas.every((f) => (f.Imagenes?.length ?? 0) > 0),
        ruta: '/mi-finca/fincas',
        accion: 'Agregar fotos'
      },
      {
        titulo: 'Déjala disponible',
        detalle: 'Una finca en pausa no recibe reservas nuevas.',
        hecho: this.fincasDisponibles > 0,
        ruta: '/mi-finca/fincas',
        accion: 'Revisar'
      },
      {
        titulo: 'Recibe tu primera reserva',
        detalle: 'Aparecerá en Reservas para que la confirmes.',
        hecho: this.reservas.length > 0,
        ruta: '/mi-finca/reservas',
        accion: 'Ver reservas'
      }
    ];
  }

  get guiaCompleta(): boolean {
    return this.pasos.every((p) => p.hecho);
  }

  cliente(r: ReservaDueno): string {
    return [r.NombreCliente, r.ApellidoCliente].filter(Boolean).join(' ') || 'Cliente';
  }
}
