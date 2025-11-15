import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FincaDetalle, FincaSeleccionadaService, mapearFinca } from '../services/finca-seleccionada.service';
import { AuthStateService } from '../services/auth-state.service';
import { ReservaCheckoutDraft, ReservaCheckoutService } from '../services/reserva-checkout.service';
import { ReservaService } from '../services/reserva.service';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

type EstadoDia = 'disponible' | 'ocupado' | 'bloqueado';

interface DiaCalendario {
  iso: string;
  numero: number;
  estado: EstadoDia;
  esHoy: boolean;
  esDelMes: boolean;
  esSeleccionado: boolean;
}

@Component({
  selector: 'app-detalle-finca-component',
  standalone: false,
  templateUrl: './detalle-finca-component.html',
  styleUrl: './detalle-finca-component.css'
})
export class DetalleFincaComponent implements OnInit, OnDestroy {
  finca: FincaDetalle | null = null;
  cargando = true;
  error: string | null = null;
  reservaForm: FormGroup;
  reservando = false;
  mensajeReserva = '';
  errorReserva = '';
  calendarioSemanas: DiaCalendario[][] = [];
  nombreMesActual = '';
  private readonly placeholderUrl = 'https://via.placeholder.com/640x360?text=Sin+Imagen';
  galeriaImagenes: string[] = [this.placeholderUrl];
  indiceImagenActiva = 0;
  imagenActualUrl: string = this.placeholderUrl;
  private fechasOcupadas = new Set<string>();
  private mesActual = new Date().getMonth();
  private anioActual = new Date().getFullYear();
  private fechaSeleccionada: string | null = null;

  private readonly apiUrl = 'http://localhost:3000/api/finca';
  private readonly imagenesBaseUrl = 'http://localhost:3000/api/imagen';
  private subscripcionRuta?: Subscription;
  private subscripcionAuth?: Subscription;
  private subscripcionDisponibilidad?: Subscription;

  constructor(
    private readonly ruta: ActivatedRoute,
    private readonly router: Router,
    private readonly http: HttpClient,
    private readonly fincaSeleccionada: FincaSeleccionadaService,
    private readonly fb: FormBuilder,
    private readonly authState: AuthStateService,
    private readonly reservaCheckout: ReservaCheckoutService,
    private readonly reservaService: ReservaService
  ) {

    this.reservaForm = this.fb.group({
      fechaInicio: ['', [Validators.required]],
      noches: [1, [Validators.required, Validators.min(1)]],
      huespedes: [1, [Validators.required, Validators.min(1)]]
    });

    this.subscripcionRuta = this.ruta.paramMap.subscribe(paramMap => {
      const id = paramMap.get('id');
      this.cargarFinca(id);
    });

    this.subscripcionAuth = this.authState.currentUser$.subscribe(usuario => {
      this.mensajeReserva = '';
      this.errorReserva = '';
      if (usuario) {
        if (this.reservaForm.disabled) {
          this.reservaForm.enable({ emitEvent: false });
        }
        this.generarCalendario();
      } else {
        this.reservaForm.reset({ fechaInicio: '', noches: 1, huespedes: 1 });
        this.reservaForm.disable({ emitEvent: false });
        this.fechaSeleccionada = null;
        this.generarCalendario();
      }
    });
  }

  ngOnInit(): void {
    if (!this.authState.isAuthenticated()) {
      this.reservaForm.disable({ emitEvent: false });
    }
    this.actualizarNombreMes();
    this.generarCalendario();
  }

  ngOnDestroy() {
    this.subscripcionRuta?.unsubscribe();
    this.subscripcionAuth?.unsubscribe();
    this.subscripcionDisponibilidad?.unsubscribe();
  }

  volverAlInicio() {
    this.router.navigate(['/inicio']);
  }

  irALogin(): void {
    this.router.navigate(['/iniciar-sesion']);
  }

  puedeReservar(): boolean {
    return this.authState.isAuthenticated();
  }

