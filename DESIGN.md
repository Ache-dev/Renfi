---
name: Renfi
description: Sistema visual "La Finca Abierta / Casa de Campo" para la plataforma de alquiler y reserva de fincas de recreo en Colombia
colors:
  primary: "#c2410c"
  primary-light: "#ea580c"
  primary-dark: "#9a3412"
  secondary: "#1b4332"
  secondary-light: "#2d6a4f"
  secondary-dark: "#081c15"
  accent: "#d97706"
  surface-base: "#f5f2eb"
  surface-light: "#fcfbf9"
  surface-medium: "#e8e2d5"
  surface-dark: "#d6cfc4"
  text-primary: "#1f2421"
  text-secondary: "#5c645d"
  text-tertiary: "#8f9892"
  text-inverse: "#ffffff"
typography:
  display:
    fontFamily: "'Montserrat', sans-serif"
    fontSize: "clamp(2rem, 5vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1.15
  headline:
    fontFamily: "'Montserrat', sans-serif"
    fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: "'Montserrat', sans-serif"
    fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "'Montserrat', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "'Montserrat', sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.04em"
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
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.text-inverse}"
    rounded: "{rounded.full}"
    padding: "12px 28px"
  button-primary-hover:
    backgroundColor: "{colors.primary-dark}"
  button-secondary:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.full}"
    padding: "12px 28px"
  card-surface:
    backgroundColor: "{colors.surface-light}"
    rounded: "{rounded.xl}"
    padding: "24px"
  input-field:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
---

# Design System: Renfi

## Overview

**Creative North Star: "La Finca Abierta / Casa de Campo"**

Renfi evoca la arquitectura campestre colombiana contemporánea: corredores perimetrales de chambrana, sombras frescas bajo los aleros, tapias encaladas y el contacto directo con la cordillera. 

El lenguaje visual abandona los gradientes genéricos de software corporativo y abraza una paleta territorial honesta:
- **Terracota arcilla (#c2410c):** La calidez de las tejas cocidas al sol, reservado para llamados a la acción y acentos decisivos.
- **Verde cordillera (#1b4332):** La profundidad de los cafetales y las montañas andinas, usado en cabeceras, identidad y navegación.
- **Arena suave (#f5f2eb):** La textura del bahareque y la tierra seca, base envolvente de las superficies.
- **Blanco cal viva (#fcfbf9):** Las paredes encaladas de las casas coloniales y modernas, soporte luminoso para tarjetas y contenidos.

## Colors

### Primary: Terracota Arcilla
- `#c2410c` (Principal): Botones de acción primaria, indicadores de precio y confirmaciones.
- `#ea580c` (Luz): Estados de hover y foco.
- `#9a3412` (Profundo): Estados activos y bordes de contraste.

### Secondary: Verde Cordillera
- `#1b4332` (Principal): Encabezados de sección, footer institucional y barra de administración.
- `#2d6a4f` (Luz): Enlaces secundarios y badges de verificación.
- `#081c15` (Profundo): Fondos de contraste y acentos nocturnos.

### Accent: Ámbar Atardecer
- `#d97706`: Calificaciones de estrellas y estados especiales.

### Neutros Arquitectónicos
- `#1f2421` (Carbón mineral): Tipografía principal de alta legibilidad.
- `#5c645d` (Pizarra de montaña): Texto secundario, subtítulos y metadatos.
- `#8f9892` (Ceniza): Texto atenuado y leyendas.
- `#e8e2d5` (Marco de madera / sillar): Bordes suaves que enmarcan las superficies.
- `#f5f2eb` (Arena suave): Fondo global de la plataforma.
- `#fcfbf9` (Blanco cal): Tarjetas elevadas, modales y formularios.

## Typography

**Tipografía:** Montserrat (Google Fonts)

### Jerarquía
- **Display** (Bold 700, clamp(2rem, 5vw, 3.5rem), line-height: 1.15): Título del Hero en inicio.
- **Headline** (Bold 700, clamp(1.5rem, 3.5vw, 2.25rem), line-height: 1.2): Encabezados principales de página y sección.
- **Title** (SemiBold 600, clamp(1.1rem, 2.5vw, 1.5rem), line-height: 1.3): Títulos de fichas de fincas y tarjetas.
- **Body** (Regular 400, 1rem, line-height: 1.6): Textos descriptivos, amenidades y políticas de reserva.
- **Label** (SemiBold 600, 0.875rem, letter-spacing: 0.04em): Metadatos, etiquetas de capacidad y precios.

## Elevation & Shapes

- **Alero Shadows:** Sombras difusas y alargadas con un sutil tinte cordillera (`0 12px 32px rgba(27, 67, 50, 0.06)`), evocando la sombra de un alero colonial.
- **Chambranas y Marcos:** Bordes nítidos de 1px en `#e8e2d5` que definen la estructura sin ruido visual.
- **Cápsulas Táctiles:** Botones de acción en radio completo (`border-radius: 9999px`) con micro-elevación en hover (`translateY(-2px)`).
- **Tarjetas Arquitectónicas:** Radio de esquina generoso (`16px-24px`) que suaviza la interfaz para móviles y pantallas táctiles.

## Reglas de Artesanía (Craft Floor)

1. **Sin kickers ni eyebrows:** Los encabezados comienzan directamente con su mensaje principal, evitando etiquetas superfluas sobre el título.
2. **Iconos vectoriales limpios (SVG):** Cero emojis Unicode como iconos de interfaz. Toda la iconografía utiliza trazos vectoriales uniformes de 2px.
3. **Sin numeración arbitraria de secciones:** El flujo de lectura es orgánico a través de ritmo tipográfico y espaciado.
4. **Superficies de navegador personalizadas:** `::selection` en tono cálido (#fdba74), scrollbars delgadas con tono terracota/arena y anillos de foco visibles en `#c2410c`.
