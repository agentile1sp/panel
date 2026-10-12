# Instrucciones de pruebas: U3 · Recorrido (`u3-recorrido`)

## Herramienta de pruebas

- Ejecutor integrado de Node (`node --test`) con `node:assert/strict`, como en U1 y U2. No hay que instalar nada.
- Requisito: Node.js 20 o superior.

## Cómo ejecutar las pruebas de esta unidad

Desde la carpeta `herramienta/`:

```
node --test tests/u3-recorrido/*.test.js
```

Desde Node 21, `node --test` no acepta una carpeta, solo archivos o patrones; el patrón `*.test.js` funciona en Node 20 y en versiones posteriores. Este comando funciona desde el primer paso de pruebas (Paso 2 del plan). Para un archivo concreto:

```
node --test tests/u3-recorrido/modelo.test.js
node --test tests/u3-recorrido/reglas.test.js
node --test tests/u3-recorrido/servicio.test.js
node --test tests/u3-recorrido/rutas.test.js
node --test tests/u3-recorrido/pantallas.test.js
node --test tests/u3-recorrido/integracion.test.js
```

## Qué se prueba

Estrategia estándar: de 5 a 8 pruebas por componente, más pruebas de integración.

| Componente | Archivo | Pruebas | Cubre |
|---|---|---|---|
| Ejecutor listo (humo) | `humo.test.js` | 1 | El ejecutor de pruebas funciona |
| Modelo | `modelo.test.js` | 6 | AC2.1, AC4.1, AC4.3, AC4.4, validación contra la definición, enlaces http o https |
| Reglas | `reglas.test.js` | 7 | AC1.2, AC3.1, AC3.2, AC3.3, bloqueo en cadena, FR4.6, FR4.7 |
| Servicio | `servicio.test.js` | 7 | AC6.1, paso no habilitado, adjuntos, registros (AC3.4), crear y deshacer, borrar y recuperar, siembra coherente |
| API | `rutas.test.js` | 7 | Definición, recorrido, 404, 409, 400, adjuntos, registros, control de origen |
| Pantallas | `pantallas.test.js` | 5 | Textos de estado, controles por tipo de campo, conversión del formulario, enlaces, HTML en español sin JavaScript en línea y con etiquetas |
| Integración | `integracion.test.js` | 2 | Recorrido completo por los 10 pasos (AC2.2, AC2.3) y persistencia tras reiniciar |

Cada componente tiene al menos un caso de éxito y dos de error o de borde.

## Objetivo de cobertura

Este alcance no fija un porcentaje mínimo de cobertura. El objetivo es que cada responsabilidad de U3 en `unit-of-work.md` tenga al menos una prueba que falle si se rompe.

## Simulaciones

- Sin simulaciones de red ni de archivos: las pruebas del servicio y de la API usan carpetas de datos temporales (`tests/ayudas/carpeta-temporal.js`) y la aplicación real arrancada en `127.0.0.1` con puerto `0` (`tests/ayudas/recorrido.js`).
- Las pruebas de pantallas importan los módulos puros `public/js/logica-*.js` directamente y comprueban el HTML servido por la aplicación; no hay navegador.

## Datos de prueba

- Cada prueba crea sus recorridos con el servicio en su carpeta temporal y la borra al terminar.
- Se usa la definición real `herramienta/proceso/definicion-proceso.json`, solo para leer.
- Ninguna prueba toca `herramienta/datos/`.
