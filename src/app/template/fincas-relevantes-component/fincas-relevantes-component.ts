import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FincaDetalle, FincaSeleccionadaService, mapearFinca } from '../services/finca-seleccionada.service';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-fincas-relevantes-component',
  standalone: false,
  templateUrl: './fincas-relevantes-component.html',
  styleUrl: './fincas-relevantes-component.css'
})
export class FincasRelevantesComponent implements OnInit, AfterViewInit, OnDestroy {
  fincas: FincaDetalle[] = [];
  cargando = false;
  errorApi = false;
  translateX = 0;
  currentIndex = 0;
  dragging = false;
  dragStartX = 0;
  dragCurrentX = 0;
  touchDragging = false;
  touchStartX = 0;
  touchCurrentX = 0;
  cardWidth = 0;
  cardsPerView = 1;
  @ViewChild('carouselWrapper') private wrapperRef?: ElementRef<HTMLDivElement>;
  @ViewChild('carouselTrack') private trackRef?: ElementRef<HTMLDivElement>;
  @ViewChildren('carouselCard') private cardRefs?: QueryList<ElementRef<HTMLDivElement>>;
  private readonly apiBase = 'http://localhost:3000/api';
  private resizeObserver?: ResizeObserver;

  constructor(
    private http: HttpClient,
    private router: Router,
    private fincaSeleccionada: FincaSeleccionadaService
  ) {}

  ngOnInit() {
    this.cargarFincasRelevantes();
  }

