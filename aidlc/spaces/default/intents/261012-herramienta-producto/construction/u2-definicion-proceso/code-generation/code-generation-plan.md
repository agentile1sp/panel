# Plan de código: U2 · Definición del proceso (`u2-definicion-proceso`)

## Summary

- Builds: el archivo de definición con los 10 pasos y los 2 registros transversales, y el código que lo lee, lo valida al arrancar y resuelve los orígenes de cada paso
- Touches: `herramienta/proceso/definicion-proceso.json`, `herramienta/src/definicion/`, `herramienta/src/main.js`, `herramienta/src/base/config.js`, `herramienta/docs/formato-datos.md` y `herramienta/tests/u2-definicion-proceso/`
- Tests: unas 18 pruebas con `node --test` (validación del archivo, consultas de pasos y orígenes, y el arranque con una definición inválida)

## Contexto

Unidad U2 de `inception/units-generation/unit-of-work.md` (Bolt B2 de `inception/delivery-planning/bolt-plan.md`). Cubre FR5, FR5.1 y FR5.2, y da soporte a FR3.3 (habilitación) y FR4.1 (campos de cada plantilla). Sigue ADR-003 (la definición es un archivo de datos legible en el proyecto, escrito a mano desde las plantillas) y ADR-004 (orígenes directos e indirectos). Usa la tecnología fijada en U1: Node.js 20 o superior, JavaScript con módulos ES, sin dependencias, pruebas con `node --test`.

## Decisiones

- **Formato JSON.** La definición es `herramienta/proceso/definicion-proceso.json`, en UTF-8 y con sangría. JSON se lee sin dependencias; YAML necesitaría un intérprete externo. Vive en el proyecto, no en la carpeta de datos, y U2 lo lee directamente, sin pasar por el almacén de U1 (`unit-of-work.md`).
- **Forma del archivo.**
  - `version: 1`.
  - `pasos`: cada uno con `id`, `orden`, `nombre`, `tipo` (`texto`, `estructurado` o `visual`), `origenes` (ids de pasos) y `plantilla` (nombre de archivo en `docs/proceso-producto/plantillas/`).
  - Campos de cada paso:
    - `campos`: campos de una sola vez, cada uno con `id`, `nombre`, `tipo` (`texto`, `texto-largo` o `lista`) y `ayuda` opcional.
    - En los pasos estructurados, `elementos`: tipos de elemento que se repiten, cada uno con `id`, `nombre`, `plantilla` y sus `campos`. Por ejemplo, el paso 5 tiene `ficha-capacidad` y `ficha-instancia`, y el paso 7 tiene actividades e historias más una fila por tabla CRUD, de estados y de navegación (hallazgo R-05 de Domain Design).
    - En los pasos visuales, `checklist` (`id`, `texto`) y `evidencia: "enlace-o-adjunto"`.
  - `registros`: `acuerdos` y `gaps-y-supuestos`, con `id`, `nombre`, `plantilla` y `campos`.
- **Ids estables.** Pasos: `hipotesis`, `linea-base`, `walking-skeleton`, `mapa-de-piezas`, `fichas`, `user-flow`, `story-map`, `wireframes`, `cierre-del-alcance` y `mockups`. Registros: `acuerdos` y `gaps-y-supuestos`. U3 guarda el contenido por estos ids.
- **Validación al arrancar.** `src/main.js` carga la definición antes de crear el servidor. Si el archivo falta o no es válido, la aplicación no arranca y el mensaje nombra el archivo y el problema. Así se completa el punto de montaje que dejó U1 para B2 (hallazgo R-01).
- **Solo lectura (FR5.2).** El objeto devuelto está congelado en profundidad y no ofrece ninguna operación de cambio. U2 no registra rutas: la ruta que sirve la definición a las pantallas es de U3.
- **Ubicación configurable para las pruebas.** `config.js` añade `rutaDefinicion` (variable `HERRAMIENTA_DEFINICION`) y `carpetaPlantillas`. Por defecto valen `herramienta/proceso/definicion-proceso.json` y `docs/proceso-producto/plantillas/`.

## Pasos

