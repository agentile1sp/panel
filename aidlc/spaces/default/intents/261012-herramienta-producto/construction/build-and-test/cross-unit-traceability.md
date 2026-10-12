# Trazabilidad final entre unidades

Se comprueba cada `FR` y cada `NFR` de `inception/requirements-analysis/requirements.md` contra los cuatro `construction/<unidad>/code-generation/traceability.json`. En este flujo no hubo etapa de historias de usuario, así que no hay `AC` de tres segmentos que enumerar.

## Veredicto

**No pasa del todo: 39 de 40 elementos cubiertos.** Falta NFR5 en el registro de trazabilidad.

- NFR5 (Pruebas) no tiene entrada en ningún `traceability.json`, aunque en la práctica se cumple: las 110 pruebas pasan y cada unidad tiene las pruebas por requisito que aprobó.
- Es un hueco del registro, no del producto. Se señala en la aprobación de esta etapa.

Todos los archivos de destino existen.

## Cobertura por elemento

| ID | Estado | Unidad | Archivo de destino |
|---|---|---|---|
| FR1 | OK | u4-catalogo | `herramienta/src/catalogo/servicio.js` |
| FR1.1 | OK | u4-catalogo | `herramienta/src/catalogo/servicio.js` |
| FR1.2 | OK | u3-recorrido | `herramienta/src/recorrido/reglas.js` |
| FR1.3 | OK | u4-catalogo | `herramienta/src/catalogo/nombre.js` |
| FR1.4 | OK | u4-catalogo | `herramienta/src/catalogo/servicio.js` |
| FR1.5 | OK | u4-catalogo | `herramienta/public/js/catalogo.js` |
| FR1.6 | OK | u4-catalogo | `herramienta/public/js/logica-catalogo.js` |
| FR1.7 | OK | u4-catalogo | `herramienta/public/js/logica-catalogo.js` |
| FR2 | OK | u3-recorrido | `herramienta/public/js/recorrido.js` |
| FR2.1 | OK | u3-recorrido | `herramienta/public/js/recorrido.js` |
| FR2.2 | OK | u3-recorrido | `herramienta/src/recorrido/modelo.js` |
| FR2.3 | OK | u3-recorrido | `herramienta/public/js/paso.js` |
| FR2.4 | OK | u3-recorrido | `herramienta/public/js/registros.js` |
| FR2.5 | OK | u3-recorrido | `herramienta/src/recorrido/reglas.js` |
| FR3 | OK | u3-recorrido | `herramienta/src/recorrido/reglas.js` |
| FR3.1 | OK | u3-recorrido | `herramienta/src/recorrido/reglas.js` |
| FR3.2 | OK | u3-recorrido | `herramienta/src/recorrido/reglas.js` |
| FR3.3 | OK | u3-recorrido | `herramienta/src/recorrido/reglas.js` |
| FR3.4 | OK | u3-recorrido | `herramienta/src/recorrido/reglas.js` |
| FR3.5 | OK | u3-recorrido | `herramienta/tests/u3-recorrido/reglas.test.js` |
| FR4 | OK | u3-recorrido | `herramienta/src/recorrido/servicio.js` |
| FR4.1 | OK | u3-recorrido | `herramienta/src/recorrido/modelo.js` |
| FR4.2 | OK | u3-recorrido | `herramienta/public/js/logica-paso.js` |
| FR4.3 | OK | u3-recorrido | `herramienta/src/recorrido/modelo.js` |
| FR4.4 | OK | u3-recorrido | `herramienta/src/recorrido/servicio.js` |
| FR4.5 | OK | u3-recorrido | `herramienta/src/recorrido/servicio.js` |
| FR4.6 | OK | u3-recorrido | `herramienta/tests/u3-recorrido/reglas.test.js` |
| FR4.7 | OK | u3-recorrido | `herramienta/src/recorrido/reglas.js` |
| FR5 | OK | u2-definicion-proceso | `herramienta/proceso/definicion-proceso.json` |
| FR5.1 | OK | u2-definicion-proceso | `herramienta/src/definicion/cargar.js` |
| FR5.2 | OK | u2-definicion-proceso | `herramienta/src/definicion/definicion.js` |
| FR6 | OK | u1-base | `herramienta/src/main.js` |
| FR6.1 | OK | u1-base | `herramienta/src/base/almacen.js` |
| FR6.2 | OK | u4-catalogo | `herramienta/src/catalogo/ejemplos.js` |
| FR6.3 | OK | u4-catalogo | `herramienta/tests/u4-catalogo/ejemplos.test.js` |
| NFR1 | OK | u1-base | `herramienta/tests/u1-base/almacen.test.js` |
| NFR2 | OK | u3-recorrido | `herramienta/tests/u3-recorrido/pantallas.test.js` |
| NFR3 | OK | u4-catalogo | `herramienta/tests/u4-catalogo/integracion.test.js` |
| NFR4 | OK | u3-recorrido | `herramienta/public/js/logica-recorrido.js` |
| NFR5 | Sin cubrir en el registro | — | Evidencia de hecho: `test-results.md` (110 de 110) |

## Elementos sin cubrir

- **NFR5:** añadirlo al `traceability.json` de u1-base, dueña de NFR5 según el mapa de historias, apuntando a `herramienta/package.json`, que define `npm test`. Otra opción es aceptar el hueco en la aprobación.
