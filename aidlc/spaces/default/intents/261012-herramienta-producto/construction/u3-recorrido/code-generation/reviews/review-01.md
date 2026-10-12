## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-10-12T06:39:10Z
**Iteration:** 1

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Minor | herramienta/src/recorrido/reglas.js > guardarContenido (línea 104) y herramienta/src/recorrido/rutas.js > PUT .../pasos/:paso/contenido | Un PUT de contenido sin la clave `evidencia` se trata como "sin evidencia": en una sonda real sobre el paso `user-flow`, tras subir un adjunto, `guardarContenido(..., { campos: {} })` dejó `evidencia: null` y borró el archivo de la carpeta de adjuntos. La pantalla siempre envía `evidencia`, así que no falla en la UI, pero otro cliente de la API (U4 u otra pantalla) perdería el adjunto sin aviso. | Documentar en el encabezado de rutas.js y en formato-datos.md que el PUT reemplaza todo el contenido, incluida la evidencia, o conservar la evidencia existente cuando la clave no viene en el cuerpo. | New |
| R-02 | Minor | herramienta/public/js/paso.js, registros.js, recorrido.js y dom.js (sin pruebas de ejecución) | Las pruebas de pantallas (pantallas.test.js) comprueban la lógica sin DOM, el HTML estático (sin script ni estilos en línea, etiquetas asociadas) y la accesibilidad de la estructura. El código de DOM de las tres pantallas, es decir, el cableado de eventos, el bloqueo con `disabled` y el pintado del adjunto, no se ejecuta en ninguna prueba. Lo revisé a mano y no encontré un fallo, pero una regresión ahí pasaría la suite en verde. | Añadir una prueba con un DOM simulado, o dejar anotado en unit-test-instructions.md que esa capa se verifica solo a mano en el navegador, con los pasos de comprobación. | New |
| R-03 | Minor | herramienta/public/paso.html > `<input type="url" id="evidencia-url">` | El formulario no lleva `novalidate`. Si la persona escribe un texto que no es una URL y luego elige "Nada por ahora", la validación nativa del navegador puede impedir el envío antes de que actúe `comprobarEnlace`, y el mensaje no sale en el aviso de la página. | Poner `novalidate` en `form-contenido`, o vaciar o ignorar el campo de URL cuando el tipo elegido no es "enlace". | New |

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| npm --prefix herramienta test | PASS: 79 pruebas, 0 fallos | La suite completa de U1, U2 y U3 está en verde. |
| node --test --experimental-test-coverage herramienta/tests/u3-recorrido/*.test.js | 90,16 % de líneas, 78,86 % de ramas | El alcance no fija un mínimo y las responsabilidades de U3 están cubiertas. |
| Sonda con el servicio y la API reales (script temporal fuera del repo) | 404 con paso o id desconocido o inexistente, 400 con id o estado no válido, 409 con "Falta completar: ..." en paso no habilitado. Adjunto sustituido y eliminado sin huérfanos. 10 altas concurrentes dan 10 entradas. borrar, recuperarBorrado, deshacerCreacion (idempotente) y sembrar funcionan. | La habilitación en cadena, los códigos de error y las operaciones de deshacer para U4 se comportan según el contrato. |
| Revisión de CSP y accesibilidad | Un solo `<script type="module" src>` por pantalla, sin scripts en línea. `lang="es"`, enlace para saltar, `role="status"`, estilo `:focus-visible`. | Cumple NFR2 y NFR4 en lo comprobable de forma estática. |

### Summary

Las reglas de habilitación en cadena, el paso actual, el guardado sin completar, el rechazo de enlaces que no sean http o https, la seguridad de adjuntos y los códigos 404, 409 y 400 se comprobaron con la suite y con una sonda real, sin ningún fallo bloqueante. Las operaciones crear, sembrar, borrar y deshacer que U4 necesita existen y se comportan como el contrato pide. Quedan tres puntos menores: el PUT de contenido reemplaza también la evidencia, el DOM no se ejecuta en pruebas y falta `novalidate` en el formulario.
