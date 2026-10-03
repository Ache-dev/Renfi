---
name: Renfi
description: Sistema visual "La Finca Abierta / Casa de Campo" para la plataforma de alquiler y reserva de fincas de recreo en Colombia
colors:
  primary: "#c2410c"
  primary-light: "#ea580c"
  primary-dark: "#9a3412"
  primary-surface: "#fbece2"
  secondary: "#1b4332"
  secondary-light: "#2d6a4f"
  secondary-dark: "#081c15"
  secondary-surface: "#e5efe8"
  accent: "#d97706"
  surface-base: "#f5f2eb"
  surface-light: "#fcfbf9"
  surface-medium: "#e8e2d5"
  surface-dark: "#d6cfc4"
  text-primary: "#1f2421"
  text-secondary: "#5c645d"
  text-tertiary: "#8f9892"
  text-inverse: "#ffffff"
  text-on-dark: "#dbe7df"
  text-on-dark-muted: "#b9cbbf"
  on-dark-accent: "#fdba74"
  success: "#2d6a4f"
  success-surface: "#e5efe8"
  warning: "#92400e"
  warning-surface: "#fbf0dc"
  danger: "#b42318"
  danger-surface: "#fbe7e3"
typography:
  display:
    fontFamily: "'Montserrat', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "'Montserrat', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: "'Montserrat', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "'Montserrat', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "'Montserrat', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.01em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  "2xl": "24px"
  full: "9999px"
spacing:
  xs: "clamp(4px, 0.5vw, 8px)"
  sm: "clamp(8px, 1vw, 12px)"
  md: "clamp(16px, 2vw, 24px)"
  lg: "clamp(24px, 3vw, 40px)"
  xl: "clamp(40px, 5vw, 80px)"
  "2xl": "clamp(60px, 8vw, 120px)"
  gutter: "clamp(16px, 4vw, 40px)"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.text-inverse}"
    rounded: "{rounded.full}"
    padding: "0 24px"
    height: "46px"
  button-primary-hover:
    backgroundColor: "{colors.primary-dark}"
  button-secondary:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.full}"
    padding: "0 24px"
    height: "46px"
  button-secondary-hover:
    textColor: "{colors.secondary}"
  button-forest:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.text-inverse}"
    rounded: "{rounded.full}"
    padding: "0 24px"
    height: "46px"
  button-ghost:
    textColor: "{colors.secondary}"
    rounded: "{rounded.full}"
    padding: "0 24px"
    height: "46px"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.text-inverse}"
    rounded: "{rounded.full}"
    padding: "0 24px"
    height: "46px"
  button-sm:
    padding: "0 14px"
    height: "36px"
  button-lg:
    padding: "0 30px"
    height: "54px"
  icon-button:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.full}"
    size: "44px"
  input-field:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
    height: "46px"
  card-surface:
    backgroundColor: "{colors.surface-light}"
    rounded: "{rounded.xl}"
    padding: "24px"
  badge-success:
    backgroundColor: "{colors.success-surface}"
    textColor: "{colors.secondary}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  badge-warning:
    backgroundColor: "{colors.warning-surface}"
    textColor: "{colors.warning}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  badge-danger:
    backgroundColor: "{colors.danger-surface}"
    textColor: "{colors.danger}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  badge-primary:
    backgroundColor: "{colors.primary-surface}"
    textColor: "{colors.primary-dark}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  modal:
    backgroundColor: "{colors.surface-light}"
    rounded: "{rounded.2xl}"
    padding: "clamp(22px, 4vw, 32px)"
    width: "440px"
  site-header:
    backgroundColor: "{colors.surface-light}"
    height: "68px"
  site-footer:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.text-on-dark-muted}"
  admin-sidebar:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.text-on-dark}"
    width: "264px"
---

# Design System: Renfi

## Overview

**Creative North Star: "La Finca Abierta / Casa de Campo"**

Renfi evoca la arquitectura campestre colombiana contemporánea: corredores perimetrales de chambrana, sombras frescas bajo los aleros, tapias encaladas con su zócalo pintado y el contacto directo con la cordillera. La interfaz se comporta como una casa de finca bien cuidada: superficies claras y cálidas, marcos de madera finos que ordenan sin ruido, y un solo color de teja que señala lo que importa.

El lenguaje visual abandona los gradientes genéricos de software corporativo, el vidrio decorativo y los brillos de color, y abraza una paleta territorial honesta. La densidad es tranquila en las páginas públicas (secciones generosas, una idea por bloque) y más compacta en el panel administrativo, donde la marca vive en los detalles: el riel verde, los iconos de trazo y las cifras tabulares.

La confianza es parte de la estética. Precios en COP siempre visibles, sellos de verificación, comprobantes con forma de recibo y estados explícitos (cargando, vacío, error) en cada flujo.

