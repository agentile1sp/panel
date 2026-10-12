# Plan de código: U3 · Recorrido (`u3-recorrido`)

## Summary

- Builds: el recorrido de cada producto por los 10 pasos (estados, habilitación en cadena, paso actual, contenido de los pasos, adjuntos y registros) con su API local y las pantallas de recorrido, de paso y de registros
- Touches: `herramienta/src/recorrido/`, `herramienta/src/main.js`, `herramienta/public/` (recorrido, paso y registros, con su JS y CSS), `herramienta/docs/formato-datos.md`, `herramienta/README.md` y `herramienta/tests/u3-recorrido/`
- Tests: unas 40 pruebas con `node --test` (modelo, reglas, servicio, rutas, lógica de pantallas e integración de un recorrido completo)

## Contexto

Unidad U3 de `inception/units-generation/unit-of-work.md` (Bolt B3 de `inception/delivery-planning/bolt-plan.md`). Cubre FR1.2 (cálculo del paso actual), FR2, FR3, FR4, NFR2 y NFR4. Sigue ADR-002 (registros de cada producto), ADR-004 (habilitación en cadena), ADR-007 (paso actual) y DL-09 (nada se copia ni se calcula entre pasos). Usa lo que dejaron U1 (almacén, adjuntos, registro de rutas en `main.js`, CSP estricta) y U2 (`aplicacion.definicion` con sus ids estables). Tecnología: Node.js 20 o superior, JavaScript con módulos ES, sin dependencias; pantallas en HTML, CSS y JavaScript del navegador sin framework.

## Decisiones

- **Un archivo por recorrido.** `datos/recorridos/<idProducto>/recorrido.json` guarda los pasos y los registros del producto. Los adjuntos van en `datos/recorridos/<idProducto>/adjuntos/`. Cada cambio reescribe el archivo completo con el guardado completo o nulo de U1 (NFR1). Con una sola persona usuaria no hace falta repartirlo en más archivos.
- **Forma del recorrido.**
  - `{ idProducto, pasos: { <idPaso>: { estado, contenido, actualizadoEn } }, registros: { <idRegistro>: { <tipoElemento>: [entradas] } } }`.
  - `contenido` lleva `campos` (por id de campo), `elementos` (por tipo, cada uno una lista de `{ id, campos }`), `checklist` (por id, verdadero o falso) y `evidencia` (`{ tipo: "enlace", url }` o `{ tipo: "adjunto", idAdjunto, nombre }`).
  - Las entradas de registro son `{ id, campos, creadaEn, actualizadaEn }`, agrupadas por el tipo de elemento de U2 (`acuerdo`; `gap` y `supuesto`).
- **Reglas en módulos puros.** La habilitación en cadena, el bloqueo de dependientes, el paso actual y la validación del contenido contra la definición son funciones sin E/S, fáciles de probar:
  - Un paso está habilitado si todos sus orígenes de `origenesTodos(id)` están en Completo. El paso 1 y los registros siempre lo están.
  - El paso actual es el primero no Completo en orden, o "Completo".
  - Solo se aceptan los campos, tipos de elemento y casillas que la definición declara.
  - Los enlaces solo pueden ser `http` o `https` (hallazgo R-03 de Domain Design).
  - Ningún campo se rellena ni se copia desde otro paso (FR4.6).
- **Servicio para U4.** `crearServicioRecorrido({ almacen, adjuntos, definicion })` ofrece, además de lo que usan las rutas, las operaciones que necesita el catálogo:
  - `crear(idProducto)`, que devuelve lo necesario para deshacer;
  - `sembrar(idProducto, datos)`, para los productos de ejemplo, respetando la habilitación en cadena;
  - `borrar(idProducto)`, que aparta el recorrido con sus adjuntos y devuelve la marca;
  - `deshacerCreacion`, `recuperarBorrado` y `confirmarBorrado`;
  - `pasoActual(idProducto)`.

  Se apoya en los contratos de deshacer de U1 (hallazgo R-02).
