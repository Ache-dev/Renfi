import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject, forkJoin, of } from 'rxjs';
import { catchError, debounceTime, map, takeUntil } from 'rxjs/operators';
import { FincaDetalle, FincaSeleccionadaService, mapearFinca } from '../services/finca-seleccionada.service';

@Component({
  selector: 'app-inicio-component',
  standalone: false,
  templateUrl: './inicio-component.html',
  styleUrl: './inicio-component.css'
})
export class InicioComponent implements OnInit, OnDestroy {
  openWhatsapp() {
    window.open('https://w.app/c2laje', '_blank');
  }
  @ViewChild('queryInput') queryInput?: ElementRef<HTMLInputElement>;

  searchForm: FormGroup;
  searchOpen = false;
  loadingSearch = false;
  fincas: FincaDetalle[] = [];
  filteredFincas: FincaDetalle[] = [];
  displayedFincas: FincaDetalle[] = [];
  municipios: string[] = [];
  estados: string[] = [];
  maxCapacidad = 0;
  maxPrecio = 0;
  totalResultados = 0;
  mostrarTodosResultados = false;
  private readonly imagenesEndpoint = 'http://localhost:3000/api/imagen';
  readonly heroHighlights: Array<{ value: string; label: string }> = [
    { value: '12%', label: 'Rendimiento promedio anual proyectado' },
    { value: '+180', label: 'Inversionistas confían en Renfi' },
    { value: '92%', label: 'Ocupación promedio de las fincas' }
  ];
  readonly beneficios: Array<{ icon: string; title: string; description: string }> = [
    {
      icon: '📊',
      title: 'Due diligence integral',
      description: 'Evaluamos cada finca con métricas financieras, demanda turística y valuación de activos para reducir el riesgo.'
    },
    {
      icon: '🤝',
      title: 'Operación profesional',
      description: 'Administramos reservas, mantenimiento y hospitality con aliados certificados que maximizan la ocupación.'
    },
    {
      icon: '📈',
      title: 'Datos en tiempo real',
      description: 'Dashboards de desempeño, ROI y flujo de caja para que tomes decisiones informadas cuando lo necesites.'
    },
    {
      icon: '🌱',
      title: 'Impacto sostenible',
      description: 'Proyectos con enfoque rural, empleo local y experiencias auténticas que fortalecen las comunidades.'
    }
  ];
  readonly pasosInversion: Array<{ title: string; description: string; highlights: string[] }> = [
    {
      title: 'Identificación y análisis',
      description: 'Buscamos propiedades con alto potencial y realizamos estudios de mercado, legales y de riesgos.',
      highlights: ['Matemática de ingresos, ocupación y ticket promedio', 'Revisión jurídica y titulación completa']
    },
    {
      title: 'Modelado financiero',
      description: 'Construimos escenarios de inversión, CAPEX requerido y retornos estimados con sensibilidad a la demanda.',
      highlights: ['Proyecciones trimestrales de ROI', 'Plan de mejoras y costos operativos detallados']
    },
    {
      title: 'Implementación y lanzamiento',
      description: 'Coordinamos adecuaciones, branding y canales de comercialización para salir al mercado en semanas.',
      highlights: ['Manual de experiencia del huésped', 'Integración con OTAs y canales directos']
    },
    {
      title: 'Gestión y reporting',
      description: 'Monitoreo continuo, optimización de tarifas y reportes transparentes del desempeño del activo.',
      highlights: ['Dashboard en tiempo real', 'Reuniones estratégicas trimestrales']
    }
  ];
  readonly testimonios: Array<{ name: string; role: string; quote: string }> = [
    {
      name: 'Valeria Gómez',
      role: 'Inversionista desde 2021',
      quote: 'Diversifiqué mi portafolio con fincas y hoy recibo ingresos constantes con transparencia total.'
    },
    {
      name: 'Carlos Mejía',
      role: 'Empresario hotelero',
      quote: 'Renfi entiende la operación turística y convierte cada finca en una experiencia rentable para el huésped.'
    },
    {
      name: 'Laura Rueda',
      role: 'Gerente financiera',
      quote: 'Los reportes trimestrales me permiten proyectar el flujo de caja y planear nuevas inversiones.'
    }
  ];
  private readonly maxResultadosInicial = 12;
  private previousBodyOverflow = '';
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly fincaSeleccionada: FincaSeleccionadaService
  ) {
    this.searchForm = this.fb.group({
      query: [''],
      municipio: [''],
      estado: [''],
      capacidad: [null],
      precioMin: [null],
      precioMax: [null],
      calificacion: [null],
      ordenarPor: ['relevancia']
    });
  }

  ngOnInit(): void {
    this.cargarFincas();
    this.searchForm.valueChanges
      .pipe(debounceTime(180), takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.searchOpen) {
          this.mostrarTodosResultados = false;
          this.aplicarFiltros();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.restaurarScroll();
  }

  openSearch(): void {
    if (!this.searchOpen) {
      this.searchOpen = true;
      this.previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      if (!this.filteredFincas.length) {
        this.aplicarFiltros();
      }
      setTimeout(() => this.queryInput?.nativeElement.focus(), 120);
    }
  }

  closeSearch(): void {
    if (this.searchOpen) {
      this.searchOpen = false;
      this.mostrarTodosResultados = false;
      this.restaurarScroll();
    }
  }

  toggleSearch(): void {
    this.searchOpen ? this.closeSearch() : this.openSearch();
  }

  scrollToSection(id: string): void {
    if (!id) {
      return;
    }
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  resetFiltros(): void {
    this.searchForm.patchValue({
      query: '',
      municipio: '',
      estado: '',
      capacidad: null,
      precioMin: null,
      precioMax: null,
      calificacion: null,
      ordenarPor: 'relevancia'
    }, { emitEvent: false });
    this.mostrarTodosResultados = false;
    this.aplicarFiltros();
  }

  submitSearch(): void {
    this.aplicarFiltros(true);
  }

  mostrarMasResultados(): void {
    this.mostrarTodosResultados = true;
    this.aplicarFiltros(true);
  }

  seleccionarFinca(finca: FincaDetalle): void {
    if (!finca) {

      return;
    }


    this.fincaSeleccionada.setFinca(finca);
    const idSegment = finca.id ? encodeURIComponent(finca.id) : 'sin-id';

    this.closeSearch();
    this.router.navigate(['/fincas', idSegment]);
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    if (this.searchOpen) {
      this.closeSearch();
    }
  }

  private cargarFincas(): void {
    this.loadingSearch = true;
    this.http.get<any[]>('http://localhost:3000/api/finca').pipe(takeUntil(this.destroy$)).subscribe({
      next: respuesta => {
        const listaRaw = Array.isArray(respuesta) ? respuesta : [respuesta];
        this.fincas = listaRaw.map((raw, index) => mapearFinca(raw, index));
        this.prepararOpciones();
        this.filteredFincas = [...this.fincas];
        this.actualizarDisplay(this.fincas);
        this.enriquecerFincasConImagenes(listaRaw, this.fincas);
        this.loadingSearch = false;
      },
      error: () => {
        this.fincas = [];
        this.filteredFincas = [];
        this.displayedFincas = [];
        this.totalResultados = 0;
        this.loadingSearch = false;
      }
    });
  }

  private prepararOpciones(): void {
    const municipios = new Set<string>();
    const estados = new Set<string>();
    let maxCap = 0;
    let maxPrecio = 0;

    for (const finca of this.fincas) {
      const municipio = (finca['NombreMunicipio'] ?? finca.ubicacion ?? '').toString().trim();
      if (municipio) {
        municipios.add(this.capitalizarTexto(municipio));
      }

      const estado = (finca['Estado'] ?? '').toString().trim();
      if (estado) {
        estados.add(this.capitalizarTexto(estado));
      }

      const capacidad = finca.capacidad ?? Number(finca['Capacidad']) ?? 0;
      if (capacidad > maxCap) {
        maxCap = capacidad;
      }

      const precio = finca.precioNoche ?? Number(finca['Precio']) ?? 0;
      if (precio > maxPrecio) {
        maxPrecio = precio;
      }
    }

    this.municipios = Array.from(municipios).sort((a, b) => a.localeCompare(b, 'es')); 
    this.estados = Array.from(estados).sort((a, b) => a.localeCompare(b, 'es'));
    this.maxCapacidad = maxCap;
    this.maxPrecio = maxPrecio;
  }

  private aplicarFiltros(forceAll = false): void {
    const {
      query,
      municipio,
      estado,
      capacidad,
      precioMin,
      precioMax,
      calificacion,
      ordenarPor
    } = this.searchForm.value;

    const texto = this.normalizarTexto(query);
    const tokens = texto ? texto.split(/\s+/).filter(Boolean) : [];
    const municipioNorm = this.normalizarTexto(municipio);
    const estadoNorm = this.normalizarTexto(estado);

    const precioMinNum = this.toNumber(precioMin);
    const precioMaxNum = this.toNumber(precioMax);
    const capacidadNum = this.toNumber(capacidad);
    const calificacionNum = this.toNumber(calificacion);

    let resultados = this.fincas.filter(finca => {
      const nombre = this.normalizarTexto(finca.nombre);
      const descripcion = this.normalizarTexto(finca.descripcion);
      const infoAdicional = this.normalizarTexto(finca['InformacionAdicional']);
      const direccion = this.normalizarTexto(finca['Direccion'] ?? finca.ubicacion);
      const municipioFinca = this.normalizarTexto(finca['NombreMunicipio'] ?? finca.ubicacion);
      const estadoFinca = this.normalizarTexto(finca['Estado']);
      const propietario = this.normalizarTexto(`${finca['NombrePropietario'] ?? ''} ${finca['ApellidoPropietario'] ?? ''}`);

      const precio = finca.precioNoche ?? this.toNumber(finca['Precio']) ?? 0;
      const capacidadActual = finca.capacidad ?? this.toNumber(finca['Capacidad']) ?? 0;
      const calificacionActual = this.toNumber(finca['Calificacion']);

      const coincideQuery = !tokens.length || tokens.every(token =>
        nombre.includes(token) ||
        descripcion.includes(token) ||
        infoAdicional.includes(token) ||
        direccion.includes(token) ||
        municipioFinca.includes(token) ||
        propietario.includes(token)
      );

      if (!coincideQuery) {
        return false;
      }

      if (municipioNorm && municipioFinca !== municipioNorm) {
        return false;
      }

      if (estadoNorm && estadoFinca !== estadoNorm) {
        return false;
      }

      if (capacidadNum !== null && capacidadActual < capacidadNum) {
        return false;
      }

      if (precioMinNum !== null && precio < precioMinNum) {
        return false;
      }

      if (precioMaxNum !== null && precio > precioMaxNum) {
        return false;
      }

      if (calificacionNum !== null && (calificacionActual ?? 0) < calificacionNum) {
        return false;
      }

      return true;
    });

    resultados = this.ordenarResultados(resultados, ordenarPor, texto);

    this.filteredFincas = resultados;
    this.totalResultados = resultados.length;

    const mostrarTodo = forceAll || this.mostrarTodosResultados;
    this.displayedFincas = mostrarTodo ? resultados : resultados.slice(0, this.maxResultadosInicial);
  }

  private ordenarResultados(fincas: FincaDetalle[], criterio: string, query: string): FincaDetalle[] {
    const tokens = query ? query.split(/\s+/).filter(Boolean) : [];

    return [...fincas].sort((a, b) => {
      const scoreA = this.calcularPuntaje(a, tokens, criterio);
      const scoreB = this.calcularPuntaje(b, tokens, criterio);
      return scoreB - scoreA;
    });
  }

  private calcularPuntaje(finca: FincaDetalle, tokens: string[], criterio: string): number {
    let score = 0;

    const precio = finca.precioNoche ?? this.toNumber(finca['Precio']) ?? 0;
    const calificacion = this.toNumber(finca['Calificacion']) ?? 0;
    const capacidad = finca.capacidad ?? this.toNumber(finca['Capacidad']) ?? 0;
    const municipio = this.normalizarTexto(finca['NombreMunicipio'] ?? '');

    if (tokens.length) {
      const texto = this.normalizarTexto([
        finca.nombre,
        finca.descripcion,
        finca['InformacionAdicional'],
        finca['Direccion'],
        finca['NombreMunicipio'],
        finca['NombrePropietario'],
        finca['ApellidoPropietario']
      ].join(' '));

      for (const token of tokens) {
        if (texto.includes(token)) {
          score += 10;
        }
      }
    }

    score += calificacion * 2;
    score += Math.min(capacidad, 20) * 0.3;

    switch (criterio) {
      case 'precio-menor':
        score += precio ? 5000 / Math.max(precio, 1) : 0;
        break;
      case 'precio-mayor':
        score += precio;
        break;
      case 'capacidad':
        score += capacidad * 2;
        break;
      case 'municipio':
        score += municipio ? municipio.charCodeAt(0) : 0;
        break;
      case 'relevancia':
      default:
        score += calificacion * 5 + capacidad;
        break;
    }

    return score;
  }

  private actualizarDisplay(resultados: FincaDetalle[]): void {
    this.filteredFincas = [...resultados];
    this.totalResultados = resultados.length;
    this.displayedFincas = resultados.slice(0, this.maxResultadosInicial);
  }

  private restaurarScroll(): void {
    document.body.style.overflow = this.previousBodyOverflow || '';
  }

  private capitalizarTexto(valor: string): string {
    const texto = valor.toLowerCase().trim();
    if (!texto) {
      return '';
    }
    return texto
      .split(/\s+/)
      .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
      .join(' ');
  }

  private normalizarTexto(valor: any): string {
    if (valor === null || valor === undefined) {
      return '';
    }
    return valor.toString().normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
  }

  private toNumber(valor: any): number | null {
    if (valor === null || valor === undefined || valor === '') {
      return null;
    }
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : null;
  }

  private enriquecerFincasConImagenes(fincasRaw: any[], fincasMapeadas: FincaDetalle[]): void {
    if (!Array.isArray(fincasRaw) || !fincasRaw.length) {
      return;
    }

    const solicitudes = fincasRaw.map((raw, index) => {
      const fincaDetalle = fincasMapeadas[index];
      const idConsulta = this.obtenerIdFincaParaConsulta(fincaDetalle, raw);

      if (!idConsulta) {
        return of({ index, urls: [] as string[] });
      }

      return this.http
        .get<any>(`${this.imagenesEndpoint}/finca/${encodeURIComponent(idConsulta)}`)
        .pipe(
          map((resp) => this.normalizarColeccion(resp)),
          catchError(() => of([] as any[])),
          map((imagenes) => ({ index, urls: this.extraerUrlsImagenes(imagenes) }))
        );
    });

    forkJoin(solicitudes)
      .pipe(takeUntil(this.destroy$))
      .subscribe((resultados) => {
        let huboCambios = false;
        const fincasActualizadas = [...this.fincas];

        resultados.forEach(({ index, urls }) => {
          const fincaActual = fincasActualizadas[index];
          if (!fincaActual || !urls.length) {
            return;
          }

          const actualizada = this.aplicarImagenes(fincaActual, urls);
          if (actualizada !== fincaActual) {
            fincasActualizadas[index] = actualizada;
            huboCambios = true;
          }
        });

        if (huboCambios) {
          this.fincas = fincasActualizadas;
          this.aplicarFiltros(this.mostrarTodosResultados);
        }
      });
  }

  private aplicarImagenes(finca: FincaDetalle, urls: string[]): FincaDetalle {
    if (!urls.length) {
      return finca;
    }

    const principal = urls[0];
    const existentes = Array.isArray(finca.imagenesDisponibles) ? finca.imagenesDisponibles : [];
    const combinadas = this.deduplicarImagenes([...urls, ...existentes]);

    const necesitaPrincipal = principal && finca.imagenUrl !== principal;
    const necesitaGaleria = !this.sonArraysIguales(combinadas, existentes);

    if (!necesitaPrincipal && !necesitaGaleria) {
      return finca;
    }

    return {
      ...finca,
      imagenUrl: necesitaPrincipal ? principal : finca.imagenUrl,
      imagenesDisponibles: combinadas
    };
  }

  private deduplicarImagenes(urls: string[]): string[] {
    const unicas: string[] = [];
    urls.forEach((url) => {
      const limpia = typeof url === 'string' ? url.trim() : '';
      if (limpia && !unicas.includes(limpia)) {
        unicas.push(limpia);
      }
    });
    return unicas;
  }

  private extraerUrlsImagenes(imagenes: any[]): string[] {
    if (!Array.isArray(imagenes)) {
      return [];
    }

    const claves = ['UrlImagen', 'urlImagen', 'Imagen', 'imagen', 'Url', 'url', 'Foto', 'foto'];
    const urls: string[] = [];

    imagenes.forEach((entrada) => {
      if (typeof entrada === 'string') {
        const limpia = entrada.trim();
        if (limpia && !urls.includes(limpia)) {
          urls.push(limpia);
        }
        return;
      }

      if (!entrada || typeof entrada !== 'object') {
        return;
      }

      for (const clave of claves) {
        const valor = (entrada as Record<string, unknown>)[clave];
        if (typeof valor === 'string') {
          const limpia = valor.trim();
          if (limpia && !urls.includes(limpia)) {
            urls.push(limpia);
          }
          break;
        }
      }
    });

    return urls;
  }

  private obtenerIdFincaParaConsulta(finca: FincaDetalle | undefined, raw: any): string | null {
    const candidatos = [
      raw?.IdFinca,
      raw?.Idfinca,
      raw?.idFinca,
      raw?.FincaId,
      raw?.fincaId,
      raw?.Id,
      raw?.id,
      finca?.id
    ];

    for (const candidato of candidatos) {
      if (candidato !== undefined && candidato !== null) {
        const texto = String(candidato).trim();
        if (texto) {
          return texto;
        }
      }
    }

    return null;
  }

  private normalizarColeccion<T>(entrada: T | T[] | null | undefined): T[] {
    if (!entrada) {
      return [];
    }
    return Array.isArray(entrada) ? entrada : [entrada];
  }

  private sonArraysIguales(actual: string[], comparador: string[]): boolean {
    if (actual.length !== comparador.length) {
      return false;
    }

    return actual.every((valor, index) => valor === comparador[index]);
  }

}
