# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- **Viajeros y Huéspedes:** Familias, parejas, grupos de amigos y empresas que buscan fincas de recreo y descanso en Colombia para vacaciones, escapadas de fin de semana o eventos. Necesitan encontrar fincas verificadas con información real de capacidad, ubicación, amenidades, precios transparentes y disponibilidad garantizada.
- **Propietarios y Anfitriones de Fincas:** Dueños y administradores rurales que arriendan sus propiedades turísticas. Requieren gestionar publicaciones, actualizar fotos, controlar disponibilidad y revisar el estado de sus reservas e ingresos.
- **Administradores de la Plataforma:** Equipo operativo interno que audita fincas publicadas, gestiona municipios, valida comprobantes de pago, administra roles y supervisa la operación general del sistema.

## Product Purpose
Renfi es una plataforma digital de gestión y reserva turística de fincas en Colombia. Su propósito es brindar una experiencia segura, moderna y transparente para el alquiler vacacional de propiedades campestres, superando la informalidad y desconfianza común del sector mediante un catálogo estructurado, pasarela de pago integrada y comprobantes de reserva formales.

## Positioning
Plataforma especializada en turismo rural y descanso campestre en Colombia (con foco inicial en regiones clave como Antioquia y el Eje Cafetero), combinando un catálogo curado por municipios y capacidad con un proceso de reserva confiable y un módulo de gestión administrativa integral.

## Operating Context
- **Búsqueda y Exploración:** Buscador interactivo con filtros por municipio, rango de precios (en COP), capacidad de huéspedes y amenidades.
- **Flujo de Reserva y Pago:** Vista de detalle de la finca, selección de estadía, pasarela de pago (`/reserva/pago`) y confirmación con comprobante de reserva (`/reserva/comprobante`).
- **Módulo Administrativo:** Panel de control (`/administrador`) para gestión CRUD de fincas, imágenes, municipios, métodos de pago, reservas, facturas y usuarios con control de acceso basado en roles (`AdminGuard`).
- **Moneda:** Peso Colombiano (COP).

## Capabilities and Constraints
- **Frontend:** Angular 20 (SPA), arquitectura modular (`AppRoutingModule`, `AdministradorModule`), RxJS.
- **Estilos y Maquetación:** Bootstrap 5.3 + CSS personalizado con paleta de colores del dominio campestre y tipografía Montserrat.
- **Seguridad:** Guards de Angular para la protección de rutas administrativas y validación de sesiones.
- **Alcance de Plataforma:** Aplicación web responsiva (móvil y escritorio).

## Brand Commitments
- **Nombre:** Renfi.
- **Tono y Voz:** Cálido, profesional, transparente, confiable y orientado al descanso y naturaleza rural en Colombia.
- **Identidad Visual:** Verde esmeralda/naturaleza, acentos cálidos y fondos limpios que transmiten tranquilidad y seguridad.

## Evidence on Hand
- Vistas públicas y catálogo interactivo en [inicio-component.html](file:///c:/Users/aprocurement/Documents/GitHub/Renfi/src/app/template/inicio-component/inicio-component.html).
- Detalle de fincas en [detalle-finca-component.html](file:///c:/Users/aprocurement/Documents/GitHub/Renfi/src/app/template/detalle-finca-component/detalle-finca-component.html).
- Pasarela de pago en [pasarela-pago-usuario.ts](file:///c:/Users/aprocurement/Documents/GitHub/Renfi/src/app/usuario/pasarela-pago-usuario/pasarela-pago-usuario.ts).
- Panel de gestión en `src/app/administrador/`.

## Product Principles
1. **Transparencia y Claridad:** Los precios, capacidad de la finca, ubicación y amenidades deben ser siempre visibles y sin costos ocultos.
2. **Búsqueda Ágil:** El huésped debe poder filtrar y encontrar la finca ideal para su grupo en pocos clics.
3. **Certeza Transaccional:** Cada paso de pago y confirmación debe otorgar confianza total con comprobantes claros.
4. **Experiencia Móvil de Primer Nivel:** El proceso de exploración y reserva debe ser impecable y fluido desde cualquier teléfono móvil.

