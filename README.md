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
- **Privacidad Local**: Todos tus registros se almacenan en una base de datos SQLite local dentro de la arquitectura del servidor.
- **Exportación de Datos**: Descarga tus registros cronológicos en formato JSON o CSV.
- **Seguridad**: Autenticación mediante JWT y contraseñas cifradas.

## 🚀 Tecnologías

- **Frontend**: React 18, Vite, Three.js, React Three Fiber, React Router.
- **Backend**: Node.js, Express.js.
- **Base de Datos**: SQLite (procesada nativamente con sql.js).
- **Autenticación**: JSON Web Tokens (JWT), bcryptjs.

## 📋 Instalación y Uso Local

### Prerrequisitos

- Node.js (v18 o superior)
- Ollama (Opcional, solo si deseas ejecutar la IA de forma local y privada)

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/Diario-de-Emociones.git
cd Diario-de-Emociones
```

### 2. Iniciar el Backend (Servidor)

```bash
cd server
npm install
npm start
```

El servidor se ejecutará en <http://localhost:3001>

### 3. Iniciar el Frontend (Cliente)

En una nueva terminal:

```bash
cd client
npm install
npm run dev
```

La aplicación web estará disponible en <http://localhost:5173>

## 🌐 Despliegue (Web App)

Al ser una aplicación Full-Stack con base de datos en archivo local (`sql.js`), no se puede desplegar el servidor en plataformas de sitios estáticos (como GitHub Pages).

Para desplegar este proyecto en producción:

1. **Frontend**: Puedes compilar tu cliente con `npm run build` en el directorio `/client` y desplegar el directorio resultante `dist` en GitHub Pages, Vercel o Netlify. Deberás configurar la variable de entorno para que las dependencias de red apunten a tu servidor backend de producción.
2. **Backend**: Puedes desplegar el directorio `/server` en servicios de hosting Node.js (como Render, Railway, DigitalOcean o Heroku). Recuerda configurar un "volume" o disco persistente para almacenar los archivos del esquema de la base de datos local y evitar pérdida de información en reinicios.

## 📝 Configuración de IA Avanzada

Para generar análisis sobre distorsiones cognitivas:

1. Navega a la sección **Ajustes** dentro de la app (icono de engranaje).
2. Selecciona tu proveedor preferido (OpenAI, Gemini, Claude, u Ollama).
3. Ingresa tu API Key (O si seleccionaste Ollama, ingresa el nombre de tu modelo descargado localmente, por ejemplo `llama3.2`).
4. Ve al panel de **Análisis IA** y haz clic en "Analizar".

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Eres libre de usar, modificar y distribuir el código.
