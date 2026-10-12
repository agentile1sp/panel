# Resumen del código: U3 · Recorrido (`u3-recorrido`)

## Archivos creados o modificados

| Archivo | Contenido |
|---|---|
| `herramienta/src/recorrido/modelo.js` | Recorrido vacío con los 10 pasos en Pendiente; validación del contenido y de las entradas de registro contra la definición; solo enlaces http o https |
| `herramienta/src/recorrido/reglas.js` | Estado y habilitación en cadena de cada paso, pasos que faltan, paso actual, cambio de estado y guardado de contenido (funciones puras) |
| `herramienta/src/recorrido/servicio.js` | Lectura y guardado del recorrido con el almacén de U1, adjuntos, registros y las operaciones para U4 (crear, sembrar, borrar y sus deshacer) |
| `herramienta/src/recorrido/rutas.js` | API local: definición, recorrido, contenido, estado, adjuntos y registros, con 404, 409 y 400 en español |
| `herramienta/src/recorrido/index.js` | Punto de entrada público |
| `herramienta/src/main.js` | Crea el servicio, registra las rutas con `nombreDe` por defecto (`null`) y devuelve `recorridos` |
| `herramienta/src/base/errores.js` | Añade `ErrorRecorrido` con `faltan` y `problemas` |
| `herramienta/public/recorrido.html`, `paso.html`, `registros.html` | Pantallas de recorrido, de paso y de registros, en español y sin JavaScript en línea |
| `herramienta/public/css/estilos.css` | Estilos con foco de teclado visible |
| `herramienta/public/js/api.js`, `dom.js` | Llamadas a la API y utilidades del DOM |
| `herramienta/public/js/logica-recorrido.js`, `logica-paso.js` | Lógica de pantalla sin DOM, probada con Node |
| `herramienta/public/js/recorrido.js`, `paso.js`, `registros.js` | Construcción de cada pantalla en el navegador |
| `herramienta/docs/formato-datos.md` | Sección de U3: `recorrido.json`, adjuntos y entradas de registro |
| `herramienta/README.md` | Pantallas de U3, comando de pruebas y operaciones del servicio para U4 |
| `herramienta/tests/ayudas/recorrido.js` | Arranque de la aplicación con carpeta temporal y recorridos de prueba |
| `herramienta/tests/u3-recorrido/*.test.js` | 35 pruebas: humo 1, modelo 6, reglas 7, servicio 7, rutas 7, pantallas 5, integración 2 |

## Decisiones clave de implementación

- **Forma de `recorrido.json`.** Añade `version: 1`. Al guardar, el contenido se completa con los campos, tipos de elemento y casillas vacíos que falten; `PUT .../contenido` sustituye el contenido entero.
- **Ids.** El servicio pone id a los elementos nuevos y un UUID a cada entrada de registro. El id de producto se limita a letras, números, guiones y guiones bajos (hasta 64 caracteres); U4 debe respetarlo.
- **Adjuntos.** Un adjunto nuevo solo entra por la ruta de subida; al sustituirlo por otro o por un enlace, el archivo viejo se borra (si falla, se anota en la consola y la operación sigue). Si falla el guardado después de escribir un adjunto nuevo, ese archivo se quita.
- **Errores.** Los 409 y 400 llevan los pasos que faltan o los problemas dentro del mensaje, porque la respuesta de error de U1 solo tiene `codigo` y `mensaje`; `GET /api/recorridos/:id` da `faltan` por paso como datos. Los fallos del almacén, incluido un JSON dañado, salen como 500 con el nombre del archivo; un `recorrido.json` sin forma válida da `RECORRIDO_DANADO` y no se sobrescribe.
- **Cambios en serie.** Los cambios de un mismo producto se hacen de uno en uno dentro del proceso, para que dos peticiones seguidas no se pisen.
- **Siembra.** Rechaza pasos no habilitados con estado o contenido, y adjuntos en los datos de siembra.

## Pruebas

| Comando | Pruebas | Pasan | Fallan |
|---|---|---|---|
| `node --test herramienta/tests/u3-recorrido/*.test.js` | 35 | 35 | 0 |
| `npm --prefix herramienta test` | 79 | 79 | 0 |

## Desviaciones del plan

- **Menos pruebas que las "unas 40" del plan:** 35, dentro de lo que pedían las instrucciones por componente.
- **Bloqueo en cadena.** El plan decía que el paso 7 depende del 5 de forma indirecta, pero en la definición el paso 7 (story map) tiene fichas como origen directo. La prueba comprueba el paso 7 y además el paso 8 (wireframes), que sí depende del 5 solo de forma indirecta.
- **Campo `version` en `recorrido.json`**, no previsto en el plan.

## Pendiente de comprobar

- **Las pantallas no se han abierto en un navegador real.** Se comprobaron la sintaxis, la lógica de pantalla y el HTML servido, pero no la interacción: añadir y quitar elementos, el modo de solo lectura y la subida de adjuntos.
- **Todavía no se puede crear un producto desde la interfaz:** llega con U4.
- **Campos de tipo lista:** una entrada por línea; una entrada no puede tener saltos de línea y las líneas vacías no se guardan.
