# Cemedip Web

Frontend interno de Cemedip construido con Angular 21, componentes standalone, cambio de detección zoneless, PrimeNG 21 y Tailwind CSS 4.

Este README deja claros los comandos reales del repo y fijar las convenciones operativas más importantes para trabajar sin romper la arquitectura existente.

## Alcance

- Proyecto privado de uso interno para el equipo de desarrollo.
- No pretende ser documentación funcional del producto ni material comercial.
- La referencia operativa del repo vive aquí y en [AGENTS.md](./AGENTS.md).

## Stack

- Angular 21 (`frameworkVersion: 21`)
- Componentes standalone
- `provideZonelessChangeDetection`
- PrimeNG 21 con preset y Pass Through propios
- Tailwind CSS 4
- Unit tests con `ng test` y Vitest en el builder de Angular
- `npm` como package manager

## Requisitos

- Node.js `24`
- npm `11.x`

Si usas `nvm`:

```bash
nvm use
```

## Puesta en marcha

Instalación:

```bash
npm install
```

Desarrollo local:

```bash
npm start
```

La aplicación queda disponible en `http://localhost:4200/`.

## Scripts disponibles

Los scripts válidos son los definidos en [package.json](./package.json):

```bash
npm start
npm run build
npm run watch
npm test
```

Notas:

- `npm run lint` ejecuta `ng lint` con `angular-eslint`.
- `npm run watch` compila en modo desarrollo con watch.
- `npm test` usa el builder de pruebas de Angular configurado para este workspace.

## Verificación antes de cerrar cambios

Para cambios de código, el mínimo esperado en este repo es:

```bash
npm run build
npm test -- --watch=false
```

Además:

- `npm run lint` debe correrse cuando el cambio toque código fuente o templates.
- Si el cambio toca templates, estilos, rutas o integración, no se considera terminado sin build verde.
- Si el cambio altera comportamiento relevante, deben agregarse o ajustarse pruebas.

## Estructura del repositorio

```text
src/
  app/
    core/      configuración global, providers, guards, interceptors y servicios transversales
    features/  páginas y casos de uso por dominio
    shared/    piezas reutilizables agnósticas del dominio
  theme/       preset semántico y Pass Through global de PrimeNG
  styles.css   entrypoint global de estilos
docs/          referencias internas operativas
public/        assets públicos
```

Estructura funcional actual en `src/app/features/`:

- `auth/`
- `home/`
- `training/`

## Puntos de entrada y configuración clave

- [src/main.ts](src/main.ts): bootstrap de la app.
- [src/app/app.config.ts](src/app/app.config.ts): router, HTTP, PrimeNG y zoneless change detection.
- [src/theme/cemedip-preset.ts](src/theme/cemedip-preset.ts): tokens semánticos y definición del tema.
- [src/theme/cemedip-pt.ts](src/theme/cemedip-pt.ts): estilos base de PrimeNG vía Pass Through.
- [src/styles.css](src/styles.css): capas globales, imports y composición compartida.
- [src/environments/environment.ts](src/environments/environment.ts): configuración de entorno.

## Convenciones de arquitectura

- No meter llamadas HTTP directamente dentro de componentes de página.
- La orquestación de dominio debe vivir en servicios por feature.
- Separar con claridad estado de UI, estado de negocio, presentación e integraciones.
- `shared/components/` es solo para piezas reutilizables y agnósticas del dominio.
- `features/<feature>/components/` es para reutilización local de la feature.
- Antes de crear nuevas abstracciones, revisar si el patrón ya existe en `core`, `shared`, `theme` o la feature.

## Convenciones Angular y PrimeNG

- Preferir APIs modernas de Angular compatibles con zoneless.
- Evitar patrones heredados que dependan implícitamente de Zone.js.
- En PrimeNG 21 no usar `styleClass`, `contentStyleClass`, `maskStyleClass` y variantes similares.
- Para personalización interna de componentes PrimeNG, usar `[pt]`.
- Preferir atributos y variantes modernas (`rounded`, `text`, `outlined`, `variant="text"`, etc.) cuando el componente las soporte.

## Convenciones de estilos

La propiedad de estilos en este repo está repartida así:

- `src/theme/cemedip-preset.ts`: tokens semánticos, color, superficies y semántica global.
- `src/theme/cemedip-pt.ts`: apariencia base de componentes PrimeNG.
- `src/styles.css`: base cross-app e imports globales.
- CSS de feature: cerca de la feature cuando el patrón no es global.
- Template: decisiones visuales locales de una pantalla.

Reglas prácticas:

- Preferir tokens semánticos antes que colores hardcodeados.
- No usar `src/styles.css` como depósito de estilos de una sola feature.
- Si un override de PrimeNG se repite, moverlo al PT global o a un wrapper compartido.

## Formularios, validación y accesibilidad

- Los validadores reutilizables deben vivir en `shared/validators/`.
- Mantener una única convención para mostrar errores de formularios.
- No dejar `console.log` como solución final en flujos de formulario o autenticación.
- Mantener asociaciones explícitas entre label, ayuda, error y control.
- Conservar foco visible y navegación por teclado razonable.

## Cómo proponer cambios

Antes de implementar:

1. Revisa la estructura existente y sigue el patrón ya presente.
2. Verifica scripts reales en `package.json`.
3. Si el cambio repite estructura visual, evalúa extraer a `shared`.

Durante la implementación:

1. Evita mezclar lógica de negocio con componentes visuales.
2. Si el markup de una vista crece demasiado, usa `templateUrl`.
3. Si un bloque de clases Tailwind se repite con la misma intención, evalúa extracción.

Al cerrar:

1. Corre verificaciones relevantes.
2. Confirma que la app compila.
3. Asegura consistencia con [AGENTS.md](./AGENTS.md).

## Referencias internas

- [AGENTS.md](./AGENTS.md): reglas operativas del repositorio.