- **API local** (registrada en `main.js`, cuerpos JSON con `Content-Type: application/json`):
  - `GET /api/proceso`: la definición, para que las pantallas construyan los formularios.
  - `GET /api/recorridos/:id`: el recorrido con el estado, la habilitación y los pasos que faltan de cada paso, y el paso actual.
  - `PUT /api/recorridos/:id/pasos/:paso/contenido` y `PUT /api/recorridos/:id/pasos/:paso/estado`.
  - `POST /api/recorridos/:id/pasos/:paso/adjunto?nombre=...` (binario) y `GET` del mismo camino para descargarlo.
  - `POST`, `PUT` y `DELETE` en `/api/recorridos/:id/registros/:registro/:tipo[/:entrada]`.

  Un paso no habilitado responde 409 con los pasos que faltan; un recorrido inexistente, 404; un contenido que no encaja con la definición, 400.
- **Nombre del producto sin depender de U4.** Las rutas reciben un proveedor opcional `nombreDe(idProducto)` desde `main.js`; por defecto devuelve `null`. U4 lo conectará al catálogo. Así U3 no depende de U4 y el grafo sigue sin ciclos.
- **Pantallas sin JavaScript en línea.** `public/recorrido.html?producto=<id>`, `public/paso.html?producto=<id>&paso=<id>` y `public/registros.html?producto=<id>&registro=<id>` cargan `public/js/*.js` y `public/css/estilos.css` como archivos (CSP de U1). El formulario de cada paso se construye a partir de la definición:
  - campos de texto, texto largo y lista;
  - elementos que se añaden, editan y quitan;
  - casillas de la checklist;
  - enlace o adjunto.

  El estado se muestra siempre con texto ("Pendiente", "En curso", "Completo"), no solo con color, y todo se hace con controles nativos accesibles con el teclado y con etiquetas (NFR4). Toda la interfaz está en español (NFR2). Los elementos interactivos llevan `data-testid`. La lógica de pantalla que no toca el DOM va en módulos puros (`public/js/logica-*.js`) que se prueban con `node --test`.

## Pasos

### Paso 1. Estructura
- [x] Crear `src/recorrido/` (`modelo.js`, `reglas.js`, `servicio.js`, `rutas.js`, `index.js`) y añadir `ErrorRecorrido` (código, mensaje en español, estado HTTP sugerido) a `src/base/errores.js` sin cambiar lo existente.
- Traza: FR2, FR3, FR4.

### Paso 2. Ejecutor de pruebas listo
- [x] Crear `tests/u3-recorrido/` con una prueba de humo y comprobar `node --test tests/u3-recorrido/*.test.js` desde `herramienta/`.
- [x] Añadir `tests/ayudas/recorrido.js`, que arranca la aplicación con una carpeta temporal y crea recorridos de prueba con el servicio.
- Traza: NFR5.

### Paso 3. Modelo del recorrido (modelo de datos): implementar
- [x] `modelo.js`: `crearRecorridoVacio(idProducto, definicion)` con los 10 pasos en Pendiente, contenido vacío y los registros vacíos (FR2.2).
- [x] `validarContenido(definicionPaso, contenido)` y `validarEntrada(definicionRegistro, tipo, campos)`: aceptan solo los campos, tipos de elemento y casillas declarados, con su tipo (`texto` y `texto-largo` son texto, `lista` es una lista de textos), y enlaces `http` o `https`. Devuelven todos los problemas juntos.
- Traza: FR2.2, FR4.1 a FR4.5, R-03 de Domain Design.

