## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-10-12T05:51:54Z
**Iteration:** 1

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Major | herramienta/src/base/almacen.js > guardar, borrar y restaurar (cada una llama a leer(ruta) antes de actuar) | Un archivo de datos con JSON dañado (por ejemplo, editado a mano, algo previsto porque los archivos son legibles) no se puede sobrescribir, borrar ni restaurar: las tres operaciones lanzan ARCHIVO_DANADO al leer el contenido anterior. Comprobado con un script: guardar, borrar y restaurar fallan con ARCHIVO_DANADO y solo apartar funciona. U4 usará restaurar para deshacer, así que un deshacer sobre un archivo dañado también fallaría, y la persona queda sin forma de reparar ese dato desde la herramienta. | Definir qué hacer cuando el contenido anterior no se puede interpretar: por ejemplo, que guardar, borrar y restaurar traten un archivo dañado como "anterior desconocido" (devolver un marcador o apartarlo automáticamente antes de sobrescribir) en lugar de bloquearse, o documentar en formato-datos.md que apartar es la única vía y exponerla. Añadir una prueba. | New |
| R-02 | Minor | herramienta/src/base/almacen.js > resolverRuta, estaDentro | La comprobación de que una ruta queda dentro de la carpeta de datos es léxica; no resuelve enlaces simbólicos. Un enlace simbólico colocado dentro de herramienta/datos/ permitiría leer o escribir fuera. El riesgo es bajo en una herramienta local de una sola persona. | Anotar la limitación en herramienta/docs/formato-datos.md, o resolver con realpath el tramo existente antes de operar. | New |
| R-03 | Minor | herramienta/src/base/almacen.js > guardar, borrar y restaurar | Las operaciones de leer-y-luego-escribir no se serializan por ruta. Dos peticiones simultáneas sobre el mismo archivo podrían devolver un "anterior" que ya no es el real, y el deshacer de U4 restauraría un contenido equivocado. Con una sola persona es poco probable. | Documentar que el almacén asume un único escritor por ruta, o añadir una cola por ruta. | New |

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| node --test herramienta/tests/u1-base/*.test.js (con los 5 archivos nombrados) | PASS: 24 pruebas, 0 fallos | Coincide con las unas 24 pruebas del plan; la carpeta sola no es aceptada por Node 22, y el script npm test con patrón sí funciona. |
| npm test (en herramienta/) | PASS: 24 de 24 | El script del plan funciona. |
| Script de comprobación de JSON dañado | guardar, borrar y restaurar: ARCHIVO_DANADO; apartar: ok | Confirma el hallazgo Major. |
| Rutas declaradas frente a source-manifest.json | 19 rutas, todas relacionadas con la unidad; el cambio en .gitignore es solo herramienta/datos/ | Sin reclamaciones ajenas a la unidad. |

### Summary

La implementación cumple el plan: escritura completa o nula, contratos de deshacer (R-02), raíz de composición (R-01), control de Host y Origin, adjuntos saneados y descarga controlada, con las 24 pruebas en verde y un acoplamiento sin ciclos. El único hueco relevante es que un archivo JSON dañado bloquea guardar, borrar y restaurar, lo que debilita el deshacer que U4 necesitará; con un solo Major el veredicto es READY, y conviene resolverlo antes de que U4 dependa del contrato.
