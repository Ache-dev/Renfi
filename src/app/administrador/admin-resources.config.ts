export interface AdminResourceFieldConfig {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'email' | 'date' | 'textarea' | 'select' | 'password';
  required?: boolean;
  readOnly?: boolean;
  selectOptions?: { value: any; label: string }[];
  selectEndpoint?: string;
  selectValueKey?: string;
  selectLabelKey?: string;
}

export interface AdminReportConfig {
  label: string;
  endpoint: string;
  description?: string;
  columns?: string[];
}

export interface AdminResourceConfig {
  id: string;
  title: string;
  endpoint: string;
  description?: string;
  idField?: string;
  createPath?: string;
  updatePath?: string;
  deletePath?: string;
  deleteQueryParam?: string;
  columns?: string[];
  preferredFields?: AdminResourceFieldConfig[];
  fieldAliases?: Record<string, string[]>;
  hiddenColumns?: string[];
  samplePayload?: Record<string, unknown>;
  reports?: AdminReportConfig[];
}

export const ADMIN_RESOURCES: Record<string, AdminResourceConfig> = {
  usuarios: {
    id: 'usuarios',
    title: 'Usuarios',
    endpoint: 'usuario',
    description: 'Crea, actualiza y administra los usuarios registrados en Renfi.',
    idField: 'NumeroDocumento',
    deletePath: 'usuario/delete',
    deleteQueryParam: 'id',
    columns: [
      'NumeroDocumento',
      'NombreUsuario',
      'ApellidoUsuario',
      'Telefono',
      'Correo',
      'Contrasena',
      'Estado',
      'IdRol',
      'NombreRol'
    ],
    preferredFields: [
      { key: 'NombreUsuario', label: 'Nombre', required: true },
      { key: 'ApellidoUsuario', label: 'Apellido', required: true },
      { key: 'Correo', label: 'Correo', type: 'email', required: true },
      { key: 'Contrasena', label: 'Contraseña', type: 'password', required: true },
      { key: 'Telefono', label: 'Teléfono', type: 'text' },
      { 
        key: 'IdRol', 
        label: 'Rol', 
        type: 'select',
        required: true,
        selectEndpoint: 'rol',
        selectValueKey: 'IdRol',
        selectLabelKey: 'NombreRol'
      },
      { 
        key: 'Estado', 
        label: 'Estado', 
        type: 'select',
        required: true,
        selectOptions: [
          { value: 'Activo', label: 'Activo' },
          { value: 'Inactivo', label: 'Inactivo' }
        ]
      }
    ],
    samplePayload: {
      NombreUsuario: 'Nuevo',
      ApellidoUsuario: 'Usuario',
      Telefono: '3001234567',
      Correo: 'correo@renfi.com',
      Contrasena: '123456',
      Estado: 'Activo',
      IdRol: 2
    }
  },
  fincas: {
    id: 'fincas',
    title: 'Fincas',
    endpoint: 'finca',
    description: 'Gestiona la información de las fincas disponibles.',
    idField: 'IdFinca',
    columns: [
      'IdFinca',
      'NombreFinca',
      'Direccion',
      'NombreMunicipio',
      'Precio',
      'Capacidad',
      'Estado',
      'Calificacion',
      'NombrePropietario',
      'ApellidoPropietario',
      'TelefonoPropietario',
      'CorreoPropietario'
    ],
    preferredFields: [
      { key: 'NombreFinca', label: 'Nombre de la finca', required: true },
      { key: 'Direccion', label: 'Dirección', required: true },
      { key: 'NombreMunicipio', label: 'Municipio' },
      { key: 'Precio', label: 'Precio por noche', type: 'number' },
      { key: 'Capacidad', label: 'Capacidad', type: 'number' },
      { key: 'Estado', label: 'Estado' },
      { key: 'InformacionAdicional', label: 'Información adicional', type: 'textarea' },
      { key: 'Calificacion', label: 'Calificación', type: 'number' },
      { key: 'NombrePropietario', label: 'Nombre del propietario' },
      { key: 'ApellidoPropietario', label: 'Apellido del propietario' },
      { key: 'TelefonoPropietario', label: 'Teléfono del propietario', type: 'text' },
      { key: 'CorreoPropietario', label: 'Correo del propietario', type: 'email' }
    ],
    samplePayload: {
      NombreFinca: 'Finca de ejemplo',
      Direccion: 'Vereda el Paraíso',
      NombreMunicipio: 'Manizales',
      Precio: 250000,
      Capacidad: 12,
      Estado: 'Disponible',
      InformacionAdicional: 'Piscina climatizada y zona BBQ.',
      Calificacion: 5,
      NombrePropietario: 'Laura',
      ApellidoPropietario: 'Gomez',
      TelefonoPropietario: '3001234567',
      CorreoPropietario: 'laura@renfi.com'
    },
    reports: [
      {
        label: 'Más reservadas',
        endpoint: 'finca/report/mas-reservadas',
        description: 'Listado de las fincas con mayor número de reservas.'
      },
      {
        label: 'Promedio de calificación',
        endpoint: 'finca/report/promedio-calificacion',
        description: 'Calificación promedio por finca.'
      },
      {
        label: 'Total ingresos',
        endpoint: 'finca/report/total-ingresos',
        description: 'Acumulado de ingresos por finca.'
      },
      {
        label: 'Más ingresos',
        endpoint: 'finca/report/mas-ingresos',
        description: 'Fincas con mayores ingresos generados.'
      }
    ]
  },
  reservas: {
    id: 'reservas',
    title: 'Reservas',
    endpoint: 'reserva',
    description: 'Control y seguimiento de reservas realizadas.',
    idField: 'IdReserva',
    columns: [
      'IdReserva',
      'FechaReserva',
      'IdFinca',
      'NombreFinca',
      'PrecioFinca',
      'EstadoFinca',
      'NombreMunicipio',
      'FechaEntrada',
      'FechaSalida',
      'MontoReserva',
      'Estado',
      'IdPropietario',
      'NombrePropietario',
      'ApellidoPropietario'
    ],
    preferredFields: [
      { key: 'NumeroDocumento', label: 'Usuario (Documento)', type: 'number', required: true },
      { key: 'IdFinca', label: 'Finca (ID)', type: 'number', required: true },
      { key: 'NombreFinca', label: 'Nombre de la finca', type: 'text' },
      { key: 'PrecioFinca', label: 'Precio por noche', type: 'number' },
      { key: 'EstadoFinca', label: 'Estado de la finca', type: 'text' },
      { key: 'NombreMunicipio', label: 'Municipio', type: 'text' },
      { key: 'FechaReserva', label: 'Fecha de reserva', type: 'date' },
      { key: 'FechaEntrada', label: 'Fecha de entrada', type: 'date', required: true },
      { key: 'FechaSalida', label: 'Fecha de salida', type: 'date', required: true },
      { key: 'MontoReserva', label: 'Monto de la reserva', type: 'number' },
      { key: 'Estado', label: 'Estado', type: 'text' },
      { key: 'IdPropietario', label: 'Propietario (ID)', type: 'number' },
      { key: 'NombrePropietario', label: 'Nombre del propietario', type: 'text' },
      { key: 'ApellidoPropietario', label: 'Apellido del propietario', type: 'text' }
    ],
    fieldAliases: {
      NumeroDocumento: ['IdUsuario', 'UsuarioId', 'usuarioId', 'idUsuario', 'UsuarioID', 'numeroDocumento', 'Numero_Documento']
    },
    hiddenColumns: ['NumeroDocumento'],
    samplePayload: {
      NumeroDocumento: 123456789,
      IdFinca: 1,
      NombreFinca: 'Finca El Paraíso',
      PrecioFinca: 500000,
      EstadoFinca: 'Disponible',
      NombreMunicipio: 'Itagüí',
      FechaReserva: '2025-01-10',
      FechaEntrada: '2025-01-15',
      FechaSalida: '2025-01-18',
      MontoReserva: 1500000,
      Estado: 'Confirmada',
      IdPropietario: 2,
      NombrePropietario: 'Laura',
      ApellidoPropietario: 'Gomez'
    }
  },
  pagos: {
    id: 'pagos',
    title: 'Pagos',
    endpoint: 'pago',
    description: 'Registro y estado de pagos realizados por reservas.',
    idField: 'IdPago',
    columns: [
      'Monto',
      'FechaPago',
      'EstadoPago',
      'NombreMetodoDePago',
      'PagoMixto',
      'IdReserva',
      'IdFactura',
      'TotalFactura'
    ],
    preferredFields: [
      { key: 'IdReserva', label: 'Reserva (ID)', type: 'number', required: true },
      { key: 'Monto', label: 'Monto del pago', type: 'number', required: true },
      { key: 'FechaPago', label: 'Fecha de pago', type: 'date', required: true },
      { key: 'EstadoPago', label: 'Estado del pago', type: 'text' },
      { key: 'NombreMetodoDePago', label: 'Método de pago', type: 'text' },
      { key: 'PagoMixto', label: 'Pago mixto', type: 'text' },
      { key: 'IdFactura', label: 'Factura (ID)', type: 'number' },
      { key: 'TotalFactura', label: 'Total facturado', type: 'number' }
    ],
    fieldAliases: {
      Monto: ['Valor', 'valor', 'Total', 'total'],
      EstadoPago: ['Estado', 'estado'],
      NombreMetodoDePago: ['Metodo', 'metodo', 'NombreMetodo', 'nombreMetodo']
    },
    samplePayload: {
      IdReserva: 1,
      Monto: 1500000,
      FechaPago: '2025-10-21T00:00:00.000Z',
      EstadoPago: 'Pagado',
      NombreMetodoDePago: 'Tarjeta de crédito',
      PagoMixto: false,
      IdFactura: 1,
      TotalFactura: 1500000
    },
    reports: [
      {
        label: 'Pagos pendientes',
        endpoint: 'pago/report/pendientes',
        description: 'Pagos con estado pendiente por confirmar.'
      }
    ]
  },
  facturas: {
    id: 'facturas',
    title: 'Facturas',
    endpoint: 'factura',
    description: 'Generación de facturas asociadas a pagos.',
    idField: 'IdFactura',
    columns: [
      'FechaFactura',
      'Total',
      'IdReserva',
      'EstadoReserva',
      'NombreFinca',
      'PrecioFinca',
      'NombreMunicipio',
      'IdPropietario',
      'NombrePropietario',
      'ApellidoPropietario'
    ],
    preferredFields: [
      { key: 'FechaFactura', label: 'Fecha de factura', type: 'date', required: true },
      { key: 'Total', label: 'Total facturado', type: 'number', required: true },
      { key: 'IdReserva', label: 'Reserva (ID)', type: 'number', required: true },
      { key: 'EstadoReserva', label: 'Estado de la reserva', type: 'text' },
      { key: 'NombreFinca', label: 'Nombre de la finca', type: 'text' },
      { key: 'PrecioFinca', label: 'Precio de la finca', type: 'number' },
      { key: 'NombreMunicipio', label: 'Municipio', type: 'text' },
      { key: 'IdPropietario', label: 'Propietario (ID)', type: 'number' },
      { key: 'NombrePropietario', label: 'Nombre del propietario', type: 'text' },
      { key: 'ApellidoPropietario', label: 'Apellido del propietario', type: 'text' }
    ],
    fieldAliases: {
      FechaFactura: ['FechaEmision', 'fechaEmision'],
      Total: ['TotalFactura', 'totalFactura']
    },
    samplePayload: {
      FechaFactura: '2025-10-20T00:00:00.000Z',
      Total: 1500000,
      IdReserva: 1,
      EstadoReserva: 'Activa',
      NombreFinca: 'Finca El Paraíso',
      PrecioFinca: 500000,
      NombreMunicipio: 'Itagüí',
      IdPropietario: 2,
      NombrePropietario: 'Laura',
      ApellidoPropietario: 'Gomez'
    }
  },
  'metodos-de-pago': {
    id: 'metodos-de-pago',
    title: 'Métodos de pago',
    endpoint: 'metododepago',
    description: 'Configura y habilita los métodos de pago aceptados.',
    idField: 'IdMetodoDePago',
    columns: ['NombreMetodoDePago', 'PagoMixto'],
    preferredFields: [
      { key: 'NombreMetodoDePago', label: 'Nombre del método', required: true },
      { key: 'PagoMixto', label: 'Permite pago mixto', type: 'text' }
    ],
    fieldAliases: {
      IdMetodoDePago: ['IdMetodoPago', 'idMetodoPago'],
      NombreMetodoDePago: ['Nombre', 'nombre']
    },
    samplePayload: {
      NombreMetodoDePago: 'Efectivo',
      PagoMixto: false
    }
  },
  imagenes: {
    id: 'imagenes',
    title: 'Imágenes',
    endpoint: 'imagen',
    description: 'Administra las imágenes asignadas a cada finca.',
    idField: 'IdImagen',
    columns: [
      'IdImagen',
      'UrlImagen',
      'IdFinca'
    ],
    preferredFields: [
      { key: 'UrlImagen', label: 'URL de la imagen', type: 'text', required: true },
      { key: 'IdFinca', label: 'Finca (ID)', type: 'number', required: true }
    ],
    fieldAliases: {
      UrlImagen: ['Url', 'url', 'ImagenUrl', 'imagenUrl']
    },
    samplePayload: {
      UrlImagen: 'https://renfi.com/img/paraiso1.jpg',
      IdFinca: 1
    }
  },
  municipios: {
    id: 'municipios',
    title: 'Municipios',
    endpoint: 'municipio',
    description: 'Cobertura geográfica y estadísticas de reservas por municipio.',
    idField: 'IdMunicipio',
    columns: ['IdMunicipio', 'NombreMunicipio'],
    preferredFields: [
      { key: 'NombreMunicipio', label: 'Nombre del municipio', required: true }
    ],
    samplePayload: {
      NombreMunicipio: 'Itagüí'
    },
    reports: [
      {
        label: 'Municipios con más reservas',
        endpoint: 'municipio/report/mas-reservas',
        description: 'Ranking de municipios con mayor número de reservas.'
      }
    ]
  },
  roles: {
    id: 'roles',
    title: 'Roles',
    endpoint: 'rol',
    description: 'Perfiles y permisos disponibles para los usuarios.',
    idField: 'IdRol',
    columns: ['IdRol', 'NombreRol'],
    preferredFields: [{ key: 'NombreRol', label: 'Nombre del rol', required: true }],
    samplePayload: {
      NombreRol: 'Administrador'
    }
  }
};
