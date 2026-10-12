# Instrucciones de pruebas de integración

## Herramienta

El mismo ejecutor de las pruebas unitarias: `node --test` con `node:assert/strict`. No hay que instalar nada. Las pruebas de integración arrancan la aplicación real en `127.0.0.1` con puerto `0` y una carpeta de datos temporal que se borra al terminar.

## Cómo ejecutarlas

Todo el conjunto (unitarias e integración de las cuatro unidades), desde `herramienta/`:

```
npm test
```

Solo las pruebas de integración entre unidades:

```
node --test tests/u1-base/arranque.test.js tests/u2-definicion-proceso/arranque.test.js tests/u3-recorrido/integracion.test.js tests/u4-catalogo/integracion.test.js tests/u4-catalogo/rutas.test.js
```

## Fronteras entre unidades que se prueban

| Frontera | Prueba | Qué comprueba |
|---|---|---|
| U1 almacén + servidor ↔ arranque | `u1-base/arranque.test.js` | Persistencia tras reiniciar (FR6.1), fallo claro al arrancar |
| U2 definición ↔ U1 arranque | `u2-definicion-proceso/arranque.test.js` | Arranque con la definición real y fallo claro con una inválida |
| U3 recorrido ↔ U1 almacén y U2 definición | `u3-recorrido/integracion.test.js` | Recorrido completo por los 10 pasos y persistencia tras reiniciar |
| U4 catálogo ↔ U3 recorrido (`nombreDe`, crear, borrar) | `u4-catalogo/rutas.test.js` | El recorrido de U3 muestra el nombre del catálogo; control de origen de U1 sobre las rutas de U4 |
| U4 ↔ U3 ↔ U1, de punta a punta | `u4-catalogo/integracion.test.js` | Producto ficticio por los 10 pasos hasta "Completo" (E1, E3, E4) y primera apertura real con reinicio (FR6.2, FR6.3) |
| Operaciones compuestas U4 ↔ U3 ↔ U1 | `u4-catalogo/servicio.test.js`, `u4-catalogo/ejemplos.test.js` | Deshacer la primera escritura si falla la segunda (Q4, NFR1) |

## Prueba de humo manual

Además de las automáticas, una comprobación rápida de la aplicación arrancada (ver `build-instructions.md`):

1. `GET /` responde 200 en HTML con `Content-Security-Policy` y `X-Content-Type-Options: nosniff`.
2. `GET /api/productos` devuelve los 3 ejemplos con su paso actual.
3. `POST /api/productos` con un nombre válido y `Origin` propio responde 201; con nombre vacío, 400 "El nombre es obligatorio."; con `Origin` ajeno, 403.

## Objetivo

La estrategia estándar no fija porcentaje de cobertura. Objetivo: que cada frontera entre unidades tenga al menos una prueba que falle si se rompe, y que el conjunto completo siga en verde.

## Datos de prueba

Cada prueba crea y borra su propia carpeta temporal. Ninguna toca `herramienta/datos/`. Se usan la definición real y `herramienta/proceso/ejemplos.json` solo para leer.