### Paso 1. Estructura y configuración
- [x] Añadir a `src/base/config.js` `rutaDefinicion` (variable `HERRAMIENTA_DEFINICION`) y `carpetaPlantillas`, sin cambiar lo existente.
- [x] Añadir `ErrorDefinicion` (código, mensaje en español con el archivo y el problema, causa) a `src/base/errores.js`.
- Traza: FR5.1.

### Paso 2. Ejecutor de pruebas listo
- [x] Crear `tests/u2-definicion-proceso/` con una prueba de humo y comprobar `node --test tests/u2-definicion-proceso/*.test.js` desde `herramienta/`.
- [x] Añadir `tests/ayudas/definicion-temporal.js`, que escribe una copia modificada de la definición en una carpeta temporal para las pruebas de errores.
- Traza: NFR5.

### Paso 3. Archivo de definición (modelo de datos): escribir
- [x] Escribir `herramienta/proceso/definicion-proceso.json` a mano, leyendo cada plantilla de `docs/proceso-producto/plantillas/`. Debe tener los 10 pasos con el orden, tipo y orígenes de la tabla de `requirements.md`:
  - 1 Hipótesis (texto), sin orígenes.
  - 2 Línea base (texto), de 1.
  - 3 Walking skeleton (texto), de 1 y 2.
  - 4 Mapa de piezas (estructurado), de 3.
  - 5 Fichas (estructurado), de 3 y 4.
  - 6 User flow (visual), de 5.
  - 7 Story map (estructurado), de 4, 5 y 6.
  - 8 Wireframes (visual), de 6 y 7.
  - 9 Cierre del alcance (estructurado), de 1 a 8.
  - 10 Mockups (visual), de 8 y 9.

  Más los 2 registros transversales. Cada encabezado de plantilla que pide datos se convierte en un campo; las secciones que se repiten (piezas, fichas, filas de tabla, historias, entradas de registro) se convierten en tipos de elemento.
- Traza: FR5, FR5.1, FR4.1, AC5.1.

### Paso 4. Archivo de definición: escribir y ejecutar sus pruebas
- [x] El archivo real carga y tiene 10 pasos con orden del 1 al 10 y los 2 registros (AC5.1).
- [x] Orden, tipo y orígenes de cada paso coinciden con la tabla de `requirements.md` (prueba con la tabla escrita en la propia prueba).
- [x] El paso 5 tiene los tipos `ficha-capacidad` y `ficha-instancia`, y el paso 7 tiene historias y las tres tablas (CRUD, estados y navegación).
- [x] Los pasos visuales tienen checklist y evidencia de enlace o adjunto; los de texto tienen al menos un campo.
- [x] Ejecutar `node --test tests/u2-definicion-proceso/archivo.test.js`.

### Paso 5. Lectura y validación (lógica de negocio): implementar
- [x] `src/definicion/cargar.js`: `cargarDefinicion({ rutaDefinicion, carpetaPlantillas })` lee el archivo y lanza `ErrorDefinicion` si no existe o si el JSON está dañado.
- [x] `src/definicion/validar.js`: comprueba versión; 10 pasos con orden único del 1 al 10; ids únicos en pasos, registros, elementos, campos y checklist; nombre no vacío; tipo válido; orígenes que existen y son anteriores; plantilla existente en `carpetaPlantillas`; campos con tipo válido; estructurados con al menos un tipo de elemento; visuales con checklist y evidencia; exactamente los 2 registros. Junta todos los problemas y lanza un único `ErrorDefinicion` que los nombra.
- Traza: FR5.1, ADR-003.

### Paso 6. Lectura y validación: escribir y ejecutar sus pruebas
- [x] Un archivo que no existe impide cargar y el error nombra la ruta.
- [x] Un JSON dañado impide cargar y el error nombra el archivo.
- [x] Un paso que falta o un orden repetido se rechaza nombrando el problema.
- [x] Un origen inexistente, o posterior al propio paso, se rechaza nombrando el paso y el origen.
- [x] Una plantilla que no existe se rechaza nombrando el archivo.
- [x] Un tipo de paso o de campo no válido, y un paso estructurado sin tipos de elemento, se rechazan.
- [x] Varios problemas a la vez aparecen todos en el mismo error.
- [x] Ejecutar `node --test tests/u2-definicion-proceso/validar.test.js`.

