# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto se adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-20

### Añadido

- **Autenticación Completa**: Sistema rápido de registro e inicio de sesión utilizando JWT y Bcrypt para seguridad de contraseñas.
- **Registro de Emociones Guiado**: Formulario de 7 columnas basado en Terapia Cognitivo-Conductual (Situación, Emoción, Pensamiento Automático, Evidencias, Pensamiento Alternativo, Recalificación).
- **Entornos Inmersivos 3D (Three.js)**:
  - `EmotionOrb`: Fondo interactivo de física de partículas en la página de inicio de sesión.
  - `EmotionConstellation`: Visualización 3D interactiva en el "Dashboard" para explorar el historial emocional de las entradas a través del tiempo.
  - `MoodSpheres`: Selector visual y animado para atrapar las emociones principales.
- **Análisis de IA Adaptable (Múltiples Proveedores)**:
  - Soporte integrado y robusto para utilizar **OpenAI, Google Gemini, Anthropic Claude** y **Ollama (Local)**.
  - Panel de procesamiento para reconocimiento automático de distorsiones cognitivas, patrones emocionales y recomendaciones.
- **Exportación de Datos**: Herramienta de privacidad integrada para exportar registros del usuario en formatos estandarizados (`.json` y `.csv`).
- **Calendario Emocional**: Interfaz global de calendario interactivo para identificar el estado anímico diario mediante semántica de color.
- **Modos Visuales y UI**: Diseño moderno utilizando "glassmorphism", paletas de colores vibrantes en tema oscuro y adaptabilidad "Responsive".
- **Backend Moderno**: Código fundacional de Node.js robusto con Express, aplicando `sql.js` para persistencia en base de datos local SQLite.

### Cambiado

- N/A (Lanzamiento de proyecto base inicial).

### Corregido

- N/A (Lanzamiento de proyecto base inicial).
