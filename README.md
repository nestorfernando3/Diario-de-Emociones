# Diario de Emociones

Una aplicación web de bienestar emocional, diseñada con buen gusto, basada en la **Terapia Cognitivo-Conductual (TCC)**. Registra, analiza y replantea tus emociones utilizando el **Registro de Pensamientos de 7 Columnas** en un entorno visual cuidadosamente diseñado.

## Características

- **Registro paso a paso (Wizard)**: Un proceso guiado con 7 pasos para identificar situaciones, emociones, pensamientos automáticos y generar perspectivas alternativas. Diseñado para reducir la carga cognitiva con un paso a la vez.
- **Visualización 3D**: Constelación emocional interactiva (Three.js) y selector visual de emociones con esferas animadas.
- **Análisis con IA**: Soporte integrado para múltiples proveedores:
  - OpenAI (GPT-4)
  - Google Gemini (Gemini 2.0 Flash)
  - Anthropic Claude (Claude 3.5 Sonnet)
  - Ollama (Modelos locales, totalmente privados)
- **Privacidad total**: Todos los datos se almacenan localmente en tu navegador (`localStorage`). Sin servidores, sin cuentas, sin rastreo.
- **Exportación e importación**: Descarga tus registros en JSON/CSV o impórtalos en otro dispositivo.
- **Calendario emocional**: Vista mensual interactiva con indicadores de color para cada emoción registrada.

## Diseño

La interfaz está inspirada en aplicaciones de bienestar premium como **The Fabulous**, priorizando:

- **Claridad visual**: Tarjetas con bordes suaves, tipografía limpia (Outfit + Inter), y uso generoso de espacios en blanco.
- **Iconografía coherente**: Sistema de iconos SVG vectoriales (estilo Feather/Lucide) en lugar de emojis.
- **Paleta cálida**: Gradientes coral-naranja para acciones principales, violeta-índigo para acentos.
- **Ilustraciones personalizadas**: Logo y hero illustration generados con IA para una identidad visual única.

## Tecnologías

- **Frontend**: React 18, Vite, Three.js (React Three Fiber), React Router
- **Tipografía**: Google Fonts (Outfit, Inter)
- **Almacenamiento**: `localStorage` del navegador
- **Despliegue**: Vercel (estático, sin servidores)

## Instalación Local

### Prerrequisitos

- Node.js (v18 o superior)
- Ollama (Opcional, solo para IA local)

### Pasos

```bash
# Clonar el repositorio
git clone https://github.com/nestorfernando3/Diario-de-Emociones.git
cd Diario-de-Emociones

# Instalar dependencias y arrancar
npm install
npm run dev
```

La aplicación estará disponible en <http://localhost:5173>

## Despliegue en Vercel (Recomendado)

Esta es una **aplicación 100% frontend**. Todos los datos se almacenan localmente en tu navegador.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnestorfernando3%2FDiario-de-Emociones)

1. Vercel te pedirá iniciar sesión con GitHub.
2. Clonará el proyecto automáticamente.
3. En menos de 1 minuto tendrás un enlace público listo para usar.

## Configuración de IA

1. Ve a **Ajustes** en la barra lateral.
2. Selecciona tu proveedor (OpenAI, Gemini, Claude u Ollama).
3. Ingresa tu API Key o el nombre de tu modelo local.
4. Ve a **Análisis IA** y haz clic en "Analizar mis emociones".

## Estructura del Proyecto

```text
src/
├── components/
│   ├── icons/          # Sistema de iconos SVG (AppIcons.jsx)
│   ├── layout/         # Sidebar y layout principal
│   └── three/          # Componentes 3D (MoodSpheres, EmotionConstellation)
├── contexts/           # AuthContext (manejo de sesión local)
├── pages/              # Páginas: Dashboard, Calendar, NewEntry, Analysis, Settings
├── services/           # API service (localStorage adapter)
└── styles/             # Variables CSS, animaciones, estilos globales
```

## Licencia

MIT — Libre de usar, modificar y distribuir.
