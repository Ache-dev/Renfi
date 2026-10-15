import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { Subject, concat, from, of } from 'rxjs';
import { catchError, concatMap, finalize, takeUntil, toArray } from 'rxjs/operators';
import { ImagenGestion } from '../../../core/models/gestion-finca.model';
import { GestionFincasService } from '../../../core/services/gestion-fincas.service';

export const MAX_IMAGENES = 10;
const MAX_BYTES = 5 * 1024 * 1024;
const TIPOS = ['image/jpeg', 'image/png', 'image/webp'];

@Component({
  selector: 'app-galeria-finca',
  standalone: false,
  templateUrl: './galeria-finca.html',
  styleUrls: ['../panel.css', './galeria-finca.css']
})
export class GaleriaFincaComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) idFinca!: number;
  /** Se emite cada vez que la galería cambia (subir, borrar, portada…). */
  @Output() readonly cambio = new EventEmitter<ImagenGestion[]>();

  readonly maxImagenes = MAX_IMAGENES;
  imagenes: ImagenGestion[] = [];
  cargando = false;
  subiendo = false;
  ocupadaId: number | null = null;
  arrastrando = false;
  error = '';
  avisos: string[] = [];
  porBorrar: ImagenGestion | null = null;

  private readonly destroy$ = new Subject<void>();

  constructor(private readonly gestion: GestionFincasService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idFinca'] && this.idFinca) {
      this.cargar();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get cupo(): number {
    return Math.max(0, MAX_IMAGENES - this.imagenes.length);
  }

  cargar(notificar = false): void {
    this.cargando = true;
    this.error = '';
    this.gestion
      .listarImagenes(this.idFinca)
      .pipe(takeUntil(this.destroy$), finalize(() => (this.cargando = false)))
      .subscribe({
        next: (lista) => {
          // La API entrega la portada primero y luego por orden
          this.imagenes = lista;
          if (notificar) {
            this.cambio.emit(lista);
          }
        },
        error: (err: Error) => (this.error = err.message)
      });
  }

  alSeleccionar(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    this.subir(Array.from(input.files ?? []));
    input.value = '';
  }

  alSoltar(evento: DragEvent): void {
    evento.preventDefault();
    this.arrastrando = false;
    this.subir(Array.from(evento.dataTransfer?.files ?? []));
  }

  alArrastrar(evento: DragEvent, dentro: boolean): void {
    evento.preventDefault();
    this.arrastrando = dentro;
  }

  private subir(archivos: File[]): void {
    this.avisos = [];
    this.error = '';
    if (!archivos.length || this.subiendo) {
      return;
    }

    const validos: File[] = [];
    for (const archivo of archivos) {
      if (!TIPOS.includes(archivo.type)) {
        this.avisos.push(`"${archivo.name}": solo se admiten imágenes JPG, PNG o WebP.`);
      } else if (archivo.size > MAX_BYTES) {
        this.avisos.push(`"${archivo.name}": supera los 5 MB.`);
      } else {
        validos.push(archivo);
      }
    }

    if (validos.length > this.cupo) {
      this.avisos.push(`Solo caben ${this.cupo} foto(s) más (máximo ${MAX_IMAGENES}); se omiten las sobrantes.`);
    }
    const aSubir = validos.slice(0, this.cupo);
    if (!aSubir.length) {
      return;
    }

    this.subiendo = true;
    // Una por una: la API asigna el orden y la portada según llegan
    from(aSubir)
      .pipe(
        concatMap((archivo) =>
          this.gestion.subirImagen(this.idFinca, archivo).pipe(
            catchError((err: Error) => {
              this.avisos.push(`"${archivo.name}": ${err.message}`);
              return of(null);
            })
          )
        ),
        toArray(),
        takeUntil(this.destroy$),
        finalize(() => {
          this.subiendo = false;
          this.cargar(true);
        })
      )
      .subscribe();
  }

  hacerPortada(imagen: ImagenGestion): void {
    this.ejecutar(imagen, this.gestion.actualizarImagen(imagen.IdImagen, { EsPortada: true }));
  }

  guardarTexto(imagen: ImagenGestion, texto: string): void {
    const limpio = texto.trim();
    if (limpio === (imagen.TextoAlternativo ?? '')) {
      return;
    }
    this.ejecutar(imagen, this.gestion.actualizarImagen(imagen.IdImagen, { TextoAlternativo: limpio }));
  }

  /** Intercambia el orden con la foto anterior o siguiente (la portada siempre va primero). */
  mover(imagen: ImagenGestion, direccion: -1 | 1): void {
    const indice = this.imagenes.indexOf(imagen);
    const vecina = this.imagenes[indice + direccion];
    if (!vecina || vecina.EsPortada || imagen.EsPortada) {
      return;
    }
    this.ocupadaId = imagen.IdImagen;
    concat(
      this.gestion.actualizarImagen(imagen.IdImagen, { Orden: vecina.Orden }),
      this.gestion.actualizarImagen(vecina.IdImagen, { Orden: imagen.Orden })
    )
      .pipe(takeUntil(this.destroy$), toArray(), finalize(() => (this.ocupadaId = null)))
      .subscribe({
        next: () => this.cargar(true),
        error: (err: Error) => (this.error = err.message)
      });
  }

  pedirBorrado(imagen: ImagenGestion): void {
    this.porBorrar = imagen;
  }

  cancelarBorrado(): void {
    this.porBorrar = null;
  }

  confirmarBorrado(): void {
    const imagen = this.porBorrar;
    this.porBorrar = null;
    if (imagen) {
      this.ejecutar(imagen, this.gestion.eliminarImagen(imagen.IdImagen));
    }
  }

  puedeSubir(imagen: ImagenGestion, direccion: -1 | 1): boolean {
    const vecina = this.imagenes[this.imagenes.indexOf(imagen) + direccion];
    return !imagen.EsPortada && !!vecina && !vecina.EsPortada;
  }

  trackImagen = (_: number, i: ImagenGestion) => i.IdImagen;

  private ejecutar(imagen: ImagenGestion, accion$: ReturnType<GestionFincasService['eliminarImagen']>): void {
    this.ocupadaId = imagen.IdImagen;
    this.error = '';
    accion$.pipe(takeUntil(this.destroy$), finalize(() => (this.ocupadaId = null))).subscribe({
      next: () => this.cargar(true),
      error: (err: Error) => (this.error = err.message)
    });
  }
}
