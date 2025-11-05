import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AdminResourceConfig, AdminReportConfig, AdminResourceFieldConfig } from '../admin-resources.config';
import { AdminApiService } from '../services/admin-api.service';
import { CryptoService } from '../../template/services/crypto.service';

interface ReportState {
  cargando: boolean;
  error: string;
  datos: unknown;
}

@Component({
  selector: 'app-resource-crud',
  standalone: false,
  templateUrl: './resource-crud.html',
  styleUrl: './resource-crud.css'
})
export class ResourceCrudComponent implements OnInit, OnChanges, OnDestroy {
  @Input({ required: true }) config!: AdminResourceConfig;

  registros: any[] = [];
  columnas: string[] = [];
  modoVisualizacion: 'tabla' | 'tarjetas' = 'tabla';
  cargando = false;
  error = '';

  formularioVisible = false;
  modoFormulario: 'crear' | 'editar' = 'crear';
  formulario: FormGroup;
  errorFormulario = '';
  registroSeleccionado: any = null;
  camposFormulario: AdminResourceFieldConfig[] = [];
  usaFormularioEstructurado = false;
  mostrarCamposAvanzados = false;
  readonly controlCamposAdicionales = 'camposAdicionales';

  reportesEstado = new Map<string, ReportState>();
  opcionesSelectCache = new Map<string, { value: any; label: string }[]>();
  cargandoOpcionesSelect = false;

