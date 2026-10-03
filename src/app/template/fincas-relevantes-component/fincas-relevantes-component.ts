import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FincaService } from '../../core/services/finca.service';
import { Router } from '@angular/router';
import { FincaDetalle, FincaSeleccionadaService, PLACEHOLDER_FINCA } from '../services/finca-seleccionada.service';

@Component({
  selector: 'app-fincas-relevantes-component',
  standalone: false,
  templateUrl: './fincas-relevantes-component.html',
  styleUrl: './fincas-relevantes-component.css'
})
export class FincasRelevantesComponent implements OnInit {
  readonly placeholderImagen = PLACEHOLDER_FINCA;
  fincas: FincaDetalle[] = [];
  cargando = false;
  errorApi = false;
  alInicio = true;
  alFinal = true;

  @ViewChild('track') private trackRef?: ElementRef<HTMLUListElement>;

  constructor(
    private fincaService: FincaService,
    private router: Router,
    private fincaSeleccionada: FincaSeleccionadaService
  ) {}

  ngOnInit() {
    this.cargarFincasRelevantes();
  }

  onImageError(finca: FincaDetalle): void {
    if (finca) {
      finca.imagenUrl = this.placeholderImagen;
    }
  }

  cargarFincasRelevantes() {
    this.cargando = true;
    this.errorApi = false;
    this.fincaService.getFincasConImagenes().subscribe({
      next: (fincas) => {
        this.fincas = fincas as FincaDetalle[];
        this.cargando = false;
        // El track se pinta en el siguiente ciclo; medir después.
        setTimeout(() => this.actualizarExtremos());
      },
      error: () => {
        this.fincas = [];
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

  desplazar(direccion: 1 | -1): void {
    const track = this.trackRef?.nativeElement;
    track?.scrollBy({ left: direccion * track.clientWidth * 0.9, behavior: 'smooth' });
  }

  @HostListener('window:resize')
  actualizarExtremos(): void {
    const track = this.trackRef?.nativeElement;
    if (!track) {
      this.alInicio = this.alFinal = true;
      return;
    }
    this.alInicio = track.scrollLeft <= 2;
    this.alFinal = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
  }
}