### Paso 4. Modelo del recorrido: escribir y ejecutar sus pruebas
- [x] Un recorrido nuevo tiene los 10 pasos en orden y en Pendiente, y los registros vacíos (AC2.1).
- [x] Un contenido con los campos de la plantilla del paso se acepta, y uno con un campo desconocido se rechaza nombrándolo.
- [x] Un paso estructurado acepta varios elementos de cada tipo declarado (dos fichas de capacidad y una de instancia, AC4.1) y rechaza un tipo desconocido.
- [x] Un paso visual acepta su checklist y un enlace `https`, y rechaza un enlace `javascript:` o `file:` (AC4.3).
- [x] Un texto con comillas, saltos de línea y caracteres especiales pasa sin cambios (AC4.4).
- [x] Una entrada de registro con un tipo de elemento desconocido se rechaza.
- [x] Ejecutar `node --test tests/u3-recorrido/modelo.test.js`.

### Paso 5. Reglas del recorrido (lógica de negocio): implementar
- [x] `reglas.js`:
  - `estadoDePasos(recorrido, definicion)`: para cada paso, su estado, si está habilitado y qué pasos faltan, con habilitación en cadena por `origenesTodos` (FR3.3, ADR-004).
  - `pasoActual(recorrido, definicion)` (FR1.2, ADR-007).
  - `cambiarEstado(recorrido, idPaso, estado, definicion)`: solo los tres estados (FR3.1) y solo en un paso habilitado (FR3.2, FR3.4). Al devolver un origen a otro estado, los dependientes conservan contenido y estado (FR3.5).
  - `guardarContenido(recorrido, idPaso, contenido, definicion)`: solo en un paso habilitado y sin tocar el estado (FR4.7).
  - Todas devuelven un recorrido nuevo, sin modificar el anterior.
- Traza: FR1.2, FR3.1 a FR3.5, FR4.6, FR4.7.

### Paso 6. Reglas: escribir y ejecutar sus pruebas
- [x] Con los pasos 1 a 3 en Completo y el 4 en En curso, el paso actual es "Mapa de piezas" (AC1.2); con los 10 en Completo es "Completo".
- [x] Con el paso 3 en En curso, el paso 4 no se puede editar y faltan "Walking skeleton" (AC3.1).
- [x] Con los pasos 1 a 3 en Completo, el paso 4 se puede editar y cambiar de estado (AC3.2).
- [x] Al devolver el paso 5 a En curso, el paso 6 conserva contenido y estado y deja de poder editarse (AC3.3); el bloqueo llega también al paso 7, que depende del 5 de forma indirecta (ADR-004).
- [x] Un estado desconocido se rechaza.
- [x] Guardar contenido no cambia el estado del paso (FR4.7).
- [x] Guardar el contenido de un paso no cambia ningún otro paso (FR4.6).
- [x] Ejecutar `node --test tests/u3-recorrido/reglas.test.js`.

### Paso 7. Servicio del recorrido (acceso a datos): implementar
- [x] `servicio.js` con `crearServicioRecorrido({ almacen, adjuntos, definicion })`:
  - `obtener`, `guardarContenido`, `cambiarEstado` y `pasoActual`.
  - `subirAdjunto(idProducto, idPaso, nombre, contenido)`, solo para pasos visuales habilitados; guarda el adjunto con U1 y deja la evidencia en el paso. `leerAdjunto(idProducto, idPaso)`.
  - Registros: `anadirEntrada`, `editarEntrada` y `quitarEntrada`, siempre habilitados (FR2.4, FR4.5, AC3.4).
  - Para U4: `crear`, `sembrar`, `borrar` (aparta el recorrido con sus adjuntos y devuelve la marca), `deshacerCreacion`, `recuperarBorrado`, `confirmarBorrado` y `existe`.
  - Todo pasa por el almacén y los adjuntos de U1. Los errores del almacén se propagan, nunca se pierden en silencio.
- Traza: FR2, FR3, FR4, FR6.1 (a través de U1), R-02.

