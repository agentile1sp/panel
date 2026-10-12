# Instrucciones de pruebas: U2 · Definición del proceso (`u2-definicion-proceso`)

## Herramienta de pruebas

- Ejecutor integrado de Node (`node --test`) con `node:assert/strict`, como en U1. No hay que instalar nada.
- Requisito: Node.js 20 o superior.

## Cómo ejecutar las pruebas de esta unidad

Desde la carpeta `herramienta/`:

```
node --test tests/u2-definicion-proceso/*.test.js
```

Desde Node 21, `node --test` no acepta una carpeta, solo archivos o patrones; el patrón `*.test.js` funciona en Node 20 y en versiones posteriores. Este comando funciona desde el primer paso de pruebas (Paso 2 del plan). Para un archivo concreto:

```
node --test tests/u2-definicion-proceso/archivo.test.js
node --test tests/u2-definicion-proceso/validar.test.js
node --test tests/u2-definicion-proceso/consultas.test.js
node --test tests/u2-definicion-proceso/arranque.test.js
```

## Qué se prueba

Estrategia estándar: de 5 a 8 pruebas por componente, más pruebas de integración del arranque.

| Componente | Archivo | Pruebas | Cubre |
|---|---|---|---|
| Ejecutor listo (humo) | `humo.test.js` | 1 | El ejecutor de pruebas funciona |
| Archivo de definición | `archivo.test.js` | 4 | AC5.1: 10 pasos, 2 registros, orden, tipos, orígenes, tipos de elemento de los pasos 5 y 7 |
| Validación | `validar.test.js` | 7 | Archivo ausente o dañado, pasos que faltan, orígenes inválidos, plantilla inexistente, tipos no válidos, varios errores a la vez |
| Consultas | `consultas.test.js` | 5 | Pasos en orden, orígenes directos e indirectos (ADR-004), id desconocido, solo lectura (FR5.2) |
| Arranque (integración) | `arranque.test.js` | 2 | Arranque con la definición real y fallo claro con una definición inválida |

Cada componente tiene al menos un caso de éxito y dos de error o de borde (el archivo de definición se prueba en sus casos de error a través de la validación).

## Objetivo de cobertura

Este alcance no fija un porcentaje mínimo de cobertura. El objetivo es que cada responsabilidad de U2 en `unit-of-work.md` tenga al menos una prueba que falle si se rompe.

## Simulaciones

- Sin simulaciones: las pruebas de errores escriben copias estropeadas de la definición en carpetas temporales con `tests/ayudas/definicion-temporal.js` y las cargan con `HERRAMIENTA_DEFINICION` o pasando la ruta directamente.
- Las pruebas de arranque reutilizan `tests/ayudas/carpeta-temporal.js` de U1 para la carpeta de datos.

## Datos de prueba

- La definición real `herramienta/proceso/definicion-proceso.json` solo se lee, nunca se modifica.
- Ninguna prueba toca `herramienta/datos/`.
