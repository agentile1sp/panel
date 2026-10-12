## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-10-12T14:03:36Z
**Iteration:** 1

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Minor | herramienta/src/catalogo/ejemplos.js > sembrarYGuardar | El deshacer solo cubre fallos que lanzan error. Si el proceso se corta (cierre brusco) después de sembrar los recorridos y antes de guardar productos.json, quedan recorridos huérfanos en la carpeta de datos. Como todavía no hay marca ni catálogo, el siguiente arranque vuelve a sembrar con ids nuevos y los huérfanos se quedan sin que nadie los avise. Mismo caso en crear, entre recorridos.crear y el guardado. | Documentar en docs/formato-datos.md o en el README que un corte en mitad de la carga o de crear puede dejar carpetas sin producto en recorridos/ y que se pueden borrar a mano. Opcional: avisar al arrancar de recorridos sin producto en el catálogo. | New |
| R-02 | Minor | herramienta/src/main.js > cargarEjemplos | Si la carga de ejemplos falla, la herramienta arranca igualmente y solo lo dice en la consola. El catálogo sale vacío en la pantalla sin explicación, y el mensaje de catálogo vacío invita a crear, como si fuera una instalación sin datos. Es coherente con ADR-006 y con el deshacer completo, y queda documentado en el comentario del archivo. | Valorar un aviso visible en la pantalla o dejar explícito en el README que, si el catálogo aparece vacío en la primera apertura, hay que mirar la consola. | New |

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| `node --test tests/u4-catalogo/*.test.js` (desde herramienta/) | PASS: 31 pruebas, 0 fallos | Cubre nombre, servicio con fallos a medias, ejemplos, rutas, pantalla e integración; superan el contenido del plan (33 aproximadas) en lo esencial. |
| `npm test` (desde herramienta/) | PASS: 110 pruebas, 0 fallos | Las pruebas de U1, U2 y U3 siguen en verde con U4 integrada. |

Comprobaciones contra los contratos, sin hallazgos:

- Lo que U4 llama en U3 (`crear`, `deshacerCreacion`, `sembrar`, `borrar`, `recuperarBorrado`, `confirmarBorrado`, `existe`, `pasoActual`) existe en `src/recorrido/servicio.js`. Lo que U4 usa de U1 (`guardar` devuelve el contenido anterior, `restaurar`, `existe`) existe en `almacen.js`.
- Q4 y R-01: crear, borrar y cargar ejemplos deshacen la primera escritura si falla la segunda, y si el deshacer falla se registran los dos errores y se devuelve el original (R-02).
- ADR-006: la marca se escribe al final de la carga, y los casos "ya abierta" y "datos previos" no cargan nada. El catálogo no guarda el paso actual, que se pide a U3.
- La pantalla usa `textContent` (no hay `innerHTML`), `<dialog>` en lugar de `window.confirm` y ningún script en línea. El `source-manifest.json` solo reclama rutas de la unidad.

### Summary

La implementación de U4 coincide con el plan y con los contratos de U1 y U3, las operaciones compuestas deshacen bien y las 110 pruebas pasan. Solo quedan dos observaciones menores (cortes bruscos y fallo visible de la carga de ejemplos), que no impiden construir sobre esta unidad.