  campoReservaInvalido(controlName: string): boolean {
    const control = this.reservaForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  get fechaEntradaSeleccionada(): string | null {
    return this.reservaForm.get('fechaInicio')?.value || this.fechaSeleccionada;
  }

  get fechaSalidaCalculada(): string | null {
    const fechaInicio = this.fechaEntradaSeleccionada;
    const noches = this.reservaForm.get('noches')?.value;
    
    if (!fechaInicio || !noches) {
      return null;
    }
    
    const nochesNumero = Math.max(1, Math.floor(Number(noches)));
    return this.calcularFechaSalida(fechaInicio, nochesNumero);
  }

  get nochesSeleccionadas(): number {
    const noches = this.reservaForm.get('noches')?.value;
    return Math.max(1, Math.floor(Number(noches ?? 1)));
  }

  realizarReserva(): void {
    this.mensajeReserva = '';
    this.errorReserva = '';

    if (!this.puedeReservar()) {
      this.errorReserva = 'Debes iniciar sesión para reservar esta finca.';
      return;
    }

    if (this.reservaForm.invalid || !this.finca) {
      this.reservaForm.markAllAsTouched();
      this.errorReserva = 'Por favor completa todos los campos requeridos correctamente.';
      return;
    }

    const { fechaInicio, noches, huespedes } = this.reservaForm.value;
    const nochesNumero = Math.max(1, Math.floor(Number(noches ?? 1)));
    const huespedesNumero = Math.max(1, Math.floor(Number(huespedes ?? 1)));
    const fechaEntrada = (fechaInicio ?? '').toString().trim();
    const fechaSalida = this.calcularFechaSalida(fechaEntrada, nochesNumero);

    if (!fechaEntrada || !fechaSalida) {
      this.errorReserva = 'Selecciona una fecha de entrada válida.';
      return;
    }

    if (fechaSalida <= fechaEntrada) {
      this.errorReserva = 'La fecha de salida debe ser posterior a la de entrada. Verifica el número de noches.';
      return;
    }

    const capacidadFinca = this.finca['Capacidad'] || this.finca['capacidad'] || 0;
    if (capacidadFinca > 0 && huespedesNumero > capacidadFinca) {
      this.errorReserva = `Esta finca tiene capacidad para máximo ${capacidadFinca} huéspedes.`;
      return;
    }

    if (nochesNumero < 1 || nochesNumero > 365) {
      this.errorReserva = 'El número de noches debe estar entre 1 y 365.';
      return;
    }

    const usuario = this.authState.getSnapshot();
    const precioNoche = this.obtenerPrecioPorNoche(this.finca);
    const montoTotal = this.calcularTotalReserva(precioNoche, nochesNumero);

    const draft: ReservaCheckoutDraft = {
      fincaId: this.finca.id,
      fincaNombre: this.finca.nombre,
      municipio: this.finca.ubicacion,
      precioNoche,
      fechaEntrada,
      fechaSalida,
      noches: nochesNumero,
      huespedes: huespedesNumero,
      montoTotal,
      usuarioCorreo: usuario?.Correo ?? null,
      usuarioDocumento: this.extraerDocumentoUsuario(usuario),
      usuarioNombreCompleto: this.obtenerNombreCompleto(usuario),
      usuario: usuario ?? null,
      fincaImagen: this.imagenActualUrl ?? null
    };

    this.reservando = true;
    this.mensajeReserva = 'Redirigiéndote a la pasarela de pago...';
    this.reservaCheckout.setDraft(draft);

    this.router.navigate(['/reserva/pago']).then(
      () => {
        this.reservando = false;
      },
      (error) => {

        this.reservando = false;
        this.errorReserva = 'No fue posible abrir la pasarela de pago. Intenta nuevamente.';
      }
    );
  }

  get totalEstimadoReserva(): number {
    if (!this.finca) {
      return 0;
    }

    const noches = Math.max(1, Math.floor(Number(this.reservaForm.get('noches')?.value ?? 1)));
    const precio = this.obtenerPrecioPorNoche(this.finca);
    return this.calcularTotalReserva(precio, noches);
  }

  private calcularFechaSalida(fechaEntrada: string, noches: number): string {
    const base = this.normalizarFecha(fechaEntrada);
    if (!base) {
      return '';
    }

    const totalNoches = Math.max(1, Math.floor(Number.isFinite(noches) ? noches : 1));

    const salida = new Date(base.getFullYear(), base.getMonth(), base.getDate());
    salida.setDate(salida.getDate() + totalNoches);
    
    const fechaSalidaFormateada = this.formatearFecha(salida);
    
    return fechaSalidaFormateada;
  }

  private calcularTotalReserva(precioNoche: number | null | undefined, noches: number): number {
    const precio = typeof precioNoche === 'number' && Number.isFinite(precioNoche) ? precioNoche : 0;
    const totalNoches = Math.max(1, Math.floor(Number.isFinite(noches) ? noches : 1));
    return precio * totalNoches;
  }

  private obtenerPrecioPorNoche(finca: FincaDetalle): number {
    const candidatos: Array<unknown> = [
      finca.precioNoche,
      finca['Precio'],
      finca['PrecioFinca'],
      finca['precio'],
      finca['PrecioNoche'],
      finca['ValorNoche']
    ];

    for (const valor of candidatos) {
      const numero = this.convertirANumero(valor);
      if (numero !== null) {
        return numero;
      }
    }

    return 0;
  }

  private convertirANumero(valor: unknown): number | null {
    if (valor === undefined || valor === null || valor === '') {
      return null;
    }

    if (typeof valor === 'number' && Number.isFinite(valor)) {
      return valor;
    }

    if (typeof valor === 'string') {
      const limpio = valor.replace(/[^0-9.,-]/g, '').replace(',', '.');
      const parsed = Number(limpio);
      return Number.isNaN(parsed) ? null : parsed;
    }

    return null;
  }

  private extraerDocumentoUsuario(usuario: unknown): string | number | null {
    if (!usuario || typeof usuario !== 'object') {
      return null;
    }

    const candidato =
      (usuario as any).NumeroDocumento ??
      (usuario as any).numeroDocumento ??
      (usuario as any).Documento ??
      (usuario as any).documento;

    if (candidato !== undefined && candidato !== null && candidato !== '') {
      return candidato;
    }

    const idUsuario = (usuario as any).IdUsuario ?? (usuario as any).idUsuario;
    return idUsuario ?? null;
  }

  private obtenerNombreCompleto(usuario: unknown): string | null {
    if (!usuario || typeof usuario !== 'object') {
      return null;
    }

    const nombre = (usuario as any).NombreUsuario ?? (usuario as any).nombre;
    const apellido = (usuario as any).ApellidoUsuario ?? (usuario as any).apellido;

    if (nombre && apellido) {
      return `${nombre} ${apellido}`.trim();
    }

    return nombre ?? apellido ?? null;
  }

  private cargarFinca(id: string | null) {
    this.cargando = true;
    this.error = null;

    const fincaSeleccionada = this.fincaSeleccionada.getSnapshot();

    if (fincaSeleccionada && (!id || fincaSeleccionada.id === id || id === 'sin-id')) {
      this.finca = fincaSeleccionada;
      this.sincronizarGaleria(fincaSeleccionada);
      this.cargando = false;
      this.cargarDisponibilidad();
      if (fincaSeleccionada?.id && !this.galeriaTieneImagenReal()) {
        this.obtenerImagenesDesdeApi(fincaSeleccionada.id);
      }
      return;
    }

    this.cargarTodasLasFincas(id);
  }

  private cargarTodasLasFincas(id: string | null) {

    const tiempoInicio = Date.now();
    
    this.http
      .get<any>(this.apiUrl)
      .pipe(
        map((resp) => {

          const normalizado = this.normalizarColeccion(resp);

          return normalizado;
        })
      )
      .subscribe({
        next: (fincasRaw) => {
          if (!fincasRaw.length) {

            this.error = 'No hay fincas disponibles.';
            this.finca = null;
            this.cargando = false;
            return;
          }

          const fincasMapeadas = fincasRaw.map((raw, index) => mapearFinca(raw, index));

          const encontrada = fincasMapeadas.find((f) => f.id === id) ?? fincasMapeadas[0] ?? null;

          if (!encontrada) {
            this.error = 'No se encontró información para esta finca.';
            this.finca = null;
            this.cargando = false;
            return;
          }

          const tiempoTotal = Date.now() - tiempoInicio;

          this.finca = encontrada;
          this.sincronizarGaleria(encontrada);
          this.cargando = false;

          const capacidadFinca = encontrada['Capacidad'] || encontrada['capacidad'] || 999;
          const huespedesControl = this.reservaForm.get('huespedes');
          if (huespedesControl) {
            huespedesControl.setValidators([
              Validators.required,
              Validators.min(1),
              Validators.max(capacidadFinca)
            ]);
            huespedesControl.updateValueAndValidity();
          }
          
          this.cargarDisponibilidad();

          const fincaRaw = fincasRaw.find((raw) => {
            const detalleTemp = mapearFinca(raw, 0);
            return detalleTemp.id === id;
          });

          if (fincaRaw) {
            const idConsulta = this.obtenerIdFincaParaConsulta(encontrada, fincaRaw);
            if (idConsulta) {
              this.cargarImagenesFinca(idConsulta, encontrada);
            }
          }
        },
        error: (err) => {
          const tiempoTotal = Date.now() - tiempoInicio;


          this.error = 'Ocurrió un error al cargar la finca. Intenta de nuevo más tarde.';
          this.finca = null;
          this.cargando = false;
        }
      });
  }

  private cargarImagenesFinca(idFinca: string, finca: FincaDetalle): void {

    this.http
      .get<any>(`${this.imagenesBaseUrl}/finca/${encodeURIComponent(idFinca)}`)
      .pipe(
        map((resp) => this.normalizarColeccion(resp)),
        catchError((err) => {

          return of([] as any[]);
        })
      )
      .subscribe({
        next: (imagenes) => {

          if (imagenes.length > 0 && this.finca?.id === finca.id) {
            const fincaConImagenes = this.aplicarImagenes(finca, imagenes);
            this.sincronizarGaleria(fincaConImagenes);
          }
        }
      });
  }

  obtenerDiasSemana(): string[] {
    return ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  }

  cambiarMes(delta: number): void {
    const nuevaFecha = new Date(this.anioActual, this.mesActual + delta, 1);
    this.mesActual = nuevaFecha.getMonth();
    this.anioActual = nuevaFecha.getFullYear();
    this.actualizarNombreMes();
    this.generarCalendario();
  }

  seleccionarDia(dia: DiaCalendario): void {
    if (dia.estado !== 'disponible' || !dia.esDelMes || !this.puedeReservar()) {
      return;
    }

    this.fechaSeleccionada = dia.iso;
    this.reservaForm.patchValue({ fechaInicio: dia.iso }, { emitEvent: false });
    const control = this.reservaForm.get('fechaInicio');
    control?.markAsDirty();
    control?.markAsTouched();
    this.generarCalendario();
  }

  esDiaSeleccionado(dia: DiaCalendario): boolean {
    return this.fechaSeleccionada === dia.iso;
  }

  hayCarrusel(): boolean {
    return this.galeriaImagenes.filter((url) => url && url !== this.placeholderUrl).length > 1;
  }

  cambiarImagen(paso: number): void {
    if (!this.hayCarrusel()) {
      return;
    }

    const total = this.galeriaImagenes.length;
    this.indiceImagenActiva = (this.indiceImagenActiva + paso + total) % total;
    this.actualizarImagenActualUrl();
  }

  irAImagen(indice: number): void {
    if (indice < 0 || indice >= this.galeriaImagenes.length) {
      return;
    }

    this.indiceImagenActiva = indice;
    this.actualizarImagenActualUrl();
  }

  manejarErrorImagen(): void {
    this.removerImagenEnIndice(this.indiceImagenActiva);
  }

  manejarErrorMiniatura(indice: number): void {
    this.removerImagenEnIndice(indice);
  }

  private cargarDisponibilidad(): void {
    if (!this.finca) {
      this.subscripcionDisponibilidad?.unsubscribe();
      this.fechasOcupadas = new Set();
      this.generarCalendario();
      return;
    }

    this.subscripcionDisponibilidad?.unsubscribe();
    this.subscripcionDisponibilidad = this.reservaService
      .obtenerFechasOcupadas(this.finca.id)
      .subscribe({
        next: (fechas) => {
          this.fechasOcupadas = new Set(fechas ?? []);
          const seleccionActual = this.reservaForm.get('fechaInicio')?.value ?? null;
          this.fechaSeleccionada = seleccionActual ? String(seleccionActual) : null;
          this.generarCalendario();
        },
        error: (error) => {

          this.fechasOcupadas = new Set();
          this.generarCalendario();
        }
      });
  }

  private generarCalendario(): void {
    const semanas: DiaCalendario[][] = [];
    const fechaBase = new Date(this.anioActual, this.mesActual, 1);
    const primerDiaSemana = (fechaBase.getDay() + 6) % 7;
    const diasEnMes = new Date(this.anioActual, this.mesActual + 1, 0).getDate();
    const totalCeldas = Math.ceil((primerDiaSemana + diasEnMes) / 7) * 7;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    for (let i = 0; i < totalCeldas; i++) {
      const diaNumero = i - primerDiaSemana + 1;
      const fecha = new Date(this.anioActual, this.mesActual, diaNumero);
      const esDelMes = diaNumero >= 1 && diaNumero <= diasEnMes;
      const iso = this.formatearFecha(fecha);
      const esPasado = fecha < hoy;
      const ocupado = esDelMes && this.fechasOcupadas.has(iso);
      const estado: EstadoDia = !esDelMes || esPasado ? 'bloqueado' : ocupado ? 'ocupado' : 'disponible';

      const diaCalendario: DiaCalendario = {
        iso,
        numero: fecha.getDate(),
        estado,
        esHoy: fecha.getTime() === hoy.getTime(),
        esDelMes,
        esSeleccionado: this.fechaSeleccionada === iso
      };

      const semanaIndex = Math.floor(i / 7);
      if (!semanas[semanaIndex]) {
        semanas[semanaIndex] = [];
      }
      semanas[semanaIndex].push(diaCalendario);
    }

    this.calendarioSemanas = semanas;
  }

  private actualizarNombreMes(): void {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    this.nombreMesActual = `${meses[this.mesActual]} ${this.anioActual}`;
  }

  private formatearFecha(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = `${fecha.getMonth() + 1}`.padStart(2, '0');
    const day = `${fecha.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private normalizarFecha(valor: string | null | undefined): Date | null {
    if (!valor) {
      return null;
    }

    const partes = valor.trim().split('-');
    if (partes.length === 3) {
      const year = parseInt(partes[0], 10);
      const month = parseInt(partes[1], 10) - 1;
      const day = parseInt(partes[2], 10);
      
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        const fecha = new Date(year, month, day, 0, 0, 0, 0);
        if (!isNaN(fecha.getTime())) {
          return fecha;
        }
      }
    }

    const directa = new Date(valor);
    if (!Number.isNaN(directa.getTime())) {
      directa.setHours(0, 0, 0, 0);
      return directa;
    }

    const fallback = new Date(`${valor}T00:00:00`);
    if (!Number.isNaN(fallback.getTime())) {
      fallback.setHours(0, 0, 0, 0);
      return fallback;
    }

    return null;
  }

  private normalizarColeccion<T>(entrada: T | T[] | null | undefined): T[] {
    if (!entrada) {
      return [];
    }
    return Array.isArray(entrada) ? entrada : [entrada];
  }

  private aplicarImagenes(finca: FincaDetalle, imagenes: any[]): FincaDetalle {
    const urls = this.extraerUrlsImagenes(imagenes);

    if (!urls.length) {
      return finca;
    }

    const existentes = Array.isArray(finca.imagenesDisponibles)
      ? finca.imagenesDisponibles.filter((url) => typeof url === 'string' && !this.esPlaceholder(url))
      : [];
    const conjunto = new Set<string>([...urls, ...existentes]);
    const lista = Array.from(conjunto);

    return {
      ...finca,
      imagenUrl: urls[0] ?? finca.imagenUrl,
      imagenesDisponibles: lista
    };
  }

  private esPlaceholder(url: string): boolean {
    return /placeholder\.com/.test(url);
  }

  private obtenerImagenesDesdeApi(idFinca: string | null): void {
    if (!idFinca) {
      return;
    }

    this.http
      .get<any>(`${this.imagenesBaseUrl}/finca/${encodeURIComponent(idFinca)}`)
      .pipe(
        map((resp) => this.normalizarColeccion(resp)),
        catchError(() => of([] as any[]))
      )
      .subscribe((imagenes) => {
        if (!this.finca) {
          return;
        }

        const actualizada = this.aplicarImagenes(this.finca, imagenes);
        this.sincronizarGaleria(actualizada);
      });
  }

  private galeriaTieneImagenReal(): boolean {
    return this.galeriaImagenes.some((url) => url && url !== this.placeholderUrl);
  }

  private sincronizarGaleria(finca: FincaDetalle | null, actualizarServicio = true): void {
    if (!finca) {
      this.galeriaImagenes = [this.placeholderUrl];
      this.indiceImagenActiva = 0;
      this.imagenActualUrl = this.placeholderUrl;
      this.finca = null;
      return;
    }

    const candidatos: string[] = [];
    const registrar = (valor: unknown) => {
      if (typeof valor !== 'string') {
        return;
      }
      const limpia = valor.trim();
      if (limpia && limpia !== this.placeholderUrl && !candidatos.includes(limpia)) {
        candidatos.push(limpia);
      }
    };

    registrar(finca.imagenUrl);
    if (Array.isArray(finca.imagenesDisponibles)) {
      finca.imagenesDisponibles.forEach(registrar);
    }

    const tieneImagenes = candidatos.length > 0;
    this.galeriaImagenes = tieneImagenes ? candidatos : [this.placeholderUrl];
    this.indiceImagenActiva = 0;
    this.imagenActualUrl = this.galeriaImagenes[0];

    const capacidadMaxima = finca.capacidad || 1;
    this.reservaForm.get('huespedes')?.setValidators([
      Validators.required,
      Validators.min(1),
      Validators.max(capacidadMaxima)
    ]);
    this.reservaForm.get('huespedes')?.updateValueAndValidity();

    const imagenesDisponibles = this.galeriaImagenes.filter((url) => url !== this.placeholderUrl);
    const actualizada: FincaDetalle = {
      ...finca,
      imagenUrl: this.imagenActualUrl,
      imagenesDisponibles
    };

    this.finca = actualizada;
    if (actualizarServicio) {
      this.fincaSeleccionada.setFinca(actualizada);
    }
  }

  private actualizarImagenActualUrl(): void {
    if (!this.galeriaImagenes.length) {
      this.galeriaImagenes = [this.placeholderUrl];
      this.indiceImagenActiva = 0;
    }

    if (this.indiceImagenActiva < 0) {
      this.indiceImagenActiva = 0;
    }

    if (this.indiceImagenActiva >= this.galeriaImagenes.length) {
      this.indiceImagenActiva = this.galeriaImagenes.length - 1;
    }

    this.imagenActualUrl = this.galeriaImagenes[this.indiceImagenActiva] ?? this.placeholderUrl;

    if (this.finca) {
      const imagenesDisponibles = this.galeriaImagenes.filter((url) => url !== this.placeholderUrl);
      const actualizada: FincaDetalle = {
        ...this.finca,
        imagenUrl: this.imagenActualUrl,
        imagenesDisponibles
      };

      this.finca = actualizada;
      this.fincaSeleccionada.setFinca(actualizada);
    }
  }

  private removerImagenEnIndice(indice: number): void {
    if (indice < 0 || indice >= this.galeriaImagenes.length) {
      return;
    }

    if (this.galeriaImagenes.length === 1 && this.galeriaImagenes[0] === this.placeholderUrl) {
      return;
    }

    this.galeriaImagenes.splice(indice, 1);

    if (!this.galeriaImagenes.length) {
      this.galeriaImagenes = [this.placeholderUrl];
      this.indiceImagenActiva = 0;
    } else if (this.indiceImagenActiva >= this.galeriaImagenes.length) {
      this.indiceImagenActiva = this.galeriaImagenes.length - 1;
    }

    this.actualizarImagenActualUrl();
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