### Paso 8. Servicio: escribir y ejecutar sus pruebas
- [x] Crear un recorrido, guardar el contenido del paso 2 y volver a leerlo desde un servicio nuevo sobre la misma carpeta devuelve lo mismo (AC6.1 para el recorrido).
- [x] Guardar contenido en un paso no habilitado lanza `ErrorRecorrido` y no cambia el archivo.
- [x] Subir un adjunto a un paso visual habilitado lo guarda y deja la evidencia; leerlo devuelve el mismo contenido y el nombre.
- [x] Añadir, editar y quitar una entrada de acuerdos funciona en un recorrido recién creado (AC3.4).
- [x] `crear` y luego `deshacerCreacion` dejan todo como estaba.
- [x] `borrar` aparta el recorrido y sus adjuntos; `recuperarBorrado` los devuelve y `confirmarBorrado` los elimina.
- [x] `sembrar` con datos que se saltan la habilitación en cadena (un paso Completo con un origen sin completar) se rechaza.
- [x] Ejecutar `node --test tests/u3-recorrido/servicio.test.js`.

### Paso 9. API del recorrido: implementar
- [x] `rutas.js` con `registrarRutasRecorrido(rutas, { servicio, definicion, nombreDe })`: las rutas de la sección Decisiones, con 404, 409 (con los pasos que faltan) y 400 (con los problemas de validación) en JSON y mensajes en español.
- [x] En `src/main.js`, crear el servicio del recorrido, registrar sus rutas con `nombreDe` por defecto y devolver `recorridos` entre las piezas de `arrancar()` para que U4 lo use.
- Traza: FR2, FR3, FR4, R-01.

### Paso 10. API: escribir y ejecutar sus pruebas
- [x] `GET /api/proceso` devuelve los 10 pasos y los 2 registros.
- [x] `GET /api/recorridos/:id` devuelve los pasos con estado, habilitación y los que faltan, y el paso actual; un id inexistente da 404.
- [x] `PUT .../contenido` en un paso habilitado guarda; en uno no habilitado da 409 con los pasos que faltan.
- [x] `PUT .../estado` con un estado no válido da 400.
- [x] `POST .../adjunto` con un archivo binario lo guarda y `GET .../adjunto` lo devuelve como descarga.
- [x] Las rutas de registros añaden, editan y quitan entradas.
- [x] Un cambio con `Origin` ajeno sigue respondiendo 403 (la protección de U1 cubre también las rutas de U3).
- [x] Ejecutar `node --test tests/u3-recorrido/rutas.test.js`.

### Paso 11. Pantallas (comportamiento de pantallas): implementar
- [x] `public/css/estilos.css`: estilos sencillos y legibles, con el foco del teclado visible.
- [x] `public/js/api.js`: llamadas a la API con `Content-Type: application/json`, mostrando el mensaje de error en español si una petición falla.
- [x] `public/js/logica-recorrido.js` y `public/js/logica-paso.js` (módulos puros, sin DOM): texto del estado, texto de "Falta completar ...", qué controles corresponden a cada campo según su tipo, conversión entre el formulario y el contenido, y comprobación de enlaces `http` o `https` antes de enviar.
- [x] `public/recorrido.html` y `public/js/recorrido.js`: los 10 pasos en orden con su nombre, su estado en texto y, si no está habilitado, de qué pasos depende; un enlace a cada paso y a los dos registros; un enlace para volver al catálogo (`/`). Si hay nombre de producto, se muestra (FR2.1, FR2.3, FR2.4, FR2.5, NFR3).
- [x] `public/paso.html` y `public/js/paso.js`: el formulario construido desde la definición, el botón Guardar (que guarda sin marcar Completo), el selector de estado, la checklist, el enlace o el adjunto, y añadir, editar y quitar elementos. En un paso no habilitado, todo es de solo lectura y se indica qué falta completar (FR3.4, FR4.1 a FR4.4, FR4.7).
- [x] `public/registros.html` y `public/js/registros.js`: las entradas de cada tipo de elemento del registro, con añadir, editar y quitar (FR4.5).
- [x] Todos los controles son nativos (`button`, `input`, `select`, `textarea`) con etiquetas, y los elementos interactivos llevan `data-testid` (NFR4).
- Traza: FR2, FR3.4, FR4, NFR2, NFR3, NFR4.

