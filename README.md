# 🏡 Renfi - Frontend Web

<p align="center">
  <img src="public/favicon.svg" alt="Renfi Logo" width="80" height="80">
</p>

<p align="center">
  <strong>Plataforma Web para la Gestión y Reserva de Fincas Vacacionales</strong><br>
  Construida con Angular, arquitectura modular, principios Clean Code y optimización de rendimiento.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Angular-20.3-DD0031?style=for-the-badge&logo=angular&logoColor=white" alt="Angular 20">
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white" alt="Bootstrap">
  <img src="https://img.shields.io/badge/RxJS-7.8-B7178C?style=for-the-badge&logo=reactivex&logoColor=white" alt="RxJS">
  <img src="https://img.shields.io/badge/License-MIT-green.style=for-the-badge" alt="MIT License">
</p>

---

## 📖 Tabla de Contenidos

1. [Descripción del Proyecto](#-descripción-del-proyecto)
2. [Arquitectura y Clean Code](#-arquitectura-y-principios-clean-code)
3. [Estructura del Código](#-estructura-del-código)
4. [Módulos y Enrutamiento](#-módulos-y-enrutamiento-lazy-loading)
5. [Capa Core: Servicios, Modelos e Interceptores](#-capa-core)
6. [Seguridad y Autenticación](#-seguridad-y-autenticación)
7. [Configuración de Entornos](#-configuración-de-entornos)
8. [Instalación y Despliegue](#-instalación-y-despliegue)
9. [Equipo y Autoría](#-equipo-y-autoría)

---

## 🌟 Descripción del Proyecto

**Renfi** es una plataforma web integral orientada a optimizar la búsqueda, exploración y reserva de fincas turísticas y vacacionales. Permite a los usuarios consultar propiedades, aplicar filtros dinámicos (ubicación/municipio, capacidad, rango de precios, servicios), gestionar sus reservas y realizar pagos de forma segura.

Asimismo, cuenta con un módulo de **Administración** con un CRUD dinámico y vistas analíticas de reportes para controlar fincas, usuarios, reservas, pagos, facturas, métodos de pago, municipios y roles.

---

## 🏛️ Arquitectura y Principios Clean Code

El frontend sigue las mejores prácticas de ingeniería de software y Clean Code:

* **Separación de Responsabilidades (SoC):** Desacoplamiento estricto entre presentación (componentes), lógica de negocio y comunicación HTTP (servicios), y definición de tipos (modelos).
* **Single Responsibility Principle (SRP):** Cada servicio se especializa en una entidad o dominio (`FincaService`, `UsuarioService`, `ImagenService`, `AuthService`, `ReservaService`, `AdminApiService`).
* **Dependency Inversion & Injection (DI):** Inyección de dependencias modular a través de providers e interceptores Angular.
* **Lazy Loading:** El módulo administrativo (`AdministradorModule`) se carga bajo demanda (on-demand), optimizando el bundle inicial y el tiempo de carga First Contentful Paint (FCP).
* **Centralización de Configuración:** Endpoints parametrizados a través de `environment.ts` y `environment.development.ts`, eliminando URLs quemadas (*hardcoded*).
* **Rendimiento de Recursos Web:** Centralización de tipografías Web (Google Fonts Montserrat) en `index.html` con `preconnect`, eliminando la inyección duplicada de fuentes en componentes.
* **Control de Acceso Declarativo:** Guards de enrutamiento (`AdminGuard`) y estado de autenticación reactivo con RxJS `BehaviorSubject`.

---

## 📁 Estructura del Código

```text
Renfi/
├── public/                     # Activos estáticos (favicon, iconos)
├── src/
│   ├── app/
│   │   ├── core/               # Capa transversal y lógica de dominio (Clean Code)
│   │   │   ├── interceptors/   # Interceptores HTTP (AuthInterceptor con JWT)
│   │   │   ├── models/         # Modelos e interfaces de dominio tipadas
│   │   │   │   ├── finca.model.ts
│   │   │   │   ├── usuario.model.ts
│   │   │   │   ├── reserva.model.ts
│   │   │   │   ├── pago.model.ts
│   │   │   │   ├── factura.model.ts
│   │   │   │   ├── imagen.model.ts
│   │   │   │   └── index.ts
│   │   │   └── services/       # Servicios singleton de consumo y negocio
│   │   │       ├── finca.service.ts
│   │   │       ├── usuario.service.ts
│   │   │       └── imagen.service.ts
│   │   │
│   │   ├── template/           # Módulo público y vistas de navegación
│   │   │   ├── header-component/
│   │   │   ├── footer-component/
│   │   │   ├── inicio-component/            # Landing page con buscador avanzado
│   │   │   ├── fincas-relevantes-component/ # Carrusel reactivo de fincas
│   │   │   ├── detalle-finca-component/     # Ficha técnica, disponibilidad y reserva
│   │   │   ├── iniciar-sesion-component/    # Login con hashing SHA-512
│   │   │   ├── registrarse-component/       # Registro de nuevos usuarios
│   │   │   ├── sobre-nosotros-component/    # Información institucional y contacto
│   │   │   ├── services/                    # Servicios de checkout y estado de sesión
│   │   │   └── template-module.ts
│   │   │
│   │   ├── usuario/            # Módulo de usuario y cliente
│   │   │   ├── mi-cuenta-usuarios/          # Perfil, edición y cancelación de reservas
│   │   │   ├── pasarela-pago-usuario/       # Proceso de pago con métodos seleccionables
│   │   │   ├── comprovante-reserva-usuario/ # Voucher descargable / imprimible
│   │   │   ├── listar-usuarios/             # Vista auxiliar de usuarios
│   │   │   └── usuario-module.ts
│   │   │
│   │   ├── administrador/      # Módulo Administrativo (Lazy Loaded)
│   │   │   ├── administrador-module.ts      # Módulo empaquetado para carga diferida
│   │   │   ├── administrador-routing-module.ts
│   │   │   ├── administrador.ts / .html     # Shell layout con navegación lateral
│   │   │   ├── inicio-administrador/        # Dashboard de KPIs y métricas clave
│   │   │   ├── header-administrador/        # Cabecera administrativa con sesión
│   │   │   ├── resource-crud/               # CRUD genérico configurable
│   │   │   ├── admin-resources.config.ts    # Meta-configuración de tablas y formularios
│   │   │   ├── finca-administrador/
│   │   │   ├── usuario-administrador/
│   │   │   ├── reserva-administrador/
│   │   │   ├── pago-administrador/
│   │   │   ├── factura-administrador/
│   │   │   ├── metododepago-administrador/
│   │   │   ├── imagen-administrador/
│   │   │   ├── municipio-administrador/
│   │   │   ├── rol-administrador/
│   │   │   ├── guards/                      # AdminGuard
│   │   │   └── services/                    # AdminApiService
│   │   │
│   │   ├── app.ts / app.html   # Componente raíz
│   │   ├── app-module.ts       # Módulo principal de la aplicación
│   │   └── app-routing-module.ts
│   │
│   ├── environments/           # Variables de entorno
│   │   ├── environment.ts                   # Producción
│   │   ├── environment.development.ts       # Desarrollo local
│   │   └── environment.prod.ts
│   │
│   ├── index.html              # Plantilla HTML con precarga de Montserrat y Bootstrap
│   ├── main.ts                 # Punto de entrada de arranque de Angular
│   └── styles.css              # Tokens de diseño CSS (Design System de Renfi)
│
├── angular.json                # Configuración de compilación, budgets y activos
├── package.json                # Dependencias y scripts de ejecución
├── tsconfig.json               # Configuración de TypeScript
└── README.md                   # Documentación técnica
```

---

## ⚡ Módulos y Enrutamiento (Lazy Loading)

El enrutador (`AppRoutingModule`) aplica división de código (*code-splitting*) para garantizar que las secciones pesadas no impacten el tiempo de carga del usuario común:

| Ruta | Componente / Módulo | Acceso | Carga |
|---|---|---|---|
| `/inicio` | `InicioComponent` | Público | Eager |
| `/fincas/:id` | `DetalleFincaComponent` | Público | Eager |
| `/iniciar-sesion` | `IniciarSesionComponent` | Público | Eager |
| `/registrarse` | `RegistrarseComponent` | Público | Eager |
| `/sobre-nosotros` | `SobreNosotrosComponent` | Público | Eager |
| `/mi-cuenta` | `MiCuentaUsuarios` | Autenticado | Eager |
| `/reserva/pago` | `PasarelaPagoUsuario` | Autenticado | Eager |
| `/reserva/comprobante` | `ComprovanteReservaUsuario` | Autenticado | Eager |
| `/administrador/*` | `AdministradorModule` | Rol Administrador (`AdminGuard`) | **Lazy Loaded** |

---

## 🧩 Capa Core

### 1. `FincaService`
Centraliza la obtención de datos de fincas, mapeo tolerante a variantes de nombres en la API y combinación reactiva con imágenes:
- `getFincas()`: Retorna lista tipada `Observable<Finca[]>`.
- `getFincaById(id)`: Retorna una finca específica con fallback.
- `getFincasConImagenes()`: Consulta fincas y resuelve paralelamente las galerías multimedia mediante `forkJoin`.

### 2. `UsuarioService`
Gestiona la consulta y recuperación de datos de usuarios:
- `getUsuarios()`: Obtiene el listado completo de usuarios.
- `getUsuarioPorCorreo(correo)`: Localiza la información de un usuario dado su email.
- `obtenerDocumentoPorCorreo(correo)`: Resuelve el documento del usuario para transacciones de reserva.

### 3. `ImagenService`
Maneja las imágenes multimedia de fincas:
- `getImagenesPorFinca(fincaId)`: Retorna URLs de imágenes asociadas.
- `getIndiceImagenes()`: Construye un diccionario id -> URL para renderizado rápido.

### 4. `AuthInterceptor`
Intercepta todas las solicitudes salientes vía `HttpClient`:
- Inyecta automáticamente el encabezado `Authorization: Bearer <token>` cuando la sesión está activa.
- Captura respuestas `401 Unauthorized` para invalidar la sesión y redirigir a `/iniciar-sesion`.

---

## 🔐 Seguridad y Autenticación

1. **Hashing de Contraseñas:** En el cliente, las contraseñas se procesan mediante la **Web Crypto API nativa del navegador** usando el algoritmo criptográfico SHA-512 antes de su transmisión.
2. **Control de Acceso (Guards):** `AdminGuard` valida los permisos en tiempo de navegación mediante `canActivate` y `canMatch`, restringiendo el acceso no autorizado a `/administrador`.
3. **Persistencia Segura de Sesión:** El token JWT y los datos del perfil se almacenan en `sessionStorage` (o `localStorage` si el usuario selecciona recordar sesión), sincronizados de forma reactiva con `AuthStateService`.

---

## ⚙️ Configuración de Entornos

Las variables de entorno se definen en `src/environments/`:

```typescript
// src/environments/environment.development.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

Para cambiar el host o puerto de la API REST, únicamente se modifica la propiedad `apiUrl` en estos archivos.

---

## 🚀 Instalación y Despliegue

### Requisitos previos
- **Node.js** >= 18.x
- **npm** >= 9.x
- **Angular CLI** >= 20.x

### 1. Clonar el repositorio
```bash
git clone https://github.com/Ache-dev/Renfi.git
cd Renfi
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Ejecutar en modo desarrollo
```bash
npm start
# O directamente con Angular CLI:
ng serve
```
Navega a `http://localhost:4200/`. La aplicación recargará automáticamente ante cualquier cambio.

### 4. Compilar para producción
```bash
npm run build
```
Los archivos de distribución optimizados y minificados se generarán en la carpeta `dist/`.

---

## 👥 Equipo y Autoría

Proyecto desarrollado en el marco del programa académico:
* **Institución:** Tecnológico de Antioquia - Institución Universitaria
* **Facultad:** Facultad de Ingeniería
* **Programa:** Técnico Profesional en Sistemas

**Integrantes:**
* Jerson Moncada Foronda
* Thomas Suaza Gil
* Harbey Alexander Camarón Díaz