**Key Characteristics:**
- Superficies arena y cal; verde cordillera para identidad y bandas oscuras; terracota solo para la acción y el precio.
- Montserrat como única familia; jerarquía por tamaño y peso, nunca por color decorativo.
- Hilos de 1px en tono madera como estructura; sombras largas y difusas con tinte verde.
- Cápsulas táctiles para toda acción, con elevación de 2px al pasar el cursor.
- Firma propia: el zócalo (franja verde, cal y teja) y la silueta de la cordillera dibujada en SVG.

## Colors

Paleta territorial: tierra cocida, montaña y cal, con un ámbar reservado para las estrellas.

### Primary
- **Terracota arcilla** (primary): botones de acción primaria, precios, el paso actual de un proceso y el tramo inferior del zócalo. Es la teja cocida al sol.
- **Terracota viva** (primary-light): techo del logotipo sobre fondo verde y acentos sobre superficies oscuras.
- **Arcilla quemada** (primary-dark): hover y estado activo de la acción primaria; texto de badges terracota.
- **Barro claro** (primary-surface): fondo del panel de cierre (CTA final) y de badges terracota.

### Secondary
- **Verde cordillera** (secondary): encabezados, logotipo, hero de inicio, footer institucional, riel del panel administrativo y avatares. Es la profundidad de los cafetales y las montañas andinas.
- **Verde cafetal** (secondary-light): bordes de hover en controles secundarios y color de éxito.
- **Sombra de montaña** (secondary-dark): fondo más profundo de bandas oscuras y del hero.
- **Rocío** (secondary-surface): círculos de icono, sellos de verificación y badges de estado positivo.

### Tertiary
- **Ámbar atardecer** (accent): exclusivamente para estrellas de calificación.

### Neutral
- **Arena suave** (surface-base): fondo global de la plataforma, la textura del bahareque.
- **Blanco cal viva** (surface-light): tarjetas, formularios, modales, header y bandas claras.
- **Marco de madera** (surface-medium): hilos de 1px, divisores y bordes de tarjeta.
- **Piedra de río** (surface-dark): borde de campos de formulario y de botones secundarios.
- **Carbón mineral** (text-primary): texto principal.
- **Pizarra de montaña** (text-secondary): texto secundario, leads, metadatos y ayudas de campo.
- **Ceniza** (text-tertiary): solo decoración, iconos dentro de campos y estados deshabilitados; no alcanza contraste suficiente para texto.
- **Blanco** (text-inverse), **niebla** (text-on-dark), **neblina** (text-on-dark-muted) y **teja clara** (on-dark-accent): texto, enlaces y acentos de foco sobre superficies verdes.

### Status
- **Éxito** (success / success-surface), **aviso** (warning / warning-surface) y **peligro** (danger / danger-surface): alertas, badges de estado y acciones destructivas. Siempre acompañados de icono y texto, nunca solo color.

### Named Rules
**The Scarce Clay Rule.** La terracota marca la acción principal y el precio de cada vista, nada más. Si dos elementos terracota compiten en la misma vista, uno sobra.

**The Contrast Floor Rule.** Todo texto pequeño usa text-primary o text-secondary sobre superficies claras, y text-on-dark o text-on-dark-muted sobre verde. Ceniza nunca se usa para texto legible.

## Typography

**Display Font:** Montserrat (con system-ui, -apple-system, Segoe UI)
**Body Font:** Montserrat
**Label/Mono Font:** Montserrat; monoespaciada del sistema solo para JSON y código en el panel administrativo.

**Character:** Una sola familia geométrica y cálida que va de titulares firmes en verde a textos de lectura cómodos. La autoridad viene del peso 700 y del interlineado apretado en los títulos, no de efectos.

### Hierarchy
- **Display** (700, clamp(2.25rem, 5vw, 3.5rem), 1.1, -0.02em): titular del hero de inicio y de páginas institucionales; máximo unos 18 caracteres por línea.
- **Headline** (700, clamp(1.5rem, 3.5vw, 2.25rem), 1.2): encabezados de página y de sección.
- **Title** (600, clamp(1.1rem, 2.5vw, 1.5rem), 1.3): nombres de fincas, títulos de tarjeta y de bloques de formulario.
- **Body** (400, 1rem, 1.6): descripciones, políticas y textos de apoyo; leads de sección limitados a unos 60–65 caracteres por línea.
- **Label** (600, 0.875rem, 0.01em): etiquetas de campo, metadatos, capacidad y precios secundarios. Las cabeceras de tabla del panel usan 0.75rem con 0.04em.

### Named Rules
**The Tabular Figures Rule.** Precios, fechas, noches, identificadores y cifras de tablas usan numerales tabulares para que las columnas y los totales se alineen.

**The Balanced Heading Rule.** Los encabezados usan `text-wrap: balance` y los párrafos `pretty`; ningún titular deja una palabra huérfana.

