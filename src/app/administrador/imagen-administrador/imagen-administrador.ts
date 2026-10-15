import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

import { ImagenService } from '../../core/services/imagen.service';
import { ImagenFinca } from '../../core/models/imagen.model';
import { AdminApiService } from '../services/admin-api.service';

interface FincaOpcion {
  id: number;
  nombre: string;
}

/**
 * Galería de imágenes por finca: subir archivos, elegir la portada y eliminar.
 * Las imágenes se alojan en Supabase Storage a través de la API (máx. 10 por finca, 5 MB cada una).
 */
@Component({
  selector: 'app-imagen-administrador',
  standalone: false,
  templateUrl: './imagen-administrador.html',
  styleUrl: './imagen-administrador.css'
})
export class ImagenAdministrador implements OnInit, OnDestroy {
  readonly maxImagenes = ImagenService.MAX_IMAGENES_POR_FINCA;

  fincas: FincaOpcion[] = [];
  fincaId: number | null = null;
  galeria: ImagenFinca[] = [];

  cargandoFincas = true;
  cargandoGaleria = false;
  subiendo = false;
  ocupada: number | null = null;
  porEliminar: ImagenFinca | null = null;

  textoAlternativo = '';
  esPortada = false;

  error = '';
  aviso = '';

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly imagenService: ImagenService,
    private readonly api: AdminApiService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.api
      .list<any[]>('finca')
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.cargandoFincas = false))
      )
      .subscribe({
        next: (fincas) => {
          this.fincas = (Array.isArray(fincas) ? fincas : [])
            .map((f) => ({ id: Number(f.IdFinca), nombre: String(f.NombreFinca ?? `Finca ${f.IdFinca}`) }))
            .filter((f) => Number.isInteger(f.id))
            .sort((a, b) => a.nombre.localeCompare(b.nombre));
        },
        error: (err: Error) => (this.error = err.message || 'No se pudieron cargar las fincas.')
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get lleno(): boolean {
    return this.galeria.length >= this.maxImagenes;
  }

  get nombreFincaActual(): string {
    return this.fincas.find((f) => f.id === this.fincaId)?.nombre ?? '';
  }

  seleccionarFinca(valor: string): void {
    const id = Number(valor);
    this.fincaId = Number.isInteger(id) && id > 0 ? id : null;
    this.error = '';
    this.aviso = '';
    this.galeria = [];
    if (this.fincaId) {
      this.cargarGaleria();
    }
  }

  cargarGaleria(): void {
    if (!this.fincaId) {
      return;
    }
    this.cargandoGaleria = true;
    this.imagenService
      .getGaleria(this.fincaId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.cargandoGaleria = false))
      )
      .subscribe({
        next: (galeria) => (this.galeria = galeria),
        error: (err) => (this.error = err?.error?.message || 'No se pudo cargar la galería.')
      });
  }

  onArchivoElegido(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    input.value = ''; // permite volver a elegir el mismo archivo
    if (!archivo || !this.fincaId) {
      return;
    }

    this.error = '';
    this.aviso = '';
    if (this.lleno) {
      this.error = `Alcanzaste el máximo de ${this.maxImagenes} imágenes. Elimina alguna para subir otra.`;
      return;
    }

    this.subiendo = true;
    this.imagenService
      .subirImagen(this.fincaId, archivo, { textoAlternativo: this.textoAlternativo, esPortada: this.esPortada })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.subiendo = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: () => {
          this.aviso = 'Imagen subida correctamente.';
          this.textoAlternativo = '';
          this.esPortada = false;
          this.cargarGaleria();
        },
        error: (err: Error) => (this.error = err.message)
      });
  }

  hacerPortada(imagen: ImagenFinca): void {
    const id = Number(imagen.IdImagen);
    this.error = '';
    this.aviso = '';
    this.ocupada = id;
    this.imagenService
      .establecerPortada(id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.ocupada = null))
      )
      .subscribe({
        next: () => {
          this.aviso = 'Portada actualizada.';
          this.cargarGaleria();
        },
        error: (err: Error) => (this.error = err.message)
      });
  }

  pedirEliminar(imagen: ImagenFinca): void {
    this.porEliminar = imagen;
  }

  cancelarEliminar(): void {
    this.porEliminar = null;
  }

  confirmarEliminar(): void {
    const imagen = this.porEliminar;
    if (!imagen) {
      return;
    }
    const id = Number(imagen.IdImagen);
    this.error = '';
    this.aviso = '';
    this.ocupada = id;
    this.imagenService
      .eliminar(id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.ocupada = null;
          this.porEliminar = null;
        })
      )
      .subscribe({
        next: () => {
          this.aviso = 'Imagen eliminada.';
          this.cargarGaleria();
        },
        error: (err: Error) => (this.error = err.message)
      });
  }

  trackById(_: number, imagen: ImagenFinca): unknown {
    return imagen.IdImagen;
  }
}
