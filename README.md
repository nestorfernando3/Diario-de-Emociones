# 🌈 Diario de Emociones

Diario de Emociones es una aplicación web interactiva y visualmente atractiva basada en los principios de la **Terapia Cognitivo-Conductual (TCC)**. Ayuda a los usuarios a registrar, analizar y replantear sus emociones y pensamientos utilizando el **Registro de Pensamientos de 7 Columnas**.

## ✨ Características Principales

- **Registro de Pensamientos de 7 Columnas**: Un proceso guiado paso a paso para identificar situaciones, emociones, pensamientos automáticos y generar pensamientos alternativos.
- **Entorno Inmersivo 3D**: Integración de animaciones en 3D (Three.js/React Three Fiber) incluyendo un orbe emocional en el inicio y una constelación interactiva en el panel principal.
- **Análisis con IA Integrado**: Soporte nativo para analizar tus registros emocionales utilizando varios modelos de Inteligencia Artificial:
  - OpenAI (GPT-4)
  - Google Gemini (Gemini 2.0 Flash)
  - Anthropic Claude (Claude 3.5 Sonnet)
  - Ollama (Modelos locales como Llama 3, totalmente privados)
- **Privacidad Local**: Todos tus registros se almacenan en tu propio navegador (`localStorage`).
- **Exportación de Datos e Importación**: Descarga tus registros en JSON/CSV, o importa tus datos JSON para restaurarlos en otro dispositivo.

## 🚀 Tecnologías

- **Frontend**: React 18, Vite, Three.js, React Three Fiber, React Router.
- **Base de Datos**: Ninguna externa (`localStorage`).

## 📋 Instalación y Uso Local

### Prerrequisitos

- Node.js (v18 o superior)
- Ollama (Opcional, solo si deseas ejecutar la IA de forma local y privada)

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/Diario-de-Emociones.git
cd Diario-de-Emociones
```

### 2. Iniciar la aplicación

Instala las dependencias y arranca el servidor de desarrollo de Vite:

```bash
npm install
npm run dev
```

La aplicación web estará disponible en <http://localhost:5173>

## 🌐 Despliegue (GitHub Pages)

Esta aplicación ha sido diseñada como una **Local WebApp (100% Frontend)**. Esto significa que **no utiliza un servidor backend**. Todos tus registros emocionales y la configuración de IA se almacenan localmente en tu navegador usando `localStorage`. ¡La máxima privacidad!

### Desplegar gratis en GitHub Pages

1. Sube este proyecto a tu propio repositorio en GitHub.
2. Ve a la pestaña **Settings** > **Pages** de tu repositorio.
3. Bajo "Build and deployment", selecciona "GitHub Actions".
4. GitHub detectará automáticamente que es un proyecto Vite/React y te sugerirá el flujo de trabajo (`.yml`) para compilar y publicar el sitio usando Node.js.
5. Haz clic en "Configure" y haz commit al archivo sugerido.
6. En un par de minutos, tu aplicación estará en vivo y disponible en una URL como `https://tu-usuario.github.io/Diario-de-Emociones/`.

*(Nota: Asegúrate de configurar la propiedad `base` en `vite.config.js` si vas a utilizar un subdirectorio en GitHub pages, por ej: `base: '/Diario-de-Emociones/'`.)*

## 📝 Configuración de IA Avanzada

Para generar análisis sobre distorsiones cognitivas:

1. Navega a la sección **Ajustes** dentro de la app (icono de engranaje).
2. Selecciona tu proveedor preferido (OpenAI, Gemini, Claude, u Ollama).
3. Ingresa tu API Key (O si seleccionaste Ollama, ingresa el nombre de tu modelo descargado localmente, por ejemplo `llama3.2`).
4. Ve al panel de **Análisis IA** y haz clic en "Analizar".

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Eres libre de usar, modificar y distribuir el código.