## Layout

Contenedor de página centrado de 1200px como máximo, con margen lateral fluido (gutter). El header público es fijo arriba con 68px de alto, y los elementos pegajosos (resumen de pago, tarjeta de reserva) se ubican a 68px más 24px del borde superior.

El ritmo vertical de las páginas públicas usa el espaciado 2xl entre secciones y lg entre el encabezado de sección y su contenido. Cada sección alterna entre arena y cal para separar sin bordes pesados.

Patrones de composición recurrentes:
- **Contenido y columna fija:** en detalle de finca y pasarela, contenido flexible a la izquierda y una tarjeta de 380–400px pegajosa a la derecha desde 960–1024px; en móvil la tarjeta va después del contenido principal (o primero, en pago).
- **Panel partido:** en autenticación, panel verde de marca a la izquierda y formulario a la derecha desde 960px; en móvil el formulario aparece primero.
- **Carrusel nativo:** fichas en una pista con scroll-snap horizontal, de 1 (con asomo de la siguiente) a 3 por vista.
- **Panel administrativo:** riel lateral de 264px y contenido de hasta unos 1400px; por debajo de 1024px el riel se vuelve un cajón lateral con fondo oscurecido.

Cortes responsivos en uso: 480, 640, 768, 960 y 1024px. Las rejillas de formularios y de indicadores responden al ancho de su contenedor cuando es posible, no solo al de la ventana.

## Elevation & Depth

Sistema híbrido: la estructura la dan los hilos de 1px en marco de madera; la sombra aparece para separar capas (tarjetas, header al desplazarse, modales) y como respuesta al estado. Todas las sombras son largas, difusas y con tinte verde cordillera, como la sombra de un alero; nunca negras ni de desplazamiento duro.

### Shadow Vocabulary
- **Alero leve** (`0 1px 2px rgba(27, 67, 50, 0.06), 0 2px 6px rgba(27, 67, 50, 0.04)`): tarjetas en reposo y hover de controles secundarios.
- **Alero medio** (`0 6px 18px rgba(27, 67, 50, 0.07)`): indicadores del panel al pasar el cursor.
- **Alero amplio** (`0 12px 32px rgba(27, 67, 50, 0.08)`): tarjeta de reserva, fichas en hover y menú móvil.
- **Alero profundo** (`0 24px 60px rgba(8, 28, 21, 0.18)`): modales y hojas de búsqueda.
- **Sombra de teja** (`0 8px 18px -8px rgba(154, 52, 18, 0.6)`): solo bajo el botón primario.

### Named Rules
**The Eave Shadow Rule.** Toda sombra tiene desplazamiento vertical y difuminado suave con tinte verde. Un halo de color sin desplazamiento es decoración y no se usa.

**The No Glass Rule.** No hay vidrio ni desenfoque decorativo. El header, los fondos de modal y los paneles son sólidos.

## Shapes

Esquinas arquitectónicas suaves: las tarjetas usan 20px (xl) y los contenedores grandes, modales y galerías 24px (2xl); los campos de formulario 12px (md); los elementos internos pequeños 8px (sm). Toda acción es una cápsula de radio completo, igual que badges, chips de cuenta y el control segmentado.

Los bordes son siempre de 1px en marco de madera o piedra de río. Las imágenes se recortan con `object-fit: cover` dentro de marcos con proporción fija (4:3 en fichas, alto fijo en la galería del detalle) para evitar saltos de diseño.

La firma de forma es el **zócalo**: una franja de 14px con un hilo verde de 2px, un hilo de cal de 3px y el resto en terracota, recortada por el radio del contenedor que la lleva. La acompaña la **silueta de cordillera**, dos o tres capas de montaña en SVG con verdes de baja opacidad.

## Components

### Buttons
Cápsulas táctiles, firmes y cálidas.
- **Shape:** radio completo (9999px), alto mínimo 46px (36px en la variante pequeña, 54px en la grande), iconos SVG de 18px.
- **Primary:** fondo terracota, texto blanco, sombra de teja; hover en arcilla quemada.
- **Hover / Focus:** elevación de 2px en dispositivos con cursor (sin efecto en táctil), vuelve a 0 al presionar; foco con anillo terracota de 2px separado 3px.
- **Secondary:** fondo cal, borde piedra de río, texto carbón; en hover el texto y el borde pasan a verde con sombra leve.
- **Forest / Ghost / On-dark / Danger:** verde sólido para acciones institucionales; fantasma en texto verde para acciones terciarias; translúcido con borde blanco sobre bandas verdes; rojo sólido o fantasma rojo para acciones destructivas.
- **Disabled:** opacidad al 50%, sin elevación ni sombra.