  ngAfterViewInit(): void {
    this.setupObservers();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  cargarFincasRelevantes() {
    this.cargando = true;
    this.errorApi = false;
    this.http
      .get<any>(`${this.apiBase}/finca`)
      .pipe(
        map((resp) => this.normalizarColeccion(resp)),
        switchMap((fincasRaw) => {
          if (!fincasRaw.length) {
            return of([] as Array<{ detalle: FincaDetalle; raw: any; imagenes: any[] }>);
          }

          const solicitudes = fincasRaw.map((raw, index) => {
            const detalle = mapearFinca(raw, index);
            const idConsulta = this.obtenerIdFincaParaConsulta(detalle, raw);

            if (!idConsulta) {
              return of({ detalle, imagenes: [] as any[] });
            }

            return this.http
              .get<any>(`${this.apiBase}/imagen/finca/${encodeURIComponent(idConsulta)}`)
              .pipe(
                map((resp) => this.normalizarColeccion(resp)),
                catchError(() => of([] as any[])),
                map((imagenes) => ({ detalle, imagenes }))
              );
          });

          return forkJoin(solicitudes);
        })
      )
      .subscribe({
        next: (resultados) => {
          this.fincas = resultados.map(({ detalle, imagenes }) => this.aplicarImagenes(detalle, imagenes));
          this.currentIndex = 0;
          this.updateTranslateX();
          this.cargando = false;
        },
        error: () => {
          this.fincas = [];
          this.currentIndex = 0;
          this.updateTranslateX();
          this.cargando = false;
          this.errorApi = true;
        }
      });
  }

  verDetalle(finca: FincaDetalle) {
    if (!finca) {
      return;
    }

    this.fincaSeleccionada.setFinca(finca);
    const idSegment = finca.id ? encodeURIComponent(finca.id) : 'sin-id';
    this.router.navigate(['/fincas', idSegment]);
  }

  prevSlide() {
    if (this.currentIndex <= 0) {
      return;
    }

    const paso = Math.max(1, this.cardsPerView);
    this.currentIndex = Math.max(0, this.currentIndex - paso);
    this.updateTranslateX();
  }

  nextSlide() {
    const maxIndex = this.getMaxIndex();
    if (this.currentIndex >= maxIndex) {
      return;
    }

    const paso = Math.max(1, this.cardsPerView);
    this.currentIndex = Math.min(maxIndex, this.currentIndex + paso);
    this.updateTranslateX();
  }

  updateTranslateX() {
    const maxIndex = this.getMaxIndex();
    if (!this.cardWidth) {
      this.translateX = 0;
      return;
    }

    this.currentIndex = Math.max(0, Math.min(this.currentIndex, maxIndex));
    const maxTranslate = -maxIndex * this.cardWidth;
    const target = -this.currentIndex * this.cardWidth;
    this.translateX = this.clampTranslate(target, maxTranslate);
  }

  onDragStart(event: MouseEvent) {
    this.dragging = true;
    this.dragStartX = event.clientX;
    this.dragCurrentX = this.translateX;
    this.setCursor('grabbing');
  }

  onDragMove(event: MouseEvent) {
    if (!this.dragging) {
      return;
    }

    const delta = event.clientX - this.dragStartX;
    this.translateX = this.clampTranslate(this.dragCurrentX + delta);
  }

  onDragEnd(event: MouseEvent) {
    if (!this.dragging) {
      return;
    }

    this.dragging = false;
    this.setCursor('grab');
    this.snapToNearestSlide();
  }

  onTouchStart(event: TouchEvent) {
    this.touchDragging = true;
    this.touchStartX = event.touches[0].clientX;
    this.touchCurrentX = this.translateX;
  }

  onTouchMove(event: TouchEvent) {
    if (!this.touchDragging) {
      return;
    }

    const delta = event.touches[0].clientX - this.touchStartX;
    this.translateX = this.clampTranslate(this.touchCurrentX + delta);
  }

  onTouchEnd(event: TouchEvent) {
    if (!this.touchDragging) {
      return;
    }

    this.touchDragging = false;
    this.snapToNearestSlide();
  }

  onWheel(event: WheelEvent) {
    if (!this.fincas.length || !this.cardWidth) {
      return;
    }

    const maxIndex = this.getMaxIndex();
    if (maxIndex === 0) {
      return;
    }

    event.preventDefault();

    const deltaPrincipal = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
    if (!deltaPrincipal) {
      return;
    }

    const direction = deltaPrincipal > 0 ? 1 : -1;
    const magnitud = Math.max(1, Math.round(Math.abs(deltaPrincipal) / 120));
    const pasoBase = Math.max(1, this.cardsPerView);
    const paso = Math.min(maxIndex, pasoBase * magnitud * (event.shiftKey ? 2 : 1));

    const nuevoIndice = this.currentIndex + direction * paso;
    this.currentIndex = Math.max(0, Math.min(maxIndex, nuevoIndice));
    this.updateTranslateX();
  }

  private setupObservers(): void {
    if (this.cardRefs) {
      this.cardRefs.changes.subscribe(() => this.measureCarousel());
    }

    Promise.resolve().then(() => this.measureCarousel());

    if (this.wrapperRef) {
      this.resizeObserver = new ResizeObserver(() => this.measureCarousel());
      this.resizeObserver.observe(this.wrapperRef.nativeElement);
    }
  }

  private measureCarousel(): void {
    if (!this.cardRefs || !this.cardRefs.length || !this.wrapperRef) {
      return;
    }

    const firstCard = this.cardRefs.first.nativeElement as HTMLElement;
    const trackEl = this.trackRef?.nativeElement;
    const cardRect = firstCard.getBoundingClientRect();
    const gap = trackEl ? this.getGap(trackEl) : 0;
    const cardWidth = cardRect.width + gap;

    if (!cardWidth || !Number.isFinite(cardWidth)) {
      return;
    }

    this.cardWidth = cardWidth;
    const wrapperWidth = this.wrapperRef.nativeElement.getBoundingClientRect().width;
    this.cardsPerView = Math.max(1, Math.floor(wrapperWidth / this.cardWidth));
    this.currentIndex = Math.min(this.currentIndex, this.getMaxIndex());
    this.updateTranslateX();
  }

  private getGap(element: HTMLElement): number {
    const styles = getComputedStyle(element);
    const gapValue = styles.columnGap || styles.gap || '0';
    const parsed = Number.parseFloat(gapValue);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  private getMaxIndex(): number {
    return Math.max(0, this.fincas.length - this.cardsPerView);
  }

  private clampTranslate(target: number, minTranslate?: number): number {
    const min = minTranslate !== undefined ? minTranslate : -this.cardWidth * this.getMaxIndex();
    if (!Number.isFinite(min)) {
      return 0;
    }
    return Math.min(0, Math.max(min, target));
  }

  private snapToNearestSlide(): void {
    if (!this.cardWidth) {
      this.translateX = 0;
      return;
    }

    const rawIndex = Math.round(-this.translateX / this.cardWidth);
    this.currentIndex = Math.max(0, Math.min(this.getMaxIndex(), rawIndex));
    this.updateTranslateX();
  }

  private setCursor(type: 'grab' | 'grabbing'): void {
    if (!this.trackRef) {
      return;
    }
    this.trackRef.nativeElement.style.cursor = type;
  }

  private aplicarImagenes(finca: FincaDetalle, imagenes: any[]): FincaDetalle {
    const urls = this.extraerUrlsImagenes(imagenes);

    if (!urls.length) {
      return finca;
    }

    const existentes = Array.isArray(finca.imagenesDisponibles) ? finca.imagenesDisponibles : [];
    const conjunto = new Set<string>([...urls, ...existentes]);
    const lista = Array.from(conjunto);

    return {
      ...finca,
      imagenUrl: urls[0] ?? finca.imagenUrl,
      imagenesDisponibles: lista
    };
  }

  private normalizarColeccion<T>(entrada: T | T[] | null | undefined): T[] {
    if (!entrada) {
      return [];
    }
    return Array.isArray(entrada) ? entrada : [entrada];
  }

  private extraerUrlsImagenes(imagenes: any[]): string[] {
    if (!Array.isArray(imagenes)) {
      return [];
    }

    const claves = ['UrlImagen', 'urlImagen', 'Imagen', 'imagen', 'Url', 'url'];
    const urls: string[] = [];

    imagenes.forEach((entrada) => {
      if (!entrada) {
        return;
      }

      if (typeof entrada === 'string') {
        const limpia = entrada.trim();
        if (limpia && !urls.includes(limpia)) {
          urls.push(limpia);
        }
        return;
      }

      for (const clave of claves) {
        const valor = entrada[clave];
        if (typeof valor === 'string') {
          const limpia = valor.trim();
          if (limpia && !urls.includes(limpia)) {
            urls.push(limpia);
            break;
          }
        }
      }
    });

    return urls;
  }

  private obtenerIdFincaParaConsulta(finca: FincaDetalle, fuenteOriginal: any): string | null {
    const candidatos = [
      fuenteOriginal?.IdFinca,
      fuenteOriginal?.Idfinca,
      fuenteOriginal?.idFinca,
      fuenteOriginal?.FincaId,
      fuenteOriginal?.fincaId,
      fuenteOriginal?.Id,
      fuenteOriginal?.id,
      finca.id
    ];

    for (const candidato of candidatos) {
      if (candidato !== undefined && candidato !== null && `${candidato}`.trim() !== '') {
        return String(candidato);
      }
    }

    return null;
  }
}