### Paso 7. Consultas de la definición (lógica de negocio): implementar
- [x] `src/definicion/definicion.js`: `crearDefinicion(datos)` devuelve un objeto congelado en profundidad con `pasos()` (en orden), `paso(id)`, `registros()`, `registro(id)`, `origenesDirectos(id)` y `origenesTodos(id)` (directos e indirectos, sin repetidos y en orden, según ADR-004). Un id desconocido lanza `ErrorDefinicion`.
- [x] `src/definicion/index.js` exporta `cargarDefinicion` y el tipo de la definición para U3.
- Traza: FR5, FR3.3 (soporte), FR4.1 (soporte), FR5.2.

### Paso 8. Consultas: escribir y ejecutar sus pruebas
- [x] `pasos()` devuelve los 10 pasos en orden y `paso("story-map")` devuelve el paso 7.
- [x] `origenesDirectos("story-map")` es mapa de piezas, fichas y user flow; `origenesTodos("story-map")` son los pasos 1 a 6.
- [x] `origenesTodos("hipotesis")` está vacío y `origenesTodos("mockups")` son los pasos 1 a 9.
- [x] Un id desconocido lanza `ErrorDefinicion`.
- [x] La definición no se puede modificar: intentar cambiar un paso o añadir uno lanza un error en modo estricto y no hay ninguna función de cambio (FR5.2, AC5.2 en código).
- [x] Ejecutar `node --test tests/u2-definicion-proceso/consultas.test.js`.

### Paso 9. Arranque con la definición (punto de montaje de U1): implementar
- [x] En `src/main.js`, cargar la definición antes de crear el servidor y devolverla entre las piezas de `arrancar()`. Si falla, `arrancar()` lanza el error y la ejecución directa termina con código 1 y el mensaje que nombra el archivo y el problema.
- Traza: FR5.1, R-01.

### Paso 10. Arranque con la definición: escribir y ejecutar sus pruebas
- [x] Con la definición real, `arrancar()` funciona y devuelve la definición con 10 pasos.
- [x] Con una definición inválida (`HERRAMIENTA_DEFINICION` apuntando a una copia estropeada), `arrancar()` falla con el error que nombra el problema y no deja el servidor escuchando.
- [x] Las pruebas de U1 siguen pasando: ejecutar `node --test tests/u1-base/*.test.js`.
- [x] Ejecutar `node --test tests/u2-definicion-proceso/arranque.test.js`.

### Paso 11. Documentación y trazabilidad
- [x] Completar en `herramienta/docs/formato-datos.md` la sección de U2: dónde vive la definición, su forma, los ids estables y que se edita a mano y solo se lee.
- [x] Añadir al `herramienta/README.md` una línea sobre la definición y la variable `HERRAMIENTA_DEFINICION`.
- [x] Ejecutar todas las pruebas de la unidad con `node --test tests/u2-definicion-proceso/*.test.js`.

## Trazabilidad

| Requisito u origen | Pasos |
|---|---|
| FR5 Definición del proceso | 3, 4, 7, 8 |
| FR5.1 Definición separada del código | 1, 3, 5, 6, 9, 10 |
| FR5.2 Sin opción para cambiarla | 7, 8 |
| FR3.3 Habilitación (soporte: orígenes indirectos) | 7, 8 |
| FR4.1 Campos de cada plantilla (soporte) | 3, 4 |
| NFR5 Pruebas | 2, 4, 6, 8, 10 |
| R-01 Validación al arrancar en la raíz de composición | 9, 10 |
| R-05 de Domain Design: varios tipos de elemento por paso | 3, 4 |

## Fuera de esta unidad

Estados, contenido y habilitación de los pasos de cada producto, la ruta que entrega la definición a las pantallas y las pantallas mismas son de U3. El catálogo es de U4.

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

Capas del contrato que no aplican a esta unidad: **acceso a datos** (U2 lee su archivo del proyecto directamente y no guarda nada en la carpeta de datos), **API** (U2 no registra rutas; la que sirve la definición es de U3) y **comportamiento de pantallas** (U2 no tiene pantallas). El modelo de datos de esta unidad es el propio archivo de definición (Pasos 3 y 4).
