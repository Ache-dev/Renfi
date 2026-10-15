import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ReservaDueno } from '../../core/models/gestion-finca.model';
import { GestionFincasService } from '../../core/services/gestion-fincas.service';

type Filtro = 'todas' | 'Activa' | 'Confirmada' | 'Finalizada' | 'Cancelada';

interface Cambio {
  reserva: ReservaDueno;
  estado: 'Confirmada' | 'Finalizada' | 'Cancelada';
}

@Component({
  selector: 'app-reservas-dueno',
  standalone: false,
  templateUrl: './reservas-dueno.html',
  styleUrls: ['../../administrador/shared/panel.css', './reservas-dueno.css']
})
export class ReservasDueno implements OnInit, OnDestroy {
  readonly filtros: { id: Filtro; label: string }[] = [
    { id: 'todas', label: 'Todas' },
    { id: 'Activa', label: 'Por confirmar' },
    { id: 'Confirmada', label: 'Confirmadas' },
    { id: 'Finalizada', label: 'Finalizadas' },
    { id: 'Cancelada', label: 'Canceladas' }
  ];

  reservas: ReservaDueno[] = [];
  filtro: Filtro = 'todas';
  cargando = true;
  error = '';
  aviso = '';
  ocupadaId: number | null = null;
  pendiente: Cambio | null = null;

  private readonly destroy$ = new Subject<void>();

  constructor(private readonly gestion: GestionFincasService) {}

  ngOnInit(): void {
    this.cargar();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargar(): void {
    this.cargando = true;
    this.error = '';
    this.gestion
      .listarMisReservas()
      .pipe(takeUntil(this.destroy$), finalize(() => (this.cargando = false)))
      .subscribe({
        next: (lista) => (this.reservas = lista),
        error: (err: Error) => (this.error = err.message)
      });
  }

  get visibles(): ReservaDueno[] {
    return this.filtro === 'todas' ? this.reservas : this.reservas.filter((r) => this.estadoDe(r) === this.filtro);
  }

  contar(filtro: Filtro): number {
    return filtro === 'todas' ? this.reservas.length : this.reservas.filter((r) => this.estadoDe(r) === filtro).length;
  }

  estadoDe(r: ReservaDueno): string {
    const e = String(r.Estado ?? 'Activa').toLowerCase();
    return e.startsWith('cancel') || e.startsWith('anul') ? 'Cancelada' : e.charAt(0).toUpperCase() + e.slice(1);
  }

  etiqueta(r: ReservaDueno): string {
    return this.estadoDe(r) === 'Activa' ? 'Por confirmar' : this.estadoDe(r);
  }

  claseEstado(r: ReservaDueno): string {
    switch (this.estadoDe(r)) {
      case 'Confirmada': return 'badge--success';
      case 'Cancelada': return 'badge--danger';
      case 'Finalizada': return '';
      default: return 'badge--warning';
    }
  }

  noches(r: ReservaDueno): number {
    const ms = new Date(r.FechaSalida).getTime() - new Date(r.FechaEntrada).getTime();
    return Math.max(1, Math.round(ms / 86_400_000));
  }

  cliente(r: ReservaDueno): string {
    return [r.NombreCliente, r.ApellidoCliente].filter(Boolean).join(' ') || 'Cliente sin datos';
  }

  puede(r: ReservaDueno, accion: Cambio['estado']): boolean {
    const e = this.estadoDe(r);
    if (accion === 'Confirmada') return e === 'Activa';
    if (accion === 'Finalizada') return e === 'Confirmada';
    return e === 'Activa' || e === 'Confirmada';
  }

  pedir(reserva: ReservaDueno, estado: Cambio['estado']): void {
    // Confirmar y finalizar son directos; cancelar pide confirmación
    if (estado === 'Cancelada') {
      this.pendiente = { reserva, estado };
    } else {
      this.aplicar({ reserva, estado });
    }
  }

  cancelarPendiente(): void {
    this.pendiente = null;
  }

  confirmarPendiente(): void {
    const cambio = this.pendiente;
    this.pendiente = null;
    if (cambio) {
      this.aplicar(cambio);
    }
  }

  private aplicar({ reserva, estado }: Cambio): void {
    this.ocupadaId = reserva.IdReserva;
    this.error = '';
    this.aviso = '';
    this.gestion
      .cambiarEstadoReserva(reserva.IdReserva, estado)
      .pipe(takeUntil(this.destroy$), finalize(() => (this.ocupadaId = null)))
      .subscribe({
        next: () => {
          reserva.Estado = estado;
          this.aviso = `Reserva #${reserva.IdReserva}: ${estado.toLowerCase()}.`;
        },
        error: (err: Error) => (this.error = err.message)
      });
  }

  trackReserva = (_: number, r: ReservaDueno) => r.IdReserva;
}