### Chips
- **Badges:** cápsulas de 0.75rem en peso 600 con fondo de estado (rocío, aviso, peligro, barro claro) y punto opcional del color del texto. Se usan para estado de finca ("Disponible"), estado de cuenta, rol y estado de pago.
- **Control segmentado:** pista arena en cápsula con el segmento activo en cal y sombra leve (tabla/tarjetas en el panel; iniciar sesión/crear cuenta en autenticación).

### Cards / Containers
- **Corner Style:** 20px; 24px en tarjetas de recibo, galería y bandas.
- **Background:** blanco cal sobre arena.
- **Shadow Strategy:** alero leve en reposo; alero amplio y elevación de 3px en hover para fichas navegables.
- **Border:** 1px marco de madera.
- **Internal Padding:** 24px (hasta 40px en tarjetas de formulario amplias).

### Inputs / Fields
- **Style:** fondo cal, borde 1px piedra de río, radio 12px, alto 46px, etiqueta encima en peso 600; con icono, el icono va a 14px del borde en ceniza.
- **Focus:** borde terracota y halo terracota de 3px al 16% de opacidad; el cursor de texto es terracota.
- **Error / Disabled:** borde y mensaje en rojo de peligro cuando el campo se tocó y es inválido; solo lectura y deshabilitado con fondo arena y texto pizarra.

### Navigation
- **Header público:** barra cal sólida de 68px con hilo inferior; logotipo (cuadro verde con techo terracota) más "Renfi" y el lema; enlaces en pizarra de 0.925rem con subrayado terracota animado en hover y activo; acciones en cápsulas pequeñas. En móvil, botón de menú circular y panel desplegable con enlaces de 52px separados por hilos.
- **Footer:** banda verde cordillera con zócalo superior, tres columnas (marca, navegación, soporte) y una barra inferior con el sello de verificación.
- **Panel administrativo:** riel verde con logotipo; ítem activo con fondo blanco al 10% e icono en teja clara, sin borde lateral de color.

### Zócalo (signature)
Franja de 14px que remata la base de una banda o pieza clave: el hero de inicio, el panel verde de autenticación, la banda de compromiso, el borde superior del footer y la base del recibo de reserva. Nunca más de uno visible por pantalla fuera del footer.

### Sello de verificación (signature)
Escudo con check en un círculo o cápsula de rocío con texto verde ("Finca verificada", sello del comprobante). Comunica la promesa de fincas verificadas y certeza transaccional.

### Estados de carga, vacío y error
Bloque centrado con círculo de icono en rocío, título, texto en pizarra y una acción. La carga usa un indicador giratorio terracota o tarjetas esqueleto con pulso de opacidad.

### Modales
Fondo verde oscuro al 50% sin desenfoque, tarjeta cal de 24px con alero profundo, entrada de 12px hacia arriba con fundido. Icono circular arriba (terracota o peligro), título, texto y acciones alineadas a la derecha que se apilan en móvil. Se cierran con Escape y clic fuera.

## Do's and Don'ts

### Do:
- **Do** usar terracota solo para la acción principal y el precio de cada vista (The Scarce Clay Rule).
- **Do** dibujar toda la iconografía en SVG de trazo uniforme de 2px, con terminaciones redondeadas y color heredado del texto.
- **Do** mostrar precios en COP con numerales tabulares y la unidad "/noche" en pizarra junto a la cifra.
- **Do** dar a cada flujo sus estados de carga, vacío, error y éxito, con el icono y el texto de la alerta correspondiente.
- **Do** mantener objetivos táctiles de al menos 44px y el anillo de foco terracota visible en todos los controles.
- **Do** personalizar las superficies del navegador: selección en teja clara (#fdba74) con texto arcilla oscura, scrollbars finas en piedra de río con hover terracota, cursor de texto terracota.
- **Do** respetar `prefers-reduced-motion`: las transiciones y animaciones se reducen al mínimo.

### Don't:
- **Don't** usar kickers ni etiquetas sobre los encabezados; el título empieza directamente con su mensaje.
- **Don't** usar emojis ni glifos Unicode (flechas, aspas, estrellas) como iconos de interfaz.
- **Don't** numerar secciones de forma arbitraria; los números solo aparecen cuando la secuencia importa, como en los pasos de reserva.
- **Don't** usar texto con degradado, vidrio o desenfoque decorativo, brillos, animaciones infinitas decorativas ni rotaciones de tono.
- **Don't** usar bordes laterales de color de más de 1px en tarjetas, alertas o ítems de navegación.
- **Don't** usar sombras de desplazamiento duro ni halos de color sin desplazamiento.
- **Don't** construir páginas como rejillas de tarjetas iguales de icono, título y texto, ni anidar tarjetas dentro de tarjetas.
- **Don't** agregar colores fuera de la paleta; los matices se derivan con rgba de los colores existentes.
- **Don't** animar propiedades de layout (ancho, márgenes, alto); el movimiento usa transform y opacity con curva de salida.
