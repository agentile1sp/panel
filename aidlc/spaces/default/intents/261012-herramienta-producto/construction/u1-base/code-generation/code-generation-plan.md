# Plan de código: U1 · Base común (`u1-base`)

## Summary

- Builds: el servidor local que se arranca con un comando, el guardado completo o nulo en archivos, el deshacer para operaciones compuestas y los adjuntos seguros
- Touches: carpeta nueva `herramienta/` (src/base, public, tests/u1-base, package.json) y `herramienta/docs/formato-datos.md`
- Tests: unas 24 pruebas con el ejecutor integrado de Node (unitarias del almacén, los adjuntos y el servidor, más una de integración del arranque)

## Contexto

Unidad U1 de `inception/units-generation/unit-of-work.md` (Bolt B1 de `inception/delivery-planning/bolt-plan.md`). No tiene etapas de diseño por unidad en este plan, así que parte directamente de `requirements.md` (FR6, FR6.1, NFR1), del catálogo de componentes de Domain Design y de los hallazgos aceptados de Units Generation (R-01, R-02).

## Tecnología

Es la primera unidad y ninguna etapa anterior eligió tecnología. Se propone la opción con menos piezas:

- **Node.js 20 o superior, JavaScript con módulos ES**, sin dependencias externas. El servidor usa `node:http` y el guardado usa `node:fs`.
- **Pruebas con el ejecutor integrado de Node** (`node --test`), sin instalar nada. Las aserciones usan `node:assert/strict`.
- **Pantallas en HTML, CSS y JavaScript del navegador, sin framework**, servidas como archivos estáticos desde `herramienta/public/`.
- **Datos en archivos JSON legibles**, en `herramienta/datos/` (ignorada por git). La ruta se puede cambiar con la variable de entorno `HERRAMIENTA_DATOS`, que usan las pruebas para trabajar en carpetas temporales.

Alternativas descartadas: TypeScript con un framework web (Express, Fastify) añade compilación y dependencias que una herramienta local de un solo usuario no necesita; una base de datos SQLite rompe el requisito de archivos legibles (ADR-005).

## Estructura

```
herramienta/
  package.json            # "type": "module", scripts start y test, engines node >=20
  src/
    main.js               # raíz de composición: crea el almacén, registra rutas y arranca
    base/
      config.js           # puerto, host 127.0.0.1, carpeta de datos
      almacen.js          # guardar, leer, listar, borrar, apartar y restaurar
      adjuntos.js         # saneado de nombres, guardado y lectura de adjuntos
      servidor.js         # servidor HTTP, registro de rutas, archivos estáticos, origen
      errores.js          # tipos de error de la base
  public/
    index.html            # página mínima: "La herramienta está en marcha"
  tests/u1-base/
    almacen.test.js
    adjuntos.test.js
    servidor.test.js
    arranque.test.js      # integración: arrancar, guardar, reiniciar y leer
  docs/formato-datos.md   # formato de la carpeta de datos
```

## Decisiones que resuelven los riesgos aceptados

- **Quién monta la aplicación (hallazgo R-01).** `src/main.js` es la raíz de composición y pertenece a U1. U1 expone `crearServidor({ rutas })` y un registro de rutas (`registrar(metodo, patron, manejador)`) que no conoce a ninguna otra unidad. B2 añadirá en `main.js` la validación de la definición al arrancar, y B3 y B4 añadirán el registro de sus rutas. Así U1 no depende de nadie y el grafo sigue sin ciclos.
- **Deshacer en operaciones compuestas (hallazgo R-02).** El almacén ofrece dos contratos:
  - `guardar(ruta, datos)` devuelve el contenido anterior (o `null` si no existía), y `restaurar(ruta, anterior)` lo vuelve a dejar, borrando el archivo si `anterior` es `null`.
  - `apartar(ruta)` mueve un archivo o carpeta, adjuntos incluidos, a `datos/.apartado/<marca>` y devuelve la marca. `recuperar(marca)` lo devuelve a su sitio y `descartar(marca)` lo borra de verdad.

  U4 usará estos contratos para deshacer la primera escritura si falla la segunda. Si el propio deshacer falla o el proceso se cae entre las dos escrituras, queda como riesgo aceptado: lo apartado no se pierde, sigue en `datos/.apartado/`, y al arrancar se avisa en la consola si hay elementos apartados.

