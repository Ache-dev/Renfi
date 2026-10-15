import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Subject, forkJoin, of } from 'rxjs';
import { catchError, finalize, takeUntil } from 'rxjs/operators';
import {
  ESTADOS_FINCA,
  FincaGestion,
  FincaPayload,
  ImagenGestion,
  MunicipioOpcion,
  UsuarioOpcion
} from '../../../core/models/gestion-finca.model';
import { GestionFincasService, ModoGestion } from '../../../core/services/gestion-fincas.service';

type Seccion = 'basico' | 'espacios' | 'detalles' | 'fotos';

const COMODIDADES_SUGERIDAS = [
  'Piscina', 'Jacuzzi', 'WiFi', 'Zona BBQ', 'Parqueadero', 'Cocina dotada', 'Chimenea', 'Aire acondicionado',
  'Cancha deportiva', 'Zona de hamacas', 'Salón de juegos', 'TV por cable', 'Planta eléctrica', 'Senderos'
];

/** Latitud y longitud se envían juntas o ninguna (igual que valida la API). */
const coordenadasJuntas = (grupo: AbstractControl): ValidationErrors | null => {
  const lat = grupo.get('Latitud')?.value;
  const lon = grupo.get('Longitud')?.value;
  const vacio = (v: unknown) => v === null || v === '' || v === undefined;
  return vacio(lat) !== vacio(lon) ? { coordenadasIncompletas: true } : null;
};

@Component({
  selector: 'app-fincas-gestion',
  standalone: false,
  templateUrl: './fincas-gestion.html',
  styleUrls: ['../panel.css', './fincas-gestion.css']
})
export class FincasGestionComponent implements OnInit, OnDestroy {
  /** 'admin': todas las fincas y elige el dueño. 'dueno': solo las suyas. */
  @Input() modo: ModoGestion = 'dueno';

  readonly estados = ESTADOS_FINCA;
  readonly secciones: { id: Seccion; label: string }[] = [
    { id: 'basico', label: 'Básico' },
    { id: 'espacios', label: 'Espacios y horarios' },
    { id: 'detalles', label: 'Detalles' },
    { id: 'fotos', label: 'Fotos' }
  ];

  fincas: FincaGestion[] = [];
  municipios: MunicipioOpcion[] = [];
  usuarios: UsuarioOpcion[] = [];
  cargando = true;
  error = '';
  aviso = '';

  vista: 'lista' | 'editor' = 'lista';
  editando: FincaGestion | null = null;
  seccion: Seccion = 'basico';
  form: FormGroup = new FormGroup({});
  comodidades: string[] = [];
  nuevaComodidad = '';
  guardando = false;
  errorForm = '';

  porEliminar: FincaGestion | null = null;
  eliminando = false;
  cambiandoEstadoId: number | null = null;

  private readonly destroy$ = new Subject<void>();

  constructor(private readonly fb: FormBuilder, private readonly gestion: GestionFincasService) {}

