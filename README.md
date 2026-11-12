# ADG — Administración Digital de Gastos

Aplicación móvil para la gestión y el control de finanzas personales, desarrollada con **React Native y Expo SDK 57**.

ADG permite registrar ingresos y gastos, organizar movimientos mediante categorías, administrar presupuestos y consultar estadísticas para facilitar el seguimiento de la economía personal.

La aplicación está orientada a Android y se distribuye mediante archivos APK publicados en GitHub Releases.

## Enlaces

- <mark><strong>Figma</strong></mark> — <a href="https://www.figma.com/design/4yclhnwimuPH6p0VSHqIJG/ADG--Administracion-Digital-de-Gastos-?node-id=0-1&t=XDGFq4iRSydJdIrj-1"><ins>Ver diseño en Figma</ins></a>
- <mark><strong>Manual de marca</strong></mark> — <a href="https://canva.link/4ig5t2odxqhmg0p"><ins>Ver manual de marca en Canva</ins></a>
- <mark><strong>Plan de marketing</strong></mark> — <a href="https://canva.link/qia9ahu3r0dqqzd"><ins>Ver plan de marketing en Canva</ins></a>

## Descargar la aplicación

**[Descargar la última versión de ADG](https://github.com/MaiteVazquez8/gastos/releases/latest)**

Las versiones compiladas se encuentran disponibles en la sección Assets de cada GitHub Release.

### Instalación en Android

1. Ingresar a la [última versión publicada](https://github.com/MaiteVazquez8/gastos/releases/latest).
2. Descargar el archivo `.apk` desde Assets.
3. Abrir el archivo desde el dispositivo Android.
4. Autorizar la instalación desde fuentes externas si el sistema lo solicita.
5. Confirmar la instalación.

La aplicación no requiere una cuenta de usuario ni conexión a Internet para utilizar sus funcionalidades locales.

---

## Funcionalidades

- Registro y administración de ingresos y gastos.
- Organización de movimientos mediante categorías.
- Gestión de presupuestos mensuales.
- Distribución del presupuesto por categorías.
- Asignación de presupuestos mediante porcentajes o montos fijos.
- Consulta del historial de movimientos por período.
- Visualización de estadísticas y gráficos.
- Seguimiento del dinero disponible.
- Personalización de la apariencia mediante modo claro y oscuro.
- Interfaz adaptada a dispositivos Android.
- Animaciones y microinteracciones.

## Tecnologías utilizadas

| Tecnología | Utilización |
|---|---|
| JavaScript | Lenguaje principal |
| React Native | Desarrollo de la interfaz móvil |
| Expo SDK 57 | Entorno de desarrollo y herramientas nativas |
| Expo CLI | Ejecución y administración del proyecto |
| EAS Build | Compilación de aplicaciones Android |
| Node.js | Entorno de ejecución |
| npm | Gestión de dependencias |
| Git | Control de versiones |
| GitHub Releases | Distribución de APK |

## Requisitos previos

Para trabajar con el código fuente se necesita:

- Node.js y npm.
- Git.
- Un dispositivo Android o emulador para probar la aplicación.
- Expo CLI, disponible mediante `npx`.
- Una cuenta de Expo para generar compilaciones con EAS.

Se recomienda utilizar una versión de Node.js compatible con Expo SDK 57 y las dependencias declaradas en el proyecto.

## Ejecución del proyecto

### 1. Ubicar el proyecto

El proyecto se encuentra dentro de la carpeta `Gastos v 1.2.0`.

En Windows, abrir PowerShell y posicionarse en el directorio correspondiente:

```powershell
cd "Gastos v 1.2.0"
```

Es importante ejecutar los comandos desde el directorio que contiene el `package.json` principal de la aplicación.

### 2. Instalar las dependencias

```bash
npm install
```

Este comando instala las dependencias declaradas en `package.json`.

### 3. Iniciar el servidor de desarrollo

```bash
npx expo start
```

Expo iniciará el servidor de desarrollo y mostrará un código QR en la terminal.

Desde allí se puede abrir la aplicación en un dispositivo compatible o utilizar las opciones disponibles para ejecutar el proyecto en Android.

Para intentar iniciar directamente en un emulador Android:

```bash
npx expo start --android
```

Para reiniciar el servidor y limpiar la caché:

```bash
npx expo start --clear
```

### 4. Ejecutar en un dispositivo Android

1. Conectar el dispositivo Android al mismo entorno de red que la computadora.
2. Iniciar Expo mediante `npx expo start`.
3. Escanear el código QR o utilizar el cliente de desarrollo compatible configurado para el proyecto.
4. Esperar a que finalice la carga de la aplicación.

Si el proyecto utiliza módulos nativos que no están incluidos en Expo Go, será necesario utilizar un Development Build.

## Estructura del proyecto

```text
Gastos/                       # Raíz del repositorio (paquete npm `gastos`, app `ADG`)
│
├── app/                      # Rutas de la aplicación (expo-router, rutas tipadas)
│   ├── _layout.tsx           # Stack raíz (StatusBar, GestureHandlerRootView, splash de marca ADG)
│   └── (tabs)/               # Pestañas principales + pantallas ocultas con tab bar visible
│       ├── _layout.tsx       # Navegación por pestañas (Inicio · Actividad · Agregar · Análisis · Perfil)
│       ├── index.tsx         # Inicio (inicio de la app, situación del mes, resumen)
│       ├── actividad.tsx     # Movimientos (lista + buscador + filtros)
│       ├── agregar.tsx       # Nuevo gasto / ingreso (form unificado)
│       ├── analisis.tsx      # Análisis y gráficos por categoría
│       ├── perfil.tsx        # Perfil del usuario
│       ├── expense/[id].tsx  # Detalle del movimiento (ruta dinámica)
│       └── …                 # Resto de pantallas: categorías, presupuestos, historial, filtros, etc.
│
├── components/               # Componentes reutilizables de UI y lógica visual
│   ├── charts/               # Gráficos SVG custom (DonutChart, BarChart)
│   ├── AdgLogo.tsx           # Logo oficial de ADG (variante de Marketing/Logo)
│   ├── AdgTabBar.tsx         # Barra de pestañas inferior
│   ├── DesktopSidebar.tsx    # Barra lateral para pantallas anchas (mock escritorio)
│   ├── Screen.tsx            # Marco de pantalla responsive (móvil / escritorio)
│   └── …                     # Botones, cards, formularios, sheets, líneas, anillos, etc.
│
├── assets/                   # Recursos gráficos empaquetados en la app
│   └── brand/                # Logos recortados (uso en runtime)
│
├── constants/                # Constantes globales: tema (light/dark), spacing/radius, datos demo
│
├── store/                    # Estado global (zustand + persistencia en AsyncStorage)
│   └── demoSeed.ts           # Carga de datos de demostración (solo primera ejecución)
│
├── hooks/                    # Hooks personalizados (useHydration, useMotion)
├── types/                    # Tipos TypeScript compartidos
├── utils/                    # Funciones auxiliares puras (moneda, fechas, agregación, movimientos, CSV)
├── scripts/                  # Utilitarios de prueba ejecutados con Node (test:logic, test:stores, test:demo)
│
├── docs/                     # Documentación y material de diseño (no va a la app)
│   ├── Marketing/            # Logos originales, redes sociales, manual de marca y plan de marketing (PDF/PPTX)
│   ├── Mock/                 # Diseño de referencia de la app (01 Vistas, 02 Componentes, 04 Estructuras)
│   └── proyecto final - Maite Vazquez.docx / .pdf   # Memoria descriptiva del proyecto
│
├── app.json                  # Configuración de Expo (nombre ADG, íconos, tema oscuro, plugins)
├── eas.json                  # Configuración de builds con EAS (preview/production, APK)
├── .npmrc                    # Configuración de npm (legacy-peer-deps)
├── eslint.config.js          # Reglas de lint
├── expo-env.d.ts             # Tipos de Expo
├── package.json              # Dependencias y scripts
├── package-lock.json         # Bloqueo de dependencias
└── README.md                 # Este archivo
```

`node_modules/` y `android/` (proyecto nativo generado con `npx expo prebuild`) se ignoran y no se incluyen en el repositorio. `.github/` existe pero queda vacía tras el commit «cambios» (el workflow de build automático fue eliminado).

## Verificación y pruebas

El proyecto dispone de comandos para verificar diferentes aspectos de la aplicación.

### TypeScript

```bash
npm run typecheck
```

### Lint

```bash
npm run lint
```

### Tests de lógica

```bash
npm run test:logic
```

### Tests de stores

```bash
npm run test:stores
```

Estos comandos permiten detectar errores de tipado, problemas de calidad del código y fallos en la lógica de la aplicación.

## Generación de APK

ADG utiliza **Expo Application Services (EAS Build)** para compilar la aplicación Android.

Se recomienda este método porque permite generar el APK sin configurar manualmente todo el entorno de compilación de Android.

### 1. Instalar EAS CLI

Instalación global:

```bash
npm install -g eas-cli
```

También se puede ejecutar mediante:

```bash
npx eas-cli
```

### 2. Iniciar sesión

```bash
eas login
```

Es necesario disponer de una cuenta en [Expo](https://expo.dev/).

### 3. Verificar el proyecto

```bash
npx expo-doctor
```

Este comando permite comprobar la configuración y detectar posibles incompatibilidades.

### 4. Generar el APK

```bash
eas build --platform android --profile preview
```

EAS iniciará la compilación en sus servidores y mostrará el progreso del proceso.

Una vez finalizado, proporcionará un enlace para descargar el APK.

### Configuración de compilación

La configuración se encuentra en `eas.json`.

El perfil `preview` está destinado a generar APK de distribución interna:

- Plataforma: Android.
- Distribución: interna.
- Formato: APK.
- Incremento automático de `versionCode`, si está habilitado en la configuración.
- Credenciales Android administradas por EAS.

El perfil `production` está destinado a generar un Android App Bundle (AAB) para distribución en Google Play.

### Firma de la aplicación

La aplicación utiliza credenciales de firma Android administradas por Expo/EAS.

Es importante conservar la misma clave de firma y el mismo identificador de paquete para permitir actualizaciones sobre instalaciones anteriores.

No se deben subir archivos de claves privadas ni credenciales al repositorio.

## Compilación local de Android

También es posible compilar la aplicación localmente utilizando Gradle.

Se requiere tener instalado y configurado:

- Android Studio.
- Android SDK.
- Java compatible con la configuración de Gradle.
- Herramientas de compilación de Android.

Primero, generar los proyectos nativos si todavía no existen:

```bash
npx expo prebuild --platform android --no-install
```

En Windows PowerShell:

```powershell
cd android
.\gradlew.bat assembleRelease
```

En macOS/Linux:

```bash
cd android
./gradlew assembleRelease
```

El archivo generado se encontrará en:

```text
android/app/build/outputs/apk/release/app-release.apk
```

La compilación local requiere configurar correctamente las credenciales de firma para obtener un APK distribuible.

Para las compilaciones habituales se recomienda utilizar EAS Build.

## Publicación de nuevas versiones

Las versiones públicas de ADG se distribuyen mediante GitHub Releases.

### 1. Actualizar la versión

Modificar el campo `version` de `app.json`.

Ejemplo para la versión 1.2.0:

```json
{
  "expo": {
    "version": "1.2.0"
  }
}
```

El `versionCode` de Android debe incrementarse en cada actualización. Si se utiliza `autoIncrement` en EAS, el incremento se administra durante la compilación.

### 2. Generar una nueva compilación

```bash
eas build --platform android --profile preview
```

Descargar el APK una vez finalizado el proceso.

### 3. Crear una etiqueta de versión

Ejemplo:

```bash
git tag v1.2.0
git push origin v1.2.0
```

Si los cambios todavía no están publicados en el repositorio, primero deben integrarse mediante el flujo habitual de Git.

### 4. Crear una GitHub Release

1. Ingresar al repositorio de GitHub.
2. Abrir la sección Releases.
3. Seleccionar Draft a new release.
4. Elegir el tag correspondiente.
5. Agregar el título y las notas de la versión.
6. Adjuntar el APK generado.
7. Seleccionar Publish release.

La última versión estará disponible desde:

https://github.com/MaiteVazquez8/gastos/releases/latest

### Formato de publicación

Se recomienda utilizar nombres consistentes para los archivos:

```text
Gastos-v1.0.0.apk
Gastos-v1.1.0.apk
Gastos-v1.2.0.apk
```

## Automatización con GitHub Actions

El repositorio incluye el workflow:

```text
.github/workflows/build-android.yml
```

Este archivo permite automatizar la generación de compilaciones Android utilizando EAS.

Para habilitarlo, se debe configurar el siguiente secreto:

```text
EXPO_TOKEN
```

Desde GitHub:

**Settings → Secrets and variables → Actions → New repository secret**

El valor corresponde a un token de acceso generado desde Expo.

El workflow puede utilizar este secreto para autenticarse y ejecutar las compilaciones sin exponer credenciales en el código fuente.

El proceso de publicación de GitHub Releases puede realizarse manualmente adjuntando el APK generado.

## Distribución y almacenamiento de versiones

Los APK no deben incorporarse directamente al repositorio mediante commits.

El código fuente y los archivos de configuración permanecen en GitHub, mientras que las compilaciones se distribuyen mediante Releases.

Estructura de referencia:

```text
gastos/
│
├── código fuente
├── configuración
├── documentación
└── .github/
    └── workflows/
        └── build-android.yml

GitHub Releases/
├── v1.0.0/
│   └── Gastos-v1.0.0.apk
├── v1.1.0/
│   └── Gastos-v1.1.0.apk
└── v1.2.0/
    └── Gastos-v1.2.0.apk
```

Esto permite mantener un historial de versiones descargables sin aumentar innecesariamente el tamaño del repositorio.

## Información técnica

| Propiedad | Valor |
|---|---|
| Nombre | ADG |
| Nombre completo | Administración Digital de Gastos |
| Versión documentada | 1.2.0 |
| Plataforma principal | Android |
| Framework | React Native |
| Entorno | Expo SDK 57 |
| Lenguaje principal | JavaScript |
| Package ID | `com.gastos.app` |
| Compilación | Expo EAS Build |
| Formato de distribución | APK |
| Distribución pública | GitHub Releases |
| Repositorio | [MaiteVazquez8/gastos](https://github.com/MaiteVazquez8/gastos) |

---

## Desarrollo y mantenimiento

Para contribuir al desarrollo de ADG se recomienda:

- Mantener la arquitectura y convenciones existentes.
- Reutilizar los componentes de interfaz.
- Evitar dependencias innecesarias.
- Mantener la compatibilidad con Expo SDK 57.
- Verificar el funcionamiento en Android antes de publicar.
- Actualizar la documentación cuando se incorporen funcionalidades o cambios técnicos.
- Incrementar la versión correspondiente antes de preparar una nueva distribución.

**ADG — Administración Digital de Gastos**  
Proyecto de desarrollo de software móvil.