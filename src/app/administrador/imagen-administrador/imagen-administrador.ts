import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { FincaGestion } from '../../core/models/gestion-finca.model';
import { GestionFincasService } from '../../core/services/gestion-fincas.service';

@Component({
  selector: 'app-imagen-administrador',
  standalone: false,
  templateUrl: './imagen-administrador.html',
  styleUrls: ['../shared/panel.css', './imagen-administrador.css']
})
export class ImagenAdministrador implements OnInit, OnDestroy {
  fincas: FincaGestion[] = [];
  idFinca: number | null = null;
  cargando = true;
  error = '';

  private readonly destroy$ = new Subject<void>();

  constructor(private readonly gestion: GestionFincasService) {}

  ngOnInit(): void {
    this.gestion
      .listarFincas('admin')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (fincas) => {
          this.fincas = fincas;
          this.idFinca = fincas[0]?.IdFinca ?? null;
          this.cargando = false;
        },
        error: (err: Error) => {
          this.error = err.message;
          this.cargando = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  elegir(valor: string): void {
    this.idFinca = valor ? Number(valor) : null;
  }
}
