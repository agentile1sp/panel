# Instrucciones de pruebas: U4 · Catálogo (`u4-catalogo`)

## Herramienta de pruebas

- Ejecutor integrado de Node (`node --test`) con `node:assert/strict`, como en U1, U2 y U3. No hay que instalar nada.
- Requisito: Node.js 20 o superior.

## Cómo ejecutar las pruebas de esta unidad

Desde la carpeta `herramienta/`:

```
node --test tests/u4-catalogo/*.test.js
```

Desde Node 21, `node --test` no acepta una carpeta, solo archivos o patrones; el patrón `*.test.js` funciona en Node 20 y en versiones posteriores. Este comando funciona desde el primer paso de pruebas (Paso 2 del plan). Para un archivo concreto:

```
node --test tests/u4-catalogo/nombre.test.js
node --test tests/u4-catalogo/servicio.test.js
node --test tests/u4-catalogo/ejemplos.test.js
node --test tests/u4-catalogo/rutas.test.js
node --test tests/u4-catalogo/pantalla.test.js
node --test tests/u4-catalogo/integracion.test.js
```

## Qué se prueba

Estrategia estándar: de 5 a 8 pruebas por componente, más pruebas de integración.

| Componente | Archivo | Pruebas | Cubre |
|---|---|---|---|
| Ejecutor listo (humo) | `humo.test.js` | 1 | El ejecutor de pruebas funciona |
| Nombre e ids | `nombre.test.js` | 5 | AC1.3, límite de longitud, caracteres especiales, ids válidos para U3 |
| Servicio | `servicio.test.js` | 7 | AC1.1, AC1.2, renombrar, borrar, deshacer al crear y al borrar (Q4), fallo del propio deshacer |
| Ejemplos | `ejemplos.test.js` | 6 | AC6.2, AC6.3, catálogo vaciado, datos sin marca, fallo a medias, ejemplos coherentes |
| API | `rutas.test.js` | 5 | Lista, crear (201 y 400), renombrar y borrar (404), nombre en el recorrido de U3, control de origen |
| Pantalla | `pantalla.test.js` | 5 | Textos, confirmación con nombre, enlace al recorrido, comprobación del nombre, HTML en español con `<dialog>` y sin JavaScript en línea |
| Integración | `integracion.test.js` | 2 | Producto ficticio por los 10 pasos hasta "Completo" (AC2.2, E1, E3, E4) y primera apertura real con reinicio (AC6.2, AC6.3) |

Cada componente tiene al menos un caso de éxito y dos de error o de borde.

## Objetivo de cobertura

Este alcance no fija un porcentaje mínimo de cobertura. El objetivo es que cada responsabilidad de U4 en `unit-of-work.md` tenga al menos una prueba que falle si se rompe.

## Simulaciones

- Los fallos a medias se provocan envolviendo el almacén real con `tests/ayudas/catalogo.js`, que hace fallar el guardado de un archivo concreto (por ejemplo, `catalogo/productos.json`) mientras el resto funciona de verdad.
- Las pruebas de la API y de integración arrancan la aplicación real en `127.0.0.1` con puerto `0` y una carpeta de datos temporal.
- Las pruebas de pantalla importan `public/js/logica-catalogo.js` directamente y comprueban el HTML servido; no hay navegador.

## Datos de prueba

- Cada prueba usa su carpeta de datos temporal y la borra al terminar.
- Se usan la definición real y `herramienta/proceso/ejemplos.json`, solo para leer.
- Ninguna prueba toca `herramienta/datos/`.
