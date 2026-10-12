## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-10-12T14:17:12Z
**Iteration:** 2

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Minor | herramienta/src/catalogo/ejemplos.js > sembrarYGuardar | El deshacer solo cubre fallos que lanzan error. Si el proceso se corta (cierre brusco) después de sembrar los recorridos y antes de guardar productos.json, quedan recorridos huérfanos en la carpeta de datos. Como todavía no hay marca ni catálogo, el siguiente arranque vuelve a sembrar con ids nuevos y los huérfanos se quedan sin que nadie los avise. Mismo caso en crear, entre recorridos.crear y el guardado. | Documentar en docs/formato-datos.md o en el README que un corte en mitad de la carga o de crear puede dejar carpetas sin producto en recorridos/ y que se pueden borrar a mano. Opcional: avisar al arrancar de recorridos sin producto en el catálogo. | Unresolved |
| R-02 | Minor | herramienta/src/main.js > cargarEjemplos | Si la carga de ejemplos falla, la herramienta arranca igualmente y solo lo dice en la consola. El catálogo sale vacío en la pantalla sin explicación, y el mensaje de catálogo vacío invita a crear, como si fuera una instalación sin datos. Es coherente con ADR-006 y con el deshacer completo, y queda documentado en el comentario del archivo. | Valorar un aviso visible en la pantalla o dejar explícito en el README que, si el catálogo aparece vacío en la primera apertura, hay que mirar la consola. | Unresolved |
| R-03 | Minor | herramienta/src/catalogo/ejemplos.js > cargarEjemplosSiPrimeraApertura (caso "datos-previos") | Si existe productos.json sin marca, solo se escribe la marca. Es coherente con el comentario del archivo y evita sobrescribir datos, pero si ese productos.json fuera una versión parcial o ilegible de una carga anterior, no habría ejemplos y no se avisaría de ello. Es un caso muy raro y no se puede comprobar con evidencia automática. | Opcional: indicar en el README que borrar productos.json y la marca vuelve a cargar los ejemplos. | New |

> R-01 Reviewer note: El código de `sembrarYGuardar` no cambió: el deshacer solo cubre fallos que lanzan error. Un corte brusco entre la siembra y el guardado de productos.json sigue pudiendo dejar carpetas sin producto en `recorridos/`. El README y `docs/formato-datos.md` no lo mencionan. No bloquea.

> R-02 Reviewer note: `main.js` sigue arrancando con el catálogo vacío si la carga de ejemplos falla, y solo lo dice en la consola (`docs/formato-datos.md` lo documenta). No hay aviso visible en la pantalla ni indicación en el README. No bloquea.

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| node --test tests/u4-catalogo/*.test.js | PASS: 31 de 31 | Las pruebas de la unidad pasan, incluido el caso en el que falla el deshacer. |
| npm test | PASS: 110 de 110 | La suite completa sigue en verde. Los cambios revertidos en `playbook/` no afectan al código de la unidad. |

### Summary

El código de la unidad no cambió, las 110 pruebas pasan y las rutas del manifiesto son todas de `herramienta/`. No hay hallazgos Critical ni Major. Los dos Minor previos y el nuevo siguen abiertos, sin bloquear.
