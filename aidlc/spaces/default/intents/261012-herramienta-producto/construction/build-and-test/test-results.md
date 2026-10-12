# Resultados de construcción y pruebas

Ejecutado el 2026-10-12 con Node 22.17.1 en macOS.

## Construcción

- No hay paso de compilación ni dependencias que instalar.
- `node --check` sobre los 30 archivos JavaScript de `src/` y `public/js/`: todos correctos.
- Arranque real con `PUERTO=3299` y una carpeta de datos temporal: arranca, carga los 3 productos de ejemplo e imprime "La herramienta está en marcha en http://127.0.0.1:3299".

**Estado de la construcción: correcta.**

## Pruebas unitarias por unidad

Cada comando se ejecutó una vez desde `herramienta/`:

| Comando | Pruebas | Pasan | Fallan | Omitidas |
|---|---|---|---|---|
| `node --test tests/u1-base/*.test.js` | 24 | 24 | 0 | 0 |
| `node --test tests/u2-definicion-proceso/*.test.js` | 20 | 20 | 0 | 0 |
| `node --test tests/u3-recorrido/*.test.js` | 35 | 35 | 0 | 0 |
| `node --test tests/u4-catalogo/*.test.js` | 31 | 31 | 0 | 0 |

## Conjunto completo e integración

| Comando | Pruebas | Pasan | Fallan | Omitidas | Duración |
|---|---|---|---|---|---|
| `npm test` | 110 | 110 | 0 | 0 | 1,3 s |

La suma por unidades (24 + 20 + 35 + 31 = 110) coincide con el total: ninguna prueba se cuenta dos veces.

## Prueba de humo contra la aplicación arrancada

| Comprobación | Resultado |
|---|---|
| `GET /` | 200, `text/html; charset=utf-8` |
| Cabeceras | `Content-Security-Policy: default-src 'self'; frame-ancestors 'none'`, `X-Content-Type-Options: nosniff` |
| `GET /api/productos` en la primera apertura | Los 3 ejemplos: "Hipótesis", "Mapa de piezas" y uno completo |
| `POST /api/productos` con nombre válido | 201 y producto en "Hipótesis" |
| `POST /api/productos` con nombre vacío | 400, "El nombre es obligatorio." |
| `POST /api/productos` con `Origin` ajeno | 403 |
| Carpeta de datos tras el arranque | `catalogo/productos.json`, `catalogo/primera-apertura.json` y `recorridos/` |

## Cobertura

Informativa: la estrategia no fija un mínimo. Comando: `node --test --experimental-test-coverage tests/*/*.test.js` (proveedor integrado de Node 22).

| Ámbito | Líneas | Ramas | Funciones |
|---|---|---|---|
| Todos los archivos cargados por las pruebas | 96,64 % | 89,51 % | 95,49 % |

El JavaScript de pantalla que solo corre en el navegador (`public/js/catalogo.js`, `recorrido.js`, `paso.js`, `registros.js`) no lo cargan las pruebas, así que no entra en esta cifra. Su lógica pura (`logica-*.js`) sí.

## Fallos

Ninguno.

## Matriz de verificación de objetivos

Los objetivos medibles salen de los Testing Contract de los cuatro planes de código. Son iguales en las cuatro unidades: test-after, alcance express y estrategia estándar. No hay artefactos de NFR Requirements ni de NFR Design en este flujo.

| Target ID | Source | Expected | Actual | Evidence | Owning Stage | Verdict |
|---|---|---|---|---|---|---|
| TC-SUITE-VERDE | Testing Contract de u1 a u4, `obligations.scope_floor` | El conjunto de pruebas existente sigue en verde | 110 de 110 pasan, 0 fallan | `npm test` (sección "Conjunto completo") | build-and-test | Met |
| TC-U1-VOLUMEN | `construction/u1-base/code-generation/unit-test-instructions.md`, "Qué se prueba" | Las pruebas aprobadas por componente (1/7/5/8/3) en verde | 24 de 24 pasan, cantidades por archivo iguales a las aprobadas | `node --test tests/u1-base/*.test.js` | build-and-test | Met |
| TC-U2-VOLUMEN | `construction/u2-definicion-proceso/code-generation/unit-test-instructions.md`, "Qué se prueba" | Las pruebas aprobadas por componente (1/4/7/5/2) en verde | 20 de 20 pasan; `validar.test.js` tiene 8, una más de las 7 previstas | `node --test tests/u2-definicion-proceso/*.test.js` | build-and-test | Met |
| TC-U3-VOLUMEN | `construction/u3-recorrido/code-generation/unit-test-instructions.md`, "Qué se prueba" | Las pruebas aprobadas por componente (1/6/7/7/7/5/2) en verde | 35 de 35 pasan, cantidades iguales a las aprobadas | `node --test tests/u3-recorrido/*.test.js` | build-and-test | Met |
| TC-U4-VOLUMEN | `construction/u4-catalogo/code-generation/unit-test-instructions.md`, "Qué se prueba" | Las pruebas aprobadas por componente (1/5/7/6/5/5/2) en verde | 31 de 31 pasan, cantidades iguales a las aprobadas | `node --test tests/u4-catalogo/*.test.js` | build-and-test | Met |
| TC-INTEGRACION | Testing Contract, `obligations.strategy_volume` ("Unit tests plus integration tests for key boundaries") | Al menos una prueba de integración por frontera entre unidades | 6 fronteras con prueba, todas en verde | `integration-test-instructions.md`, `npm test` | build-and-test | Met |
