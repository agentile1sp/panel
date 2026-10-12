# Instrucciones de pruebas: U1 · Base común (`u1-base`)

## Herramienta de pruebas

- Ejecutor integrado de Node (`node --test`) con `node:assert/strict`. No hay que instalar nada.
- Requisito: Node.js 20 o superior.
- No hay archivo de configuración de pruebas: el ejecutor encuentra los archivos `*.test.js` de la carpeta que se le indica.

## Cómo ejecutar las pruebas de esta unidad

Desde la carpeta `herramienta/`:

```
node --test tests/u1-base/*.test.js
```

Desde Node 21, `node --test` no acepta una carpeta, solo archivos o patrones; el patrón `*.test.js` funciona en Node 20 y en versiones posteriores.

Este comando funciona desde el primer paso de pruebas (Paso 2 del plan). Para un archivo concreto:

```
node --test tests/u1-base/almacen.test.js
node --test tests/u1-base/adjuntos.test.js
node --test tests/u1-base/servidor.test.js
node --test tests/u1-base/arranque.test.js
```

## Qué se prueba

Estrategia estándar: de 5 a 8 pruebas por componente, más una prueba de integración del arranque.

| Componente | Archivo | Pruebas | Cubre |
|---|---|---|---|
| Ejecutor listo (humo) | `humo.test.js` | 1 | El ejecutor de pruebas funciona |
| Almacén | `almacen.test.js` | 7 | FR6.1, NFR1, contrato de deshacer (R-02), listar, existe y borrar |
| Adjuntos | `adjuntos.test.js` | 5 | Saneado de nombres, límite de tamaño, adjuntos dentro de la carpeta de datos |
| Servidor | `servidor.test.js` | 8 | Rutas, 404, control de origen, archivos estáticos, errores, descarga de adjuntos, cuerpo JSON (400, 413, 415) |
| Arranque (integración) | `arranque.test.js` | 3 | Persistencia tras reiniciar (FR6.1), estado, fallo claro al arrancar |

Cada componente tiene al menos un caso de éxito y dos de error o de borde.

## Objetivo de cobertura

Este alcance no fija un porcentaje mínimo de cobertura. El objetivo es que cada responsabilidad de U1 en `unit-of-work.md` tenga al menos una prueba que falle si se rompe.

## Simulaciones

- Sin simulaciones de red: las pruebas del servidor lo arrancan de verdad en `127.0.0.1` con el puerto `0` (el sistema elige uno libre) y le hacen peticiones con `fetch`.
- Los fallos de escritura se provocan con situaciones reales (carpeta sin permiso de escritura, ruta de temporal ocupada por una carpeta) en lugar de sustituir `node:fs`.

## Datos de prueba

- Cada prueba usa una carpeta de datos temporal creada con `tests/ayudas/carpeta-temporal.js` (en `os.tmpdir()`) y la borra al terminar.
- Ninguna prueba toca `herramienta/datos/`.