  mostrarModalEliminacion = false;
  registroAEliminar: any = null;
  idRegistroAEliminar: string | number | null = null;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly api: AdminApiService,
    private readonly fb: FormBuilder,
    private readonly cryptoService: CryptoService
  ) {
    this.formulario = this.fb.group({});
  }

  ngOnInit(): void {
    if (this.config) {
      this.recargar();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] && !changes['config'].firstChange) {
      this.recargar();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    // Asegurar que el scroll se restaure si el componente se destruye con el diálogo abierto
    if (this.formularioVisible) {
      this.desbloquearScrollBody();
    }
  }

  recargar(): void {
    this.cargarRegistros();
    this.cargarReportes();
  }

  cambiarModo(vista: 'tabla' | 'tarjetas'): void {
    this.modoVisualizacion = vista;
  }

  cargarRegistros(): void {
    if (!this.config) {
      return;
    }

    this.cargando = true;
    this.error = '';

    this.api
      .list<any>(this.config.endpoint)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.cargando = false))
      )
      .subscribe({
        next: (respuesta) => {
          const registros = Array.isArray(respuesta)
            ? respuesta
            : respuesta
            ? [respuesta]
            : [];
          this.registros = registros;
          this.columnas = this.calcularColumnas(registros);
        },
        error: (err: Error) => {
          this.error = err.message || 'No fue posible cargar los datos.';
          this.registros = [];
        }
      });
  }

  cargarReportes(): void {
    if (!this.config?.reports?.length) {
      this.reportesEstado.clear();
      return;
    }

    this.config.reports.forEach((reporte) => {
      this.reportesEstado.set(reporte.endpoint, {
        cargando: true,
        error: '',
        datos: null
      });

      this.api
        .list<any>(reporte.endpoint)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (datos) => {
            this.reportesEstado.set(reporte.endpoint, {
              cargando: false,
              error: '',
              datos
            });
          },
          error: (err: Error) => {
            this.reportesEstado.set(reporte.endpoint, {
              cargando: false,
              error: err.message || 'Error consultando el reporte.',
              datos: null
            });
          }
        });
    });
  }

  abrirCrear(): void {
    this.formularioVisible = true;
    this.modoFormulario = 'crear';
    this.registroSeleccionado = null;
    this.errorFormulario = '';
    const plantilla = this.config?.samplePayload ?? this.generarPlantillaDesdeColumnas();
    this.configurarFormulario(typeof plantilla === 'object' ? { ...(plantilla as Record<string, unknown>) } : null);
    this.cargarTodasLasOpcionesSelect();
    this.bloquearScrollBody();
  }

  abrirEditar(registro: any): void {
    this.formularioVisible = true;
    this.modoFormulario = 'editar';
    this.registroSeleccionado = registro;
    this.errorFormulario = '';
    this.configurarFormulario(registro ? { ...registro } : null);
    this.cargarTodasLasOpcionesSelect();
    this.bloquearScrollBody();
  }

  cerrarFormulario(): void {
    this.formularioVisible = false;
    this.formulario = this.fb.group({});
    this.errorFormulario = '';
    this.registroSeleccionado = null;
    this.camposFormulario = [];
    this.usaFormularioEstructurado = false;
    this.mostrarCamposAvanzados = false;
    this.desbloquearScrollBody();
  }

  private bloquearScrollBody(): void {
    document.body.style.overflow = 'hidden';
  }

  private desbloquearScrollBody(): void {
    document.body.style.overflow = '';
  }

  async enviarFormulario(): Promise<void> {
    if (!this.config) {
      return;
    }

    this.formulario.markAllAsTouched();

    if (this.formulario.invalid) {
      return;
    }

    this.errorFormulario = '';

    let payload = this.obtenerPayloadDesdeFormulario();
    if (!payload) {
      return;
    }

    // Si el recurso es 'usuarios' y hay un campo de contraseña, hashear con SHA-512
    if (this.config.id === 'usuarios' && payload['Contrasena']) {
      const passwordPlainText = String(payload['Contrasena']);
      const hashedPassword = await this.cryptoService.hashSHA512(passwordPlainText);
      payload = { ...payload, Contrasena: hashedPassword };
    }

    // Log para verificar que no se envíe el ID en modo crear
    if (this.modoFormulario === 'crear') {
      console.log('🔍 Payload para CREAR (sin ID):', payload);
    }

    const accion = this.modoFormulario === 'crear' ? 'create' : 'update';
    const accion$ = this.buildAccionObservable(accion, payload);

    if (!accion$) {
      this.errorFormulario = 'No fue posible determinar la acción a ejecutar.';
      return;
    }

    this.formulario.disable({ emitEvent: false });

    accion$
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.formulario.enable({ emitEvent: false }))
      )
      .subscribe({
        next: () => {
          this.cerrarFormulario();
          this.cargarRegistros();
          this.cargarReportes();
        },
        error: (err: Error) => {
          this.errorFormulario = err.message || 'Ocurrió un error al guardar los cambios.';
        }
      });
  }

  toggleCamposAvanzados(): void {
    this.mostrarCamposAvanzados = !this.mostrarCamposAvanzados;
  }

  private configurarFormulario(origen: Record<string, unknown> | null): void {
    const campos = this.obtenerCamposConfigurados();
    this.camposFormulario = campos;
    this.usaFormularioEstructurado = campos.length > 0;
    this.formulario = this.fb.group({});
    this.mostrarCamposAvanzados = false;

    if (!this.usaFormularioEstructurado) {
      // En modo crear, usar plantilla vacía. En modo editar, usar origen o samplePayload
      const base = this.modoFormulario === 'editar' 
        ? (origen ?? this.config?.samplePayload ?? this.generarPlantillaDesdeColumnas())
        : this.generarPlantillaDesdeColumnas();
      const contenido = this.presentarJson(base ?? {});
      this.formulario.addControl('payload', this.fb.control(contenido, [Validators.required]));
      return;
    }

    campos.forEach((campo) => {
      // Solo usar valores del origen si estamos en modo editar
      // En modo crear, todos los campos deben estar vacíos
      const valorInicial = (this.modoFormulario === 'editar' && origen && Object.prototype.hasOwnProperty.call(origen, campo.key)) 
        ? origen[campo.key] 
        : '';
      const control = this.fb.control(valorInicial ?? '', campo.required ? [Validators.required] : []);
      this.formulario.addControl(campo.key, control);

      if (campo.readOnly || (this.modoFormulario === 'editar' && this.config?.idField && campo.key === this.config.idField)) {
        control.disable({ emitEvent: false });
      }
    });

    const adicionales = this.calcularCamposAdicionales(origen);
    this.formulario.addControl(this.controlCamposAdicionales, this.fb.control(adicionales));
    this.mostrarCamposAvanzados = adicionales.trim().length > 0;
  }

  private obtenerCamposConfigurados(): AdminResourceFieldConfig[] {
    if (!this.config) {
      return [];
    }

    const camposBase = Array.isArray(this.config.preferredFields)
      ? this.config.preferredFields.map((campo) => ({ ...campo }))
      : [];

    // Solo agregar el campo ID si estamos en modo edición
    // En modo creación, el ID será generado automáticamente por la base de datos
    const idField = this.config.idField;
    if (idField && this.modoFormulario === 'editar' && !camposBase.some((campo) => campo.key === idField)) {
      camposBase.unshift({
        key: idField,
        label: this.obtenerEtiquetaCampo(idField),
        type: 'text',
        readOnly: true
      });
    }

    return camposBase;
  }

  private calcularCamposAdicionales(origen: Record<string, unknown> | null): string {
    if (!origen || typeof origen !== 'object') {
      return '';
    }

    const claves = new Set(this.camposFormulario.map((campo) => campo.key));
    const adicionales: Record<string, unknown> = {};

    Object.entries(origen).forEach(([clave, valor]) => {
      if (!claves.has(clave)) {
        adicionales[clave] = valor;
      }
    });

    return Object.keys(adicionales).length ? JSON.stringify(adicionales, null, 2) : '';
  }

  private obtenerPayloadDesdeFormulario(): Record<string, unknown> | null {
    if (!this.usaFormularioEstructurado) {
      const contenido = this.formulario.get('payload')?.value;
      if (typeof contenido !== 'string') {
        this.errorFormulario = 'El contenido debe ser un objeto JSON válido.';
        return null;
      }

      try {
        return JSON.parse(contenido);
      } catch (error) {
        this.errorFormulario = 'JSON inválido. Verifica la sintaxis y vuelve a intentar.';
        return null;
      }
    }

    const raw = this.formulario.getRawValue() as Record<string, unknown>;
    const extrasTexto = typeof raw[this.controlCamposAdicionales] === 'string' ? (raw[this.controlCamposAdicionales] as string).trim() : '';
    delete raw[this.controlCamposAdicionales];

    const camposProcesados: Record<string, unknown> = {};

    for (const campo of this.camposFormulario) {
      const valor = raw[campo.key];

      try {
        const normalizado = this.normalizarValorCampo(campo, valor);
        if (normalizado !== undefined) {
          camposProcesados[campo.key] = normalizado;
        }
      } catch (error) {
        this.errorFormulario = error instanceof Error ? error.message : String(error);
        return null;
      }
    }

    let adicionales: Record<string, unknown> = {};
    if (extrasTexto) {
      try {
        const parseado = JSON.parse(extrasTexto);
        if (!parseado || typeof parseado !== 'object' || Array.isArray(parseado)) {
          this.errorFormulario = 'Los campos adicionales deben ser un objeto JSON (clave: valor).';
          return null;
        }
        adicionales = parseado as Record<string, unknown>;
      } catch (error) {
        this.errorFormulario = 'JSON inválido en los campos adicionales. Verifica la sintaxis.';
        return null;
      }
    }

    const base = this.modoFormulario === 'editar' && this.registroSeleccionado
      ? { ...this.registroSeleccionado }
      : {};

    const payload = {
      ...base,
      ...adicionales,
      ...camposProcesados
    };

    // Si estamos en modo CREAR, eliminar el campo ID (identity) para que la BD lo genere automáticamente
    if (this.modoFormulario === 'crear' && this.config?.idField) {
      delete payload[this.config.idField];
    }

    return payload;
  }

  private normalizarValorCampo(campo: AdminResourceFieldConfig, valor: unknown): unknown {
    if (valor === undefined || valor === null) {
      return campo.required ? '' : undefined;
    }

    if (typeof valor === 'string' && !campo.required && !valor.trim()) {
      return undefined;
    }

    switch (campo.type) {
      case 'number': {
        const numero = typeof valor === 'number' ? valor : Number(String(valor).trim());
        if (Number.isNaN(numero)) {
          throw new Error(`El campo "${campo.label}" debe ser numérico.`);
        }
        return numero;
      }
      case 'textarea': {
        const texto = typeof valor === 'string' ? valor : String(valor ?? '');
        return texto || (campo.required ? '' : undefined);
      }
      case 'date':
      case 'email':
      case 'text':
      default: {
        const texto = typeof valor === 'string' ? valor.trim() : String(valor);
        if (!texto && !campo.required) {
          return undefined;
        }
        return texto;
      }
    }
  }

  eliminarRegistro(registro: any): void {
    if (!this.config) {
      return;
    }

    const id = this.obtenerId(registro);
    if (id === null) {
      this.error = 'No se pudo determinar el identificador del registro.';
      return;
    }

    // Mostrar modal personalizado en lugar de window.confirm
    this.registroAEliminar = registro;
    this.idRegistroAEliminar = id;
    this.mostrarModalEliminacion = true;
  }

  cancelarEliminacion(): void {
    this.mostrarModalEliminacion = false;
    this.registroAEliminar = null;
    this.idRegistroAEliminar = null;
  }

  confirmarEliminacion(): void {
    if (!this.registroAEliminar) {
      return;
    }

    const accion$ = this.buildAccionObservable('delete', this.registroAEliminar);
    if (!accion$) {
      this.error = 'No fue posible determinar la acción de eliminación.';
      this.mostrarModalEliminacion = false;
      return;
    }

    this.cargando = true;
    this.mostrarModalEliminacion = false;

    accion$
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.cargando = false))
      )
      .subscribe({
        next: () => {
          this.cargarRegistros();
          this.cargarReportes();
          this.registroAEliminar = null;
          this.idRegistroAEliminar = null;
        },
        error: (err: Error) => {
          this.error = err.message || 'No fue posible eliminar el registro.';
          this.registroAEliminar = null;
          this.idRegistroAEliminar = null;
        }
      });
  }

  trackById = (_: number, item: any) => this.obtenerId(item) ?? JSON.stringify(item);

  obtenerCamposTarjeta(registro: any): Array<{ campo: string; etiqueta: string; valor: unknown }> {
    return this.columnas.map((campo) => ({
      campo,
      etiqueta: this.obtenerEtiquetaCampo(campo),
      valor: this.obtenerValorCampo(registro, campo)
    }));
  }

  obtenerValorCampo(registro: any, campo: string): unknown {
    if (!registro) {
      return undefined;
    }

    if (Object.prototype.hasOwnProperty.call(registro, campo)) {
      return registro[campo];
    }

    const aliasConfigurados = this.config?.fieldAliases?.[campo] ?? [];
    const variantes = this.generarVariantesCampo(campo, aliasConfigurados);

    for (const clave of variantes) {
      if (Object.prototype.hasOwnProperty.call(registro, clave)) {
        return registro[clave];
      }
    }

    return undefined;
  }

  private generarVariantesCampo(campo: string, aliasConfigurados: string[]): string[] {
    const variantes = new Set<string>(aliasConfigurados);

    const lowerCamel = campo.charAt(0).toLowerCase() + campo.slice(1);
    variantes.add(lowerCamel);

    const snake = campo.replace(/([a-z0-9])([A-Z])/g, '$1_$2');
    variantes.add(snake);
    variantes.add(snake.toLowerCase());

    variantes.add(campo.toLowerCase());
    variantes.add(campo.toUpperCase());

    return Array.from(variantes).filter((clave) => clave !== campo);
  }

  private buildAccionObservable(accion: 'create' | 'update' | 'delete', payload: any) {
    switch (accion) {
      case 'create': {
        const path = this.config.createPath ?? this.config.endpoint;
        return this.api.create(path, payload);
      }
      case 'update': {
        const id = this.obtenerId(this.registroSeleccionado ?? payload);
        if (id === null) {
          return null;
        }
        const path = this.resolverRutaConId(this.config.updatePath ?? this.config.endpoint, id);
        return this.api.update(path, payload);
      }
      case 'delete': {
        const id = this.obtenerId(payload);
        if (id === null) {
          return null;
        }

        if (this.config.deleteQueryParam) {
          const path = this.config.deletePath ?? this.config.endpoint;
          return this.api.delete(path, {
            params: { [this.config.deleteQueryParam]: id }
          });
        }

        const base = this.config.deletePath ?? this.config.endpoint;
        const path = this.resolverRutaConId(base, id);
        return this.api.delete(path);
      }
      default:
        return null;
    }
  }

  private resolverRutaConId(basePath: string, id: string | number): string {
    if (basePath.includes(':id')) {
      return basePath.replace(':id', encodeURIComponent(String(id)));
    }

    const limpio = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
    return `${limpio}/${encodeURIComponent(String(id))}`;
  }

  private obtenerId(registro: any): string | number | null {
    if (!registro) {
      return null;
    }

    const campo = this.config.idField || 'id';
    const value = registro[campo] ?? registro['id'] ?? registro['Id'] ?? registro['ID'];
    if (value === undefined || value === null || value === '') {
      return null;
    }
    return value;
  }

  private calcularColumnas(registros: any[]): string[] {
  const columnas: string[] = [];
    const aliasInverso = this.crearMapaAliasInverso();
    const ocultas = new Set(this.config?.hiddenColumns ?? []);

    const agregarColumna = (key: string | undefined | null) => {
      if (!key) {
        return;
      }
      const canonico = aliasInverso.get(key) ?? key;
      if (ocultas.has(canonico)) {
        return;
      }
      if (canonico.startsWith('_')) {
        return;
      }
      if (!columnas.includes(canonico)) {
        columnas.push(canonico);
      }
    };

    this.config?.columns?.forEach((columna) => agregarColumna(columna));
    this.config?.preferredFields?.forEach((campo) => agregarColumna(campo.key));

    registros.forEach((registro) => {
      Object.keys(registro || {}).forEach((key) => agregarColumna(key));
    });

    if (!columnas.length) {
      return columnas;
    }

    const columnasForzadas = new Set(this.config?.columns ?? []);

    return columnas.filter((columna) => {
      if (this.esCampoIdExterno(columna)) {
        return false;
      }
      if (ocultas.has(columna)) {
        return false;
      }
      if (columnasForzadas.has(columna)) {
        return true;
      }

      return registros.some((registro) => this.tieneValorDefinido(this.obtenerValorCampo(registro, columna)));
    });
  }

  obtenerEtiquetaCampo(campo: string): string {
    if (this.esCampoIdPrincipal(campo)) {
      return 'Número de identificación';
    }

    const preferido = this.config?.preferredFields?.find((item) => item.key === campo)?.label;
    if (preferido) {
      return preferido;
    }

    const normalizado = campo
      .replace(/_/g, ' ')
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/\s+/g, ' ')
      .trim();

    return normalizado.charAt(0).toUpperCase() + normalizado.slice(1);
  }

  private crearMapaAliasInverso(): Map<string, string> {
    const mapa = new Map<string, string>();
    const definiciones = this.config?.fieldAliases ?? {};

    Object.entries(definiciones).forEach(([canonico, aliasLista]) => {
      const lista = Array.isArray(aliasLista) ? aliasLista : [];
      lista.forEach((alias) => mapa.set(alias, canonico));
      this.generarVariantesCampo(canonico, lista).forEach((alias) => mapa.set(alias, canonico));
    });

    return mapa;
  }

  private tieneValorDefinido(valor: unknown): boolean {
    if (valor === null || valor === undefined) {
      return false;
    }

    if (typeof valor === 'string') {
      return valor.trim().length > 0;
    }

    if (Array.isArray(valor)) {
      return valor.length > 0;
    }

    if (typeof valor === 'object') {
      return Object.keys(valor as Record<string, unknown>).length > 0;
    }

    return true;
  }

  private generarPlantillaDesdeColumnas(): Record<string, unknown> {
    if (!this.columnas.length) {
      return { campo: 'valor' };
    }

    return this.columnas.reduce<Record<string, unknown>>((acumulado, columna) => {
      acumulado[columna] = '';
      return acumulado;
    }, {});
  }

  obtenerReporte(entrada: AdminReportConfig): ReportState {
    return (
      this.reportesEstado.get(entrada.endpoint) ?? {
        cargando: false,
        error: 'No hay datos para este reporte.',
        datos: null
      }
    );
  }

  esColeccion(valor: unknown): valor is any[] {
    return Array.isArray(valor);
  }

  obtenerColumnasReporte(datos: any[], reporte: AdminReportConfig): string[] {
    if (reporte.columns?.length) {
      return reporte.columns;
    }
    const conjunto = new Set<string>();
    datos.slice(0, 10).forEach((item) => {
      Object.keys(item || {}).forEach((key) => conjunto.add(key));
    });
    return Array.from(conjunto);
  }

  presentarValor(valor: unknown): string {
    if (valor === undefined || valor === null) {
      return '';
    }

    if (typeof valor === 'string') {
      const limpio = valor.trim();
      return limpio;
    }

    if (typeof valor === 'object') {
      try {
        return JSON.stringify(valor);
      } catch (error) {
        return '[objeto]';
      }
    }

    return String(valor);
  }

  presentarJson(valor: unknown): string {
    try {
      return JSON.stringify(valor, null, 2);
    } catch (error) {
      return valor === undefined || valor === null ? '' : String(valor);
    }
  }

  private esCampoIdPrincipal(campo: string): boolean {
    const idPrincipal = this.config?.idField;
    if (!idPrincipal) {
      return false;
    }

    return this.normalizarClave(campo) === this.normalizarClave(idPrincipal);
  }

  private esCampoIdExterno(campo: string): boolean {
    if (this.esCampoIdPrincipal(campo)) {
      return false;
    }

    const clave = this.normalizarClave(campo);

    if (clave === 'id' || clave === 'identificador') {
      return true;
    }

    if (clave.startsWith('id') || clave.endsWith('id')) {
      return true;
    }

    if (clave.includes('_id')) {
      return true;
    }

    return false;
  }

  private normalizarClave(valor: string): string {
    return valor
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase();
  }

  obtenerOpcionesSelect(campo: AdminResourceFieldConfig): { value: any; label: string }[] {
    // Si tiene opciones estáticas, devolverlas
    if (campo.selectOptions && campo.selectOptions.length > 0) {
      return campo.selectOptions;
    }

    // Si tiene endpoint, cargar opciones desde la API
    if (campo.selectEndpoint) {
      const cacheKey = campo.selectEndpoint;
      
      // Si ya está en caché, devolver
      if (this.opcionesSelectCache.has(cacheKey)) {
        return this.opcionesSelectCache.get(cacheKey)!;
      }

      // Si no está en caché, cargar
      this.cargarOpcionesSelect(campo);
      return [];
    }

    return [];
  }

  private cargarOpcionesSelect(campo: AdminResourceFieldConfig): void {
    if (!campo.selectEndpoint) {
      return;
    }

    const cacheKey = campo.selectEndpoint;
    
    // Evitar múltiples llamadas simultáneas
    if (this.opcionesSelectCache.has(cacheKey)) {
      return;
    }

    this.cargandoOpcionesSelect = true;

    this.api
      .list<any>(campo.selectEndpoint)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.cargandoOpcionesSelect = false))
      )
      .subscribe({
        next: (respuesta) => {
          const registros = Array.isArray(respuesta) ? respuesta : respuesta ? [respuesta] : [];
          
          const opciones = registros.map((registro: any) => ({
            value: registro[campo.selectValueKey || 'id'],
            label: registro[campo.selectLabelKey || 'nombre']
          }));

          this.opcionesSelectCache.set(cacheKey, opciones);
        },
        error: (err: Error) => {

          this.opcionesSelectCache.set(cacheKey, []);
        }
      });
  }

  private cargarTodasLasOpcionesSelect(): void {
    // Cargar opciones para todos los campos select que tienen endpoint
    this.camposFormulario
      .filter(campo => campo.type === 'select' && campo.selectEndpoint)
      .forEach(campo => this.cargarOpcionesSelect(campo));
  }
}