## Pasos

### Paso 1. Estructura del proyecto y configuración de producción
- [ ] Crear `herramienta/package.json` (`"type": "module"`, `"engines": { "node": ">=20" }`, scripts `start: node src/main.js` y `test: node --test tests/*/*.test.js`), sin dependencias. Desde Node 21, `node --test` no acepta carpetas, solo archivos o patrones; por eso todos los comandos de pruebas usan `*.test.js`.
- [ ] Crear `src/base/config.js`: host fijo `127.0.0.1`, puerto `3210` (cambiable con `PUERTO`), carpeta de datos `herramienta/datos/` (cambiable con `HERRAMIENTA_DATOS`).
- [ ] Crear `src/base/errores.js` con `ErrorAlmacen` y `ErrorAdjunto` (código, mensaje en español, causa).
- [ ] Añadir `herramienta/datos/` al `.gitignore` de la raíz.
- Traza: FR6, FR6.1.

### Paso 2. Ejecutor de pruebas listo
- [ ] Crear `tests/u1-base/` con una prueba de humo y comprobar que se ejecuta con `node --test tests/u1-base/*.test.js` desde `herramienta/`.
- [ ] Añadir `tests/ayudas/carpeta-temporal.js`, que crea y borra carpetas de datos temporales para cada prueba.
- Traza: NFR5.

### Paso 3. Almacén de archivos (acceso a datos): implementar
- [ ] `guardar(ruta, datos)`: valida que la ruta queda dentro de la carpeta de datos, serializa a JSON con sangría, escribe en un temporal en la misma carpeta, hace `fsync` y luego `rename` sobre el definitivo. Devuelve el contenido anterior. Si algo falla, borra el temporal, conserva el archivo anterior y lanza `ErrorAlmacen`.
- [ ] `leer(ruta)` (devuelve `null` si no existe y lanza `ErrorAlmacen` si el JSON está dañado), `listar(carpeta)` y `existe(ruta)`.
- [ ] `restaurar(ruta, anterior)`, `apartar(ruta)`, `recuperar(marca)`, `descartar(marca)` y `listarApartados()`.
- Traza: FR6.1, NFR1, R-02.

### Paso 4. Almacén de archivos: escribir y ejecutar sus pruebas
- [ ] Guardar y leer devuelven lo mismo, incluidos comillas, saltos de línea y caracteres especiales (AC4.4 como garantía de la base).
- [ ] Un guardado que falla (temporal no escribible simulado) deja intacto el archivo anterior y lanza `ErrorAlmacen` (NFR1).
- [ ] `guardar` devuelve el contenido anterior y `restaurar` lo deja como estaba, también cuando no existía.
- [ ] `apartar` y `recuperar` devuelven una carpeta con varios archivos a su sitio; `descartar` la borra.
- [ ] Una ruta con `../` es rechazada sin escribir nada.
- [ ] Leer un JSON dañado lanza `ErrorAlmacen` con el nombre del archivo.
- [ ] Ejecutar `node --test tests/u1-base/almacen.test.js`.

### Paso 5. Adjuntos (lógica de negocio de la base): implementar
- [ ] `sanearNombre(nombre)`: toma solo el nombre final, quita separadores de ruta, `..`, caracteres de control y reservados, limita a 100 caracteres y usa `adjunto` si queda vacío.
- [ ] `guardarAdjunto(carpeta, nombre, contenido)`: tamaño máximo de 10 MB, nombre saneado más un prefijo único para que no se pisen, escritura completa o nula y comprobación final de que la ruta resuelta queda dentro de la carpeta de datos.
- [ ] `leerAdjunto(ruta)`: devuelve el contenido y el nombre original para la descarga.
- Traza: FR6.1 (adjuntos de FR4.4), seguridad del hallazgo R-03 de Domain Design.

### Paso 6. Adjuntos: escribir y ejecutar sus pruebas
- [ ] Un nombre normal se guarda y se lee igual.
- [ ] Nombres como `../../etc/passwd`, `..\\x` o `/abs/ruta` quedan dentro de la carpeta de datos.
- [ ] Un nombre vacío o solo con caracteres no válidos se guarda como `adjunto`.
- [ ] Un archivo de más de 10 MB es rechazado con `ErrorAdjunto` sin dejar nada escrito.
- [ ] Dos adjuntos con el mismo nombre no se pisan.
- [ ] Ejecutar `node --test tests/u1-base/adjuntos.test.js`.