### Paso 12. Pantallas: escribir y ejecutar sus pruebas
- [x] El texto de cada estado es "Pendiente", "En curso" o "Completo", y un paso bloqueado produce el texto "Falta completar: Walking skeleton".
- [x] Cada tipo de campo produce el control correcto (texto, texto largo, lista) y la conversión del formulario al contenido y de vuelta conserva los datos, incluidos los caracteres especiales.
- [x] La comprobación de enlaces acepta `https://...` y rechaza `javascript:...`.
- [x] Las tres pantallas se sirven, están en español (`lang="es"`), cargan su JavaScript y su CSS desde archivos y no tienen `<script>` en línea.
- [x] Cada control de formulario de las tres pantallas tiene una etiqueta asociada (comprobación sobre el HTML servido).
- [x] Ejecutar `node --test tests/u3-recorrido/pantallas.test.js`.

### Paso 13. Integración: un recorrido completo
- [x] Prueba de integración contra la API: crear un recorrido, llevarlo por los 10 pasos guardando contenido y marcando cada uno Completo, y comprobar que al final el paso actual es "Completo" y que cada paso conserva su contenido (AC2.2 y AC2.3, criterio de éxito E1 y E4 a nivel de recorrido).
- [x] Prueba de integración: al reiniciar la aplicación sobre la misma carpeta, el recorrido y su adjunto siguen ahí (AC6.1).
- [x] Las pruebas de U1 y U2 siguen pasando: ejecutar `node --test tests/u1-base/*.test.js tests/u2-definicion-proceso/*.test.js`.
- [x] Ejecutar `node --test tests/u3-recorrido/integracion.test.js`.

### Paso 14. Documentación y trazabilidad
- [x] Completar en `herramienta/docs/formato-datos.md` la sección de U3: dónde viven los recorridos y los adjuntos, la forma de `recorrido.json` y de las entradas de registro.
- [x] Añadir al `herramienta/README.md` las pantallas de U3, su comando de pruebas y las operaciones del servicio que usa U4 (incluido el proveedor `nombreDe`).
- [x] Ejecutar todas las pruebas de la unidad con `node --test tests/u3-recorrido/*.test.js` y la comprobación completa con `npm test`.

## Trazabilidad

| Requisito u origen | Pasos |
|---|---|
| FR1.2 Paso actual (cálculo) | 5, 6, 13 |
| FR2 a FR2.5 Recorrido de un producto | 3, 4, 9, 10, 11, 13 |
| FR3 a FR3.5 Estados y orden de los pasos | 5, 6, 8, 10, 11 |
| FR4 a FR4.7 Contenido de cada paso | 3, 4, 5, 6, 7, 8, 10, 11, 12 |
| NFR2 Idioma | 11, 12 |
| NFR4 Accesibilidad básica | 11, 12 |
| NFR5 Pruebas | 2, 4, 6, 8, 10, 12, 13 |
| ADR-002, ADR-004, ADR-007, DL-09 | 3, 5, 6, 7 |
| R-02 Deshacer para U4 | 7, 8 |
| R-03 de Domain Design: solo enlaces http o https | 3, 4, 11, 12 |

## Fuera de esta unidad

Crear, renombrar y borrar productos, el catálogo, el nombre de cada producto, las operaciones compuestas con su deshacer y los datos de ejemplo de la primera apertura son de U4. U3 deja listo el servicio y el proveedor `nombreDe` que U4 conectará.

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

Orden de capas adaptado: las reglas (lógica de negocio, Pasos 5 y 6) van antes que el servicio (acceso a datos, Pasos 7 y 8) porque el servicio aplica las reglas antes de guardar; cada capa se implementa y luego se prueba, como pide el contrato. No hay configuración de entorno nueva: U3 no añade variables.
