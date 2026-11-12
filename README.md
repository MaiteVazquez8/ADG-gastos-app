# ADG

Aplicación de control de gastos personales (**ADG · Administración Digital de Gastos**) desarrollada con **Expo SDK 57** y **React Native**.

## 📱 Descargar para Android

**[⬇️ Descargar la última versión](https://github.com/MaiteVazquez8/gastos/releases/latest)**

La aplicación se distribuye mediante **GitHub Releases**.

### Instalación

1. Entrá a **[la última Release](https://github.com/MaiteVazquez8/gastos/releases/latest)**.
2. Descargá el archivo `.apk` de la sección **Assets**.
3. Abrí el archivo descargado desde tu celular Android.
4. Si Android solicita permiso para instalar aplicaciones desde esa fuente, habilitalo para el navegador o gestor de archivos que utilizaste.
5. Confirmá la instalación.
6. Abrí **Gastos** y empezá a usarla.

> La aplicación no requiere una cuenta ni conexión a Internet para funcionar.

---

## ✨ Funcionalidades

* 💰 Gestión de gastos e ingresos.
* 📊 Presupuesto mensual.
* 🗂️ Categorías personalizadas.
* 📈 Distribución del presupuesto por categorías.
* 💵 Distribución mediante porcentajes o montos fijos.
* 📅 Historial mensual.
* 🎨 Modo claro y oscuro.
* ✨ Animaciones y microinteracciones.
* 📱 Interfaz optimizada para Android.

---

## 🛠️ Generar un APK

### Opción recomendada: EAS Build

El proyecto utiliza **Expo Application Services (EAS)** para generar los APK de Android.

#### 1. Instalar EAS CLI

```bash
npm install -g eas-cli
```

También se puede utilizar:

```bash
npx eas-cli
```

#### 2. Iniciar sesión en Expo

```bash
eas login
```

Se necesita una cuenta de [Expo](https://expo.dev).

#### 3. Generar el APK

```bash
eas build --platform android --profile preview
```

El perfil `preview` está configurado para generar un archivo **`.apk`**.

Cuando finalice el build, EAS mostrará un enlace para descargarlo.

### Configuración de EAS

La configuración se encuentra en `eas.json`.

El perfil `preview` utiliza:

* Android.
* Distribución interna.
* Formato `.apk`.
* `versionCode` incrementado automáticamente.
* Credenciales Android administradas por EAS.

La aplicación utiliza una **Android Keystore administrada por Expo/EAS**. No debe subirse ninguna clave privada al repositorio.

---

## 🔨 Generar un APK localmente

También es posible generar el APK en una máquina con Android/Gradle configurado.

```bash
npm install
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

El APK generado estará en:

```text
android/app/build/outputs/apk/release/app-release.apk
```

> Para la distribución normal se recomienda utilizar **EAS Build**, ya que evita tener que configurar manualmente todo el entorno Android.

---

## 🚀 Publicar una nueva versión

Las versiones públicas se distribuyen mediante **GitHub Releases**.

### 1. Actualizar la aplicación

Cuando prepares una nueva versión, actualizá el campo `version` en `app.json`.

Por ejemplo:

```json
{
  "version": "1.1.0"
}
```

El `versionCode` de Android es administrado automáticamente por EAS mediante `autoIncrement`.

### 2. Generar el APK

```bash
eas build --platform android --profile preview
```

### 3. Crear un tag

Por ejemplo:

```bash
git add .
git commit -m "Release v1.1.0"
git push
git tag v1.1.0
git push origin v1.1.0
```

### 4. Crear la GitHub Release

En GitHub:

**Releases → Draft a new release**

Seleccioná el tag:

```text
v1.1.0
```

Agregá las notas de la versión y adjuntá el APK generado por EAS.

Finalmente, seleccioná:

**Publish release**

La nueva versión quedará disponible para descargar desde:

```text
https://github.com/<tu-usuario>/gastos/releases/latest
```

---

## 🤖 GitHub Actions

El proyecto incluye:

```text
.github/workflows/build-android.yml
```

Este workflow permite automatizar la generación del APK mediante EAS.

Para utilizarlo es necesario configurar un secreto de GitHub llamado:

```text
EXPO_TOKEN
```

El token debe configurarse desde:

**GitHub → Settings → Secrets and variables → Actions**

El token se utiliza para autenticar GitHub Actions con Expo/EAS.

> Nunca guardes el `EXPO_TOKEN` directamente en el código fuente ni lo subas al repositorio.

Si no querés utilizar GitHub Actions, podés generar el APK manualmente con EAS y adjuntarlo a cada Release.

---

## 📦 ¿Dónde se publica el APK?

El APK **no se commitea al repositorio**.

La estructura recomendada es:

```text
Repositorio
├── código fuente
├── configuración
├── README.md
└── .github/
    └── workflows/
```

Y las aplicaciones compiladas se publican mediante:

```text
GitHub Releases
├── v1.0.0
│   └── Gastos-v1.0.0.apk
├── v1.1.0
│   └── Gastos-v1.1.0.apk
└── ...
```

Esto mantiene el repositorio liviano y permite conservar el historial de versiones.

---

## 💻 Desarrollo

Instalar las dependencias:

```bash
npm install
```

Iniciar Expo:

```bash
npm start
```

También podés utilizar:

```bash
npx expo start
```

### Chequeos

TypeScript:

```bash
npm run typecheck
```

Lint:

```bash
npm run lint
```

Tests de lógica:

```bash
npm run test:logic
```

Tests de stores:

```bash
npm run test:stores
```

---

## 📋 Información de la aplicación

| Propiedad            | Valor               |
| -------------------- | ------------------- |
| Nombre               | ADG                 |
| Plataforma principal | Android             |
| Framework            | React Native + Expo |
| Expo SDK             | 57                  |
| Package ID           | `com.gastos.app`    |
| Versión actual       | `1.0.0`             |
| Distribución         | GitHub Releases     |
| Formato              | APK                 |

---
