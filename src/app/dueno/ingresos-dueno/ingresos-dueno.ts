import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { PagoDueno } from '../../core/models/gestion-finca.model';
import { GestionFincasService } from '../../core/services/gestion-fincas.service';

interface ResumenFinca {
  nombre: string;
  cobrado: number;
  pendiente: number;
  pagos: number;
}

@Component({
  selector: 'app-ingresos-dueno',
  standalone: false,
  templateUrl: './ingresos-dueno.html',
  styleUrls: ['../../administrador/shared/panel.css', './ingresos-dueno.css']
})
export class IngresosDueno implements OnInit, OnDestroy {
  pagos: PagoDueno[] = [];
  resumen: ResumenFinca[] = [];
  totalCobrado = 0;
  totalPendiente = 0;
  cargando = true;
  error = '';

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
      .listarMisPagos()
      .pipe(takeUntil(this.destroy$), finalize(() => (this.cargando = false)))
      .subscribe({
        next: (lista) => {
          this.pagos = lista;
          this.calcular();
        },
        error: (err: Error) => (this.error = err.message)
      });
  }

  esPagado(p: PagoDueno): boolean {
    return String(p.EstadoPago ?? '').toLowerCase() === 'pagado';
  }

  private calcular(): void {
    const porFinca = new Map<string, ResumenFinca>();
    this.totalCobrado = 0;
    this.totalPendiente = 0;
    for (const p of this.pagos) {
      const nombre = p.NombreFinca ?? 'Sin finca';
      const fila = porFinca.get(nombre) ?? { nombre, cobrado: 0, pendiente: 0, pagos: 0 };
      const monto = Number(p.Monto ?? 0);
      fila.pagos++;
      if (this.esPagado(p)) {
        fila.cobrado += monto;
        this.totalCobrado += monto;
      } else {
        fila.pendiente += monto;
        this.totalPendiente += monto;
      }
      porFinca.set(nombre, fila);
    }
    this.resumen = [...porFinca.values()].sort((a, b) => b.cobrado - a.cobrado);
  }

  trackPago = (_: number, p: PagoDueno) => p.IdPago;
}