### Paso 7. Servidor local (API): implementar
- [ ] `crearServidor({ rutas, carpetaPublica })` sobre `node:http`, escuchando solo en `127.0.0.1`.
- [ ] Registro de rutas con método y patrón con parámetros (`/api/productos/:id`), lectura del cuerpo JSON con límite de tamaño y respuestas JSON uniformes `{ ok, datos | error }`.
- [ ] Control de origen: rechaza con 403 las peticiones cuyo `Host` no sea `127.0.0.1:<puerto>` o `localhost:<puerto>`, y las peticiones que cambian datos con una cabecera `Origin` distinta del propio origen.
- [ ] Archivos estáticos desde `public/`, sin salir de esa carpeta, con tipo de contenido por extensión.
- [ ] Descarga de adjuntos con `Content-Disposition: attachment`, `Content-Type: application/octet-stream` y `X-Content-Type-Options: nosniff`.
- [ ] Errores: un `ErrorAlmacen` o `ErrorAdjunto` responde 500 o 400 con su mensaje en español y queda registrado en la consola; nunca se pierde en silencio.
- Traza: FR6, R-01, hallazgo R-03 de Domain Design.

### Paso 8. Servidor local: escribir y ejecutar sus pruebas
- [ ] Una ruta registrada responde con su manejador y sus parámetros.
- [ ] Una ruta desconocida responde 404 en JSON.
- [ ] Una petición con `Host` ajeno responde 403.
- [ ] Una petición que cambia datos con `Origin` ajeno responde 403, y con el propio origen se acepta.
- [ ] `/` sirve `index.html` y una ruta con `../` no sale de `public/`.
- [ ] Un manejador que lanza `ErrorAlmacen` produce un 500 con mensaje, sin tumbar el servidor.
- [ ] Un adjunto se sirve como descarga con las cabeceras indicadas.
- [ ] Ejecutar `node --test tests/u1-base/servidor.test.js`.

### Paso 9. Pantalla mínima y raíz de composición: implementar
- [ ] `public/index.html` en español con el texto "La herramienta está en marcha", sin JavaScript todavía.
- [ ] `src/main.js`: crea la carpeta de datos si no existe, avisa en la consola si hay elementos apartados, crea el almacén y el servidor con un registro de rutas vacío, arranca y escribe la dirección local. Si el puerto está ocupado o la carpeta no se puede crear, termina con un mensaje claro y código de salida distinto de cero.
- [ ] Ruta de comprobación `GET /api/estado` que responde `{ ok: true }`.
- Traza: FR6, R-01.

### Paso 10. Arranque: escribir y ejecutar la prueba de integración
- [ ] Arrancar el servidor en un puerto libre con una carpeta temporal, guardar un dato con el almacén, detenerlo, volver a arrancarlo y comprobar que el dato sigue ahí (FR6.1, AC6.1 a nivel de base).
- [ ] `GET /api/estado` responde `{ ok: true }` tras el arranque.
- [ ] Con la carpeta de datos no creable, el arranque falla con mensaje claro.
- [ ] Ejecutar `node --test tests/u1-base/arranque.test.js`.

### Paso 11. Configuración de entorno
- [ ] Documentar en `herramienta/README.md` cómo arrancar (`npm start` dentro de `herramienta/`), el requisito de Node 20 o superior y las variables `PUERTO` y `HERRAMIENTA_DATOS`.

### Paso 12. Documentación y trazabilidad
- [ ] Escribir `herramienta/docs/formato-datos.md`: estructura de la carpeta de datos, JSON con sangría en UTF-8, escritura completa o nula, `.apartado/` y adjuntos. Deja huecos con nombre para que U2, U3 y U4 documenten sus archivos (ADR-005, preparado para que AI-DLC lo lea más adelante).
- [ ] Ejecutar todas las pruebas de la unidad con `node --test tests/u1-base/*.test.js`.

## Trazabilidad

| Requisito u origen | Pasos |
|---|---|
| FR6 Guardado y datos de ejemplo (parte de la base) | 1, 7, 9 |
| FR6.1 Todo se conserva al cerrar y abrir | 3, 4, 5, 10 |
| NFR1 Guardado completo o nulo | 3, 4 |
| NFR5 Pruebas | 2, 4, 6, 8, 10 |
| R-01 Raíz de composición (Units Generation) | 7, 9 |
| R-02 Contrato de deshacer (Units Generation) | 3, 4 |
| R-03 Origen y adjuntos seguros (Domain Design) | 5, 6, 7, 8 |

