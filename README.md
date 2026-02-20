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

## 🌐 Despliegue con 1 Clic (Recomendado)

Esta aplicación ha sido diseñada como una **Local WebApp (100% Frontend)**. Todos tus registros emocionales y la configuración de IA se almacenan localmente en tu navegador usando `localStorage`. ¡La máxima privacidad!

### Desplegar instantáneamente en Vercel

La forma más rápida de tener tu aplicación en vivo en Internet, de forma gratuita y sin configurar servidores es usando Vercel. Haz clic en el siguiente botón:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2A%2Agithub.com%2Fnestorfernando3%2FDiario-de-Emociones)

1. Vercel te pedirá iniciar sesión con GitHub.
2. Automáticamente clonará este proyecto en tu cuenta y lo subirá a Internet.
3. En menos de 1 minuto, te entregará un enlace público listo para usar desde cualquier dispositivo (por ejemplo, `diario-de-emociones.vercel.app`).

## 📝 Configuración de IA Avanzada

Para generar análisis sobre distorsiones cognitivas:

1. Navega a la sección **Ajustes** dentro de la app (icono de engranaje).
2. Selecciona tu proveedor preferido (OpenAI, Gemini, Claude, u Ollama).
3. Ingresa tu API Key (O si seleccionaste Ollama, ingresa el nombre de tu modelo descargado localmente, por ejemplo `llama3.2`).
4. Ve al panel de **Análisis IA** y haz clic en "Analizar".

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Eres libre de usar, modificar y distribuir el código.
