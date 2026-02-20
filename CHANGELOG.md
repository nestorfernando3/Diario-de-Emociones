# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto se adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-02-20

### Rediseño UI/UX completo

Transformación visual profunda de la aplicación, inspirada en estéticas de wellness premium (The Fabulous).

### Añadido

- **Sistema de iconos SVG** (`AppIcons.jsx`): 13 iconos vectoriales coherentes estilo Feather/Lucide que reemplazan todos los emojis de la interfaz.
- **Ilustración de bienvenida personalizada**: Hero illustration generada con IA en estilo flat vector art para la pantalla de login.
- **Logo de la aplicación**: Icono minimal generado con IA, integrado en el sidebar y la pantalla de bienvenida.
- **Clase CSS `.provider-dot`**: Indicadores de color con puntos estilizados para proveedores de IA (reemplazan emojis de colores).
- **Clase CSS `.sidebar-logo-img`**: Para el logo en el sidebar.

### Cambiado

- **Pantalla de bienvenida (Login)**: Rediseñada con layout split-screen, ilustración hero, y tipografía refinada. Se eliminó el canvas 3D del fondo.
- **Dashboard**: Header con saludo prominente y botón "Nueva Reflexión" en gradiente cálido. Tarjetas de estadísticas con bordes suaves y sombras mínimas. Banner de consejo del día con icono SVG.
- **Wizard de registro (NewEntry)**: Transformado en experiencia paso a paso inmersiva con barra de progreso superior, iconos grandes por categoría, botón de navegación fijado al fondo, y animaciones entre pasos.
- **Sidebar**: Navegación con iconos SVG vectoriales en lugar de emojis. Botón "Cambiar usuario" con icono de logout.
- **Calendario**: Header limpio sin emojis. Botón de acción principal unificado en gradiente cálido.
- **Análisis IA**: Headers y botones limpios sin emojis. Indicador de carga sin emoji.
- **Ajustes**: Headers de sección sin emojis. Proveedores de IA con puntos de color CSS. Botón "Guardar" unificado en gradiente cálido. "Cerrar Sesión" renombrado a "Cambiar usuario".
- **Variables CSS**: Tokens de radio reducidos para proporciones elegantes:
  - `--radius-md`: 0.75rem → 0.5rem
  - `--radius-lg`: 1.25rem → 0.875rem
  - `--radius-xl`: 1.75rem → 1.25rem
  - `--radius-2xl`: 2.5rem → 1.5rem
  - Nuevo: `--radius-3xl`: 2rem
- **Botones globales (.btn)**: Padding y peso visual mejorados. Todos los botones usan `border-radius: var(--radius-full)` para forma pill.

### Corregido

- **Bug crítico: tarjetas circulares** — `.glass-card` usaba `border-radius: var(--radius-full)` (= `9999px`), haciendo que todos los cards, el calendario, las secciones de ajustes, y los paneles de análisis se renderizaran como círculos u óvalos. Corregido a `var(--radius-xl)`.
- **Inputs con forma de pastilla extrema** — `.input-field` también usaba `radius-full`, haciendo que las textareas se vieran deformadas. Corregido a `var(--radius-lg)`.
- **Toast notifications circulares** — `.toast` también usaba `radius-full`. Corregido a `var(--radius-lg)`.
- **Color del texto en provider activo** — `provider-btn--active` usaba `--primary-300` (muy claro), cambiado a `--primary-600` para mejor contraste.

---

## [1.0.0] - 2026-02-20

### Añadido

- **Autenticación local**: Sistema rápido de registro basado en nombre, almacenado en `localStorage`.
- **Registro de Emociones Guiado**: Formulario de 7 columnas basado en TCC.
- **Entornos 3D (Three.js)**: Constelación emocional interactiva y selector visual de emociones (MoodSpheres).
- **Análisis de IA Multi-Proveedor**: OpenAI, Google Gemini, Claude, y Ollama.
- **Exportación de Datos**: JSON y CSV.
- **Calendario Emocional**: Vista mensual interactiva con colores por emoción.
- **Diseño moderno**: Glassmorphism, paletas vibrantes, responsive.