## Fuera de esta unidad

Las reglas de productos y pasos, la definición del proceso, las pantallas reales y los datos de ejemplo son de U2, U3 y U4.

## Testing Contract

```json
{
  "version": 1,
  "methodology": "test-after",
  "source": "org",
  "ordering": "implement each applicable testable layer, then write and run that layer's tests.",
  "scope": "express",
  "test_strategy": "standard",
  "project_type": "greenfield",
  "applicable_notes": [
    {
      "layer": "org",
      "text": "We treat tests as a first-class deliverable in every Bolt. The specific\nmethodology (TDD, BDD, ATDD, or classic test-after) is affirmed at\npractices-discovery and recorded in `team.md` under this heading with explicit\n`Methodology` and `Ordering` fields; Code Generation resolves those fields\nindependently from coverage, tooling, and scope notes.\n\nWhen no posture has been affirmed, our default per scope is:\n- **Methodology**: test-after\n- **Ordering**: implement each applicable testable layer, then write and run\n  that layer's tests.\n- `mvp`, `enterprise`, `feature`, `infra`, `classic` add an 80% line-coverage\n  floor and CI execution before merge.\n- `bugfix`, `security-patch` add a targeted regression for the specific\n  bug/vulnerability and require the existing suite to remain green.\n- `express` uses the Minimal strategy: requirement-driven unit tests (one per\n  requirement, with a happy-path floor per component); existing tests remain\n  green.\n- `poc`, `refactor`, `workshop` add no extra new-test floor and require the\n  existing suite to remain green.\n\nThe active `Test Strategy` still applies in every scope and determines test\nvolume/types. Scope floors are additive; they never reduce or replace the\nselected strategy.\n\nBuild and Test verifies defined coverage floors and affirmed quality targets;\nthey may not be weakened to make a step pass.\n\nAffirm a stricter posture in `team.md` if the team commits to one."
    }
  ],
  "obligations": {
    "strategy": "standard",
    "strategy_volume": [
      "Five to eight tests per component.",
      "Unit tests plus integration tests for key boundaries.",
      "Add E2E, performance, or security tests when requirements demand them."
    ],
    "scope_floor": [
      "Keep the existing test suite green.",
      "This scope adds no extra new-test floor beyond the selected test strategy."
    ],
    "combination_rule": "Apply every selected-strategy obligation and every scope-floor obligation; neither replaces the other, and a targeted scope regression may add the narrowest necessary test type beyond the strategy default."
  },
  "plan_profile": {
    "methodology": "test-after",
    "runner_step": "Bootstrap the minimal test runner/configuration and record the exact unit-scoped command.",
    "runner_ready_before_first_test": true,
    "testable_layers": [
      "Data model / database behavior",
      "Repository / data access",
      "Business logic",
      "API / endpoint",
      "Frontend behavior"
    ],
    "steps": [
      "Project structure and production configuration skeleton.",
      "Bootstrap the minimal test runner/configuration and record the exact unit-scoped command.",
      "Data model / database behavior - implement.",
      "Data model / database behavior - write and run its tests after implementation.",
      "Repository / data access - implement.",
      "Repository / data access - write and run its tests after implementation.",
      "Business logic - implement.",
      "Business logic - write and run its tests after implementation.",
      "API / endpoint - implement.",
      "API / endpoint - write and run its tests after implementation.",
      "Frontend behavior - implement.",
      "Frontend behavior - write and run its tests after implementation.",
      "Environment/build configuration.",
      "Documentation and traceability."
    ]
  },
  "input_sha256": "sha256:7eda6dbebc7eba01e8858d8911833c06e2bca18cdf76aeaf6f15de08f0d63baa",
  "contract_sha256": "sha256:aee7bb02f8205912a3ecda3439fd589eea1b0cfac342d3618186cb636cbed02a"
}
```

Capas del contrato que no aplican a esta unidad: **modelo de datos** (U1 no tiene entidades de negocio; las de productos y pasos son de U3 y U4) y **comportamiento de pantallas** (la página de U1 es estática y sin JavaScript; las pantallas con comportamiento llegan con U3 y U4).
