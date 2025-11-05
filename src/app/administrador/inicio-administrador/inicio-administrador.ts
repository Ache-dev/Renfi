import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AdminApiService } from '../services/admin-api.service';
import { ADMIN_RESOURCES, AdminReportConfig } from '../admin-resources.config';

interface IndicadorResumen {
  id: string;
  titulo: string;
  descripcion: string;
  icono: string;
  ruta: string;
  total: number | null;
  cargando: boolean;
  error: string;
}

interface ReporteDestacado {
  config: AdminReportConfig;
  titulo: string;
  descripcion: string;
  cargando: boolean;
  error: string;
  datos: any;
  filas: Record<string, unknown>[];
  columnas: ReporteColumna[];
}

interface ReporteColumna {
  key: string;
  label: string;
}

@Component({
  selector: 'app-inicio-administrador',
  standalone: false,
  templateUrl: './inicio-administrador.html',
  styleUrl: './inicio-administrador.css'
})
export class InicioAdministrador implements OnInit, OnDestroy {
  indicadores: IndicadorResumen[] = [
    {
      id: 'usuarios',
      titulo: 'Usuarios activos',
      descripcion: 'Personas registradas en Renfi',
      icono: '🧑‍🤝‍🧑',
      ruta: '/administrador/usuarios',
      total: null,
      cargando: true,
      error: ''
    },
    {
      id: 'fincas',
      titulo: 'Fincas registradas',
      descripcion: 'Inmuebles activos para reserva',
      icono: '🏡',
      ruta: '/administrador/fincas',
      total: null,
      cargando: true,
      error: ''
    },
    {
      id: 'reservas',
      titulo: 'Reservas totales',
      descripcion: 'Histórico de reservas realizadas',
      icono: '🗓️',
      ruta: '/administrador/reservas',
      total: null,
      cargando: true,
      error: ''
    },
    {
      id: 'pagos',
      titulo: 'Pagos registrados',
      descripcion: 'Transacciones históricas',
      icono: '💳',
      ruta: '/administrador/pagos',
      total: null,
      cargando: true,
      error: ''
    }
  ];

  reportes: ReporteDestacado[] = [
    {
      config: ADMIN_RESOURCES['fincas'].reports?.[0]!,
      titulo: 'Fincas más reservadas',
      descripcion: 'Ranking de fincas con mayor demanda en la plataforma.',
      cargando: true,
      error: '',
      datos: null,
      filas: [],
      columnas: []
    },
    {
      config: ADMIN_RESOURCES['pagos'].reports?.[0]!,
      titulo: 'Pagos pendientes',
      descripcion: 'Pagos a revisar y aprobar por el equipo administrativo.',
      cargando: true,
      error: '',
      datos: null,
      filas: [],
      columnas: []
    }
  ].filter((reporte) => !!reporte.config);

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly api: AdminApiService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.cargarIndicadores();
    this.cargarReportesDestacados();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  navegar(ruta: string): void {
    this.router.navigate([ruta]);
  }

  refrescar(): void {
    this.cargarIndicadores();
    this.cargarReportesDestacados();
  }

  private cargarIndicadores(): void {
    const endpoints: Record<string, string> = {
      usuarios: 'usuario',
      fincas: 'finca',
      reservas: 'reserva',
      pagos: 'pago'
    };

    this.indicadores = this.indicadores.map((indicador) => ({
      ...indicador,
      cargando: true,
      error: ''
    }));

    this.indicadores.forEach((indicador) => {
      const endpoint = endpoints[indicador.id];
      if (!endpoint) {
        indicador.cargando = false;
        indicador.error = 'Sin endpoint configurado';
        return;
      }

      this.api
        .list<any>(endpoint)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => (indicador.cargando = false))
        )
        .subscribe({
          next: (respuesta) => {
            if (Array.isArray(respuesta)) {
              indicador.total = respuesta.length;
            } else if (respuesta && typeof respuesta === 'object') {
              indicador.total = Object.keys(respuesta).length;
            } else {
              indicador.total = 0;
            }
          },
          error: (err: Error) => {
            indicador.error = err.message || 'No disponible';
            indicador.total = null;
          }
        });
    });
  }

  private cargarReportesDestacados(): void {
    this.reportes.forEach((reporte) => {
      if (!reporte.config) {
        reporte.cargando = false;
        reporte.error = 'Sin configuración disponible';
        return;
      }

      reporte.cargando = true;
      reporte.error = '';

      this.api
        .list<any>(reporte.config.endpoint)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => (reporte.cargando = false))
        )
        .subscribe({
          next: (respuesta) => {
            reporte.datos = respuesta;
            const normalizado = this.normalizarDatos(respuesta, reporte.config);
            reporte.filas = normalizado.filas;
            reporte.columnas = normalizado.columnas;
          },
          error: (err: Error) => {
            reporte.error = err.message || 'No fue posible consultar este reporte.';
            reporte.datos = null;
            reporte.filas = [];
            reporte.columnas = [];
          }
        });
    });
  }

  private normalizarDatos(datos: unknown, config: AdminReportConfig): { filas: Record<string, unknown>[]; columnas: ReporteColumna[] } {
    if (Array.isArray(datos)) {
      const filas = datos.map((fila, indice) => {
        if (fila && typeof fila === 'object') {
          return fila as Record<string, unknown>;
        }

        return {
          posicion: indice + 1,
          valor: fila
        } as Record<string, unknown>;
      });

      return {
        filas,
        columnas: this.crearColumnas(filas, config)
      };
    }

    if (datos && typeof datos === 'object') {
      const entradas = Object.entries(datos as Record<string, unknown>);
      const filas = entradas.map(([clave, valor]) => ({
        concepto: this.formatearColumna(clave),
        valor
      }));

      return {
        filas,
        columnas: [
          { key: 'concepto', label: 'Concepto' },
          { key: 'valor', label: 'Valor' }
        ]
      };
    }

    if (datos === null || datos === undefined) {
      return { filas: [], columnas: [] };
    }

    return {
      filas: [{ valor: datos as unknown }],
      columnas: [{ key: 'valor', label: 'Valor' }]
    };
  }

  private crearColumnas(filas: Record<string, unknown>[], config: AdminReportConfig): ReporteColumna[] {
    if (!filas.length) {
      return config.columns?.map((columna) => this.crearColumna(columna)) ?? [];
    }

    const columnasConfiguradas = config.columns?.length ? config.columns : this.obtenerColumnasDinamicas(filas);
    return columnasConfiguradas.map((columna) => this.crearColumna(columna));
  }

  private obtenerColumnasDinamicas(filas: Record<string, unknown>[]): string[] {
    const conjunto = new Set<string>();
    filas.slice(0, 10).forEach((fila) => {
      Object.keys(fila || {}).forEach((columna) => conjunto.add(columna));
    });
    return Array.from(conjunto);
  }

  private crearColumna(key: string): ReporteColumna {
    return {
      key,
      label: this.formatearColumna(key)
    };
  }

  formatearValor(valor: unknown): string {
    if (valor === undefined || valor === null || valor === '') {
      return '—';
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

  formatearColumna(columna: string): string {
    if (!columna) {
      return '';
    }

    const conEspacios = columna
      .replace(/_/g, ' ')
      .replace(/([a-záéíóúñ])([A-ZÁÉÍÓÚÑ])/g, '$1 $2')
      .replace(/\s+/g, ' ')
      .trim();

    return conEspacios
      .split(' ')
      .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
      .join(' ');
  }

}
