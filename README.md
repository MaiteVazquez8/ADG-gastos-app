# Gastos

App de control de gastos personales construida con **Expo** (SDK 57) y React Native.

## Descargar e instalar

La app se distribuye como un archivo **APK Android** a través de las **GitHub Releases** de este repositorio.

1. Abrí la pestaña [Releases](https://github.com/<tu-usuario>/gastos/releases) de este repositorio.
2. Buscá la última versión publicada (formato `v1.0.0`).
3. Descargá el archivo `app-v1.0.0.apk` adjunto a la Release.
4. En el celular, tocá el archivo descargado y aceptá la instalación.
   - Si no conocés la app, Android pedirá que habilites **"Instalar aplicaciones de fuentes desconocidas"** para el navegador o el gestor de archivos que usaste. Confirmá e instalá.
5. Abrí la app. No requiere cuenta ni conexión a internet para funcionar.

## Generar un APK

### Construcción local (rápida, sin credenciales)

Con Node.js instalado:

```bash
npm install
npx expo prebuild --platform android --no-install
cd android
./gradlew assembleRelease
```

El APK queda en `android/app/build/outputs/apk/release/app-release.apk`.

### Build administrado con EAS Build (recomendado)

1. Instalá el CLI de EAS: `npm install -g eas-cli` (o `npx eas-cli`).
2. Iniciá sesión: `eas login` (requiere una cuenta en [expo.dev](https://expo.dev)).
3. Ejecutá:

```bash
eas build --platform android --profile preview
```

Esto compila el APK en los servidores de EAS con la configuración definida en `eas.json`:

- Perfil `preview`: genera un **`.apk`** (no `.aab`) para distribución interna, e incrementa el `versionCode` automáticamente.
- Perfil `production`: genera un `.apk` de lanzamiento.

Al terminar, EAS muestra un vínculo para **descargar el APK**. Ese archivo es el que se adjunta a una GitHub Release.

### Automatizado con GitHub Actions

El repositorio incluye `.github/workflows/build-android.yml`. Al publicar una Release (o de forma manual), el workflow:

1. Compila el APK con EAS Build.
2. Sube el APK como artefacto del workflow.
3. Adjunta el APK a la Release que lo disparó.

Requiere configurar un secreto de GitHub llamado `EXPO_TOKEN` con un token de acceso de tu cuenta Expo (Settings > Secrets and variables > Actions). Sin ese token, el workflow no corre.

## APK en el repositorio vs. GitHub Release vs. GitHub Actions

| Cómo se publica | Dónde | Cuándo usarlo |
| --- | --- | --- |
| **Release de GitHub** | Página de Releases | Forma principal y recomendada: versiones públicas con historial, notas y un link estable por versión. |
| **Artefacto de GitHub Actions** | Pestaña "Actions" de cada run | Verificación técnica/QA interno de un build puntual; no es un link estable para usuarios. |
| **APK commiteado al repositorio** | Código fuente | No se utiliza. Los binarios no pertenecen al repo (bloatean el historial y rompen el diff). |

Siempre publicá la versión que van a usar tus usuarios en una **GitHub Release**.

## Publicar una nueva versión (primer release y siguientes)

1. Actualizá `version` y `versionCode` en `app.json` (o usá `eas build --auto-increment`).
2. Compilá con `eas build --platform android --profile preview` y descargá el APK.
3. Creá un tag `vX.Y.Z` (`git tag v1.0.0`) y pusheá el repo.
4. Creá la Release desde la pestaña Releases: elegí el tag, escribí las notas y **adjuntá el APK** que descargaste.
   - También podés publicar la Release primero y dejar que el workflow de Actions adjunte el APK automáticamente (requiere el secreto `EXPO_TOKEN`).

## Desarrollo

```bash
npm install
npm start        # Expo Dev Server
```

Chequeos disponibles: `npm run typecheck`, `npm run lint`, `npm run test:logic`, `npm run test:stores`.

## Identidad de la app

- **Nombre:** Gastos
- **ID de paquete (Android/iOS):** `com.gastos.app`
- **Versión:** 1.0.0 (`versionCode` 1)