  ngOnInit(): void {
    this.cargar();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get esAdmin(): boolean {
    return this.modo === 'admin';
  }

  get sugerencias(): string[] {
    return COMODIDADES_SUGERIDAS.filter((s) => !this.comodidades.some((c) => c.toLowerCase() === s.toLowerCase()));
  }

  cargar(): void {
    this.cargando = true;
    this.error = '';
    forkJoin({
      fincas: this.gestion.listarFincas(this.modo),
      municipios: this.gestion.listarMunicipios().pipe(catchError(() => of([] as MunicipioOpcion[]))),
      usuarios: this.esAdmin ? this.gestion.listarUsuarios().pipe(catchError(() => of([] as UsuarioOpcion[]))) : of([] as UsuarioOpcion[])
    })
      .pipe(takeUntil(this.destroy$), finalize(() => (this.cargando = false)))
      .subscribe({
        next: ({ fincas, municipios, usuarios }) => {
          this.fincas = fincas;
          this.municipios = municipios;
          this.usuarios = usuarios;
          // Si se estaba editando una finca, se refresca su copia (portada, galería…)
          if (this.editando) {
            this.editando = fincas.find((f) => f.IdFinca === this.editando!.IdFinca) ?? this.editando;
          }
        },
        error: (err: Error) => (this.error = err.message)
      });
  }

  // ---- Lista ----

  nuevaFinca(): void {
    this.abrirEditor(null, 'basico');
  }

  editar(finca: FincaGestion, seccion: Seccion = 'basico'): void {
    this.abrirEditor(finca, seccion);
  }

  private abrirEditor(finca: FincaGestion | null, seccion: Seccion): void {
    this.editando = finca;
    this.seccion = seccion;
    this.errorForm = '';
    this.aviso = '';
    this.construirForm(finca);
    this.comodidades = [...(finca?.Comodidades ?? [])];
    this.nuevaComodidad = '';
    this.vista = 'editor';
    window.scrollTo({ top: 0 });
  }

  volverALista(): void {
    this.vista = 'lista';
    this.editando = null;
    this.cargar();
  }

  alternarDisponibilidad(finca: FincaGestion): void {
    const nuevo = finca.Estado === 'Disponible' ? 'No disponible' : 'Disponible';
    this.cambiandoEstadoId = finca.IdFinca;
    this.error = '';
    this.gestion
      .actualizarFinca(finca.IdFinca, { Estado: nuevo })
      .pipe(takeUntil(this.destroy$), finalize(() => (this.cambiandoEstadoId = null)))
      .subscribe({
        next: () => {
          finca.Estado = nuevo;
          this.aviso = nuevo === 'Disponible' ? `"${finca.NombreFinca}" vuelve a recibir reservas.` : `"${finca.NombreFinca}" está en pausa: no recibirá reservas nuevas.`;
        },
        error: (err: Error) => (this.error = err.message)
      });
  }

  pedirEliminar(finca: FincaGestion): void {
    this.porEliminar = finca;
  }

  cancelarEliminar(): void {
    this.porEliminar = null;
  }

  confirmarEliminar(): void {
    const finca = this.porEliminar;
    if (!finca) {
      return;
    }
    this.eliminando = true;
    this.gestion
      .eliminarFinca(finca.IdFinca)
      .pipe(takeUntil(this.destroy$), finalize(() => (this.eliminando = false)))
      .subscribe({
        next: () => {
          this.porEliminar = null;
          this.aviso = `Se eliminó "${finca.NombreFinca}".`;
          this.cargar();
        },
        error: (err: Error) => {
          this.porEliminar = null;
          this.error = err.message;
        }
      });
  }

  // ---- Editor ----

  private construirForm(f: FincaGestion | null): void {
    const numero = (min: number, max: number) => [Validators.required, Validators.min(min), Validators.max(max)];
    this.form = this.fb.group(
      {
        NombreFinca: [f?.NombreFinca ?? '', [Validators.required, Validators.maxLength(300)]],
        IdMunicipio: [f?.IdMunicipio ?? null, Validators.required],
        Direccion: [f?.Direccion ?? '', [Validators.required, Validators.maxLength(500)]],
        InformacionAdicional: [f?.InformacionAdicional ?? '', Validators.maxLength(500)],
        Precio: [f?.Precio ?? null, numero(1, 100_000_000)],
        Capacidad: [f?.Capacidad ?? null, numero(1, 500)],
        Estado: [f?.Estado ?? 'Disponible', Validators.required],
        NumeroDocumentoUsuario: [f?.NumeroDocumentoUsuario ?? null, this.esAdmin ? Validators.required : []],
        Habitaciones: [f?.Habitaciones ?? 1, numero(0, 100)],
        Banos: [f?.Banos ?? 1, numero(0, 100)],
        Camas: [f?.Camas ?? 1, numero(0, 200)],
        NochesMinimas: [f?.NochesMinimas ?? 1, numero(1, 30)],
        HoraEntrada: [f?.HoraEntrada ?? '15:00', Validators.required],
        HoraSalida: [f?.HoraSalida ?? '11:00', Validators.required],
        PermiteMascotas: [f?.PermiteMascotas ?? false],
        PermiteEventos: [f?.PermiteEventos ?? false],
        Reglas: [f?.Reglas ?? '', Validators.maxLength(1000)],
        Latitud: [f?.Latitud ?? null, [Validators.min(-90), Validators.max(90)]],
        Longitud: [f?.Longitud ?? null, [Validators.min(-180), Validators.max(180)]]
      },
      { validators: coordenadasJuntas }
    );
  }

  campoInvalido(nombre: string): boolean {
    const c = this.form.get(nombre);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  /** Pestañas con errores (para marcarlas en rojo al intentar guardar). */
  seccionConErrores(id: Seccion): boolean {
    const campos: Record<Seccion, string[]> = {
      basico: ['NombreFinca', 'IdMunicipio', 'Direccion', 'InformacionAdicional', 'Precio', 'Capacidad', 'Estado', 'NumeroDocumentoUsuario'],
      espacios: ['Habitaciones', 'Banos', 'Camas', 'NochesMinimas', 'HoraEntrada', 'HoraSalida'],
      detalles: ['Reglas', 'Latitud', 'Longitud'],
      fotos: []
    };
    const coordenadas = id === 'detalles' && this.form.hasError('coordenadasIncompletas') && this.form.touched;
    return coordenadas || campos[id].some((c) => this.form.get(c)?.invalid && this.form.get(c)?.touched);
  }

  irA(seccion: Seccion): void {
    if (seccion === 'fotos' && !this.editando) {
      return;
    }
    this.seccion = seccion;
  }

  agregarComodidad(texto: string = this.nuevaComodidad): void {
    for (const parte of texto.split(',')) {
      const limpio = parte.trim();
      if (!limpio) {
        continue;
      }
      if (limpio.length > 50) {
        this.errorForm = 'Cada comodidad admite máximo 50 caracteres.';
        return;
      }
      if (this.comodidades.length >= 30) {
        this.errorForm = 'Puedes agregar hasta 30 comodidades.';
        return;
      }
      if (!this.comodidades.some((c) => c.toLowerCase() === limpio.toLowerCase())) {
        this.comodidades.push(limpio);
      }
    }
    this.errorForm = '';
    this.nuevaComodidad = '';
  }

  quitarComodidad(indice: number): void {
    this.comodidades.splice(indice, 1);
  }

  guardar(): void {
    this.agregarComodidad(); // si quedó una escrita sin confirmar
    this.form.markAllAsTouched();
    this.errorForm = '';

    if (this.form.invalid) {
      this.seccion = (['basico', 'espacios', 'detalles'] as Seccion[]).find((s) => this.seccionConErrores(s)) ?? this.seccion;
      this.errorForm = this.form.hasError('coordenadasIncompletas')
        ? 'Latitud y longitud deben ir juntas: completa ambas o deja las dos vacías.'
        : 'Revisa los campos marcados en rojo.';
      return;
    }

    const v = this.form.getRawValue();
    const vacioANull = (x: unknown) => (x === '' || x === null || x === undefined ? null : Number(x));
    const payload: FincaPayload = {
      NombreFinca: String(v.NombreFinca).trim(),
      IdMunicipio: Number(v.IdMunicipio),
      Direccion: String(v.Direccion).trim(),
      InformacionAdicional: String(v.InformacionAdicional ?? '').trim(),
      Precio: Number(v.Precio),
      Capacidad: Number(v.Capacidad),
      Estado: v.Estado,
      Habitaciones: Number(v.Habitaciones),
      Banos: Number(v.Banos),
      Camas: Number(v.Camas),
      NochesMinimas: Number(v.NochesMinimas),
      HoraEntrada: v.HoraEntrada,
      HoraSalida: v.HoraSalida,
      PermiteMascotas: !!v.PermiteMascotas,
      PermiteEventos: !!v.PermiteEventos,
      Reglas: String(v.Reglas ?? '').trim() || null,
      Comodidades: [...this.comodidades],
      Latitud: vacioANull(v.Latitud),
      Longitud: vacioANull(v.Longitud)
    };
    if (this.esAdmin) {
      payload.NumeroDocumentoUsuario = Number(v.NumeroDocumentoUsuario);
    }

    this.guardando = true;
    const creando = !this.editando;
    const peticion$ = creando ? this.gestion.crearFinca(payload) : this.gestion.actualizarFinca(this.editando!.IdFinca, payload);

    peticion$.pipe(takeUntil(this.destroy$), finalize(() => (this.guardando = false))).subscribe({
      next: (resp) => {
        const finca = resp.finca;
        if (creando && finca) {
          // Recién creada: se queda en el editor y pasa directo a las fotos
          this.editando = finca;
          this.seccion = 'fotos';
          this.aviso = 'Finca creada. Ahora sube las fotos para que aparezca atractiva en el catálogo.';
          this.cargar();
        } else {
          this.aviso = 'Cambios guardados.';
          if (finca) {
            this.editando = finca;
          }
          this.cargar();
        }
        window.scrollTo({ top: 0 });
      },
      error: (err: Error) => (this.errorForm = err.message)
    });
  }

  alCambiarGaleria(imagenes: ImagenGestion[]): void {
    if (this.editando) {
      this.editando = { ...this.editando, Imagenes: imagenes, UrlPortada: imagenes[0]?.UrlImagen ?? null };
    }
    const enLista = this.fincas.find((f) => f.IdFinca === this.editando?.IdFinca);
    if (enLista) {
      enLista.Imagenes = imagenes;
      enLista.UrlPortada = imagenes[0]?.UrlImagen ?? null;
    }
  }

  nombreDueno(finca: FincaGestion): string {
    return [finca.NombrePropietario, finca.ApellidoPropietario].filter(Boolean).join(' ');
  }

  etiquetaUsuario(u: UsuarioOpcion): string {
    return `${u.NombreUsuario} ${u.ApellidoUsuario} · ${u.Correo}${u.Rol ? ' (' + u.Rol + ')' : ''}`;
  }

  trackFinca = (_: number, f: FincaGestion) => f.IdFinca;
}
