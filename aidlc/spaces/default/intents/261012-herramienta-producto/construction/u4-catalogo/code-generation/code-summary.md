# Resumen del código: U4 · Catálogo (`u4-catalogo`)

## Archivos creados o modificados

| Archivo | Contenido |
|---|---|
| `herramienta/src/base/errores.js` | Añade `ErrorCatalogo` (código, mensaje en español, estado HTTP sugerido y `problemas`) sin cambiar lo existente |
| `herramienta/src/catalogo/nombre.js` | `validarNombre` (obligatorio, recortado, hasta 100 caracteres) y `nuevoIdProducto` (`p-` + 12 hexadecimales) |
| `herramienta/src/catalogo/modelo.js` | Forma de `catalogo/productos.json` y de `catalogo/primera-apertura.json`; lectura que acepta que no existan; un `productos.json` dañado da `CATALOGO_DANADO` y no se sobrescribe |
| `herramienta/src/catalogo/servicio.js` | `crearServicioCatalogo` con `listar`, `obtener`, `crear`, `renombrar`, `borrar`, `nombreDe` y `enExclusiva`; una sola cola de operaciones; crear y borrar se deshacen si falla la segunda escritura (Q4) |
| `herramienta/src/catalogo/ejemplos.js` | `cargarEjemplosSiPrimeraApertura` con la regla de la marca de primera apertura (ADR-006) y deshacer completo si algo falla; `leerEjemplos` |
| `herramienta/src/catalogo/rutas.js` | `GET`/`POST /api/productos` y `GET`/`PUT`/`DELETE /api/productos/:id`, con 400 y 404 en JSON y en español |
| `herramienta/src/catalogo/index.js` | Punto de entrada público de U4 |
| `herramienta/src/main.js` | Crea el catálogo, carga los ejemplos antes de iniciar el servidor, registra las rutas de U4, pasa `catalogo.nombreDe` a U3 y devuelve `catalogo`; se quita `nombreDeProductoPorDefecto` |
| `herramienta/proceso/ejemplos.json` | Tres productos ficticios: uno sin empezar, uno con los pasos 1 a 3 en Completo y el 4 en En curso, y uno con los 10 pasos en Completo (enlaces en los pasos visuales) |
| `herramienta/public/index.html` | La página provisional de U1 pasa a ser el catálogo, con `<dialog>` para borrar y para renombrar |
| `herramienta/public/js/catalogo.js` | Comportamiento de la pantalla del catálogo en el navegador |
| `herramienta/public/js/logica-catalogo.js` | Lógica pura de la pantalla: texto del paso actual, catálogo vacío, confirmación de borrado, enlace al recorrido y comprobación del nombre |
| `herramienta/public/css/estilos.css` | Estilos de la lista de productos, los diálogos, los errores de campo y el botón de borrar |
| `herramienta/docs/formato-datos.md` | Sección de U4: `productos.json`, operaciones compuestas, marca de primera apertura y `proceso/ejemplos.json` |
| `herramienta/README.md` | El catálogo en `/`, el uso de punta a punta, cómo volver a ver los ejemplos, el comando de pruebas de U4 y la API del catálogo |
| `herramienta/tests/ayudas/catalogo.js` | `arrancarAplicacion`, `envolverAlmacen` (fallos en una operación y ruta concretas) y `crearPiezas` |
| `herramienta/tests/u4-catalogo/*.test.js` | 31 pruebas: humo 1, nombre 5, servicio 7, ejemplos 6, rutas 5, pantalla 5, integración 2 |

## Decisiones clave de implementación

- **Si falla la carga de los ejemplos, la herramienta arranca igualmente.** La carga ya se ha deshecho, así que `main.js` avisa en la consola y sigue; como no queda ni marca ni `productos.json`, se reintenta en el siguiente arranque. Un fallo de la definición del proceso (U2) sigue impidiendo arrancar.
- **`nombreDe` nunca rompe el recorrido.** Si el catálogo no se puede leer, lo registra en la consola y devuelve `null`, y la pantalla de U3 muestra "Producto <id>".
- **Un recorrido que falta o está dañado no impide ver el catálogo.** `listar` devuelve ese producto con `pasoActual: null` y un campo `problema`, y lo registra en la consola. `borrar` quita del catálogo un producto cuyo recorrido ya no existe.
- **Fallo del último paso de un borrado.** Si `productos.json` ya se guardó pero falla `confirmarBorrado`, el borrado se da por bueno y se registra el error; lo apartado queda en `.apartado/` y U1 avisa al arrancar (riesgo aceptado R-02).
- **Orden del deshacer en la carga de ejemplos.** Primero se restaura `productos.json` con el contenido anterior que devuelve `guardar`, y después se deshacen los recorridos en orden inverso, para que el catálogo nunca apunte a recorridos que ya no existen.
- **`enExclusiva(tarea)`.** La carga de ejemplos corre en la misma cola que las demás operaciones del catálogo.
- **La página del catálogo conserva la frase "La herramienta está en marcha"**, que busca la prueba de arranque de U1; así esa prueba no se ha tocado.
- **Accesibilidad.** En el diálogo de borrar el foco empieza en Cancelar; los errores de campo usan `aria-invalid` y `aria-describedby`; los botones de cada producto llevan un `aria-label` con el nombre del producto.
- **`crear` y `renombrar` son asíncronas**, para que un nombre no válido llegue siempre como promesa rechazada.

## Pruebas

| Comando (desde `herramienta/`) | Pruebas | Pasan | Fallan |
|---|---|---|---|
| `node --test tests/u4-catalogo/*.test.js` | 31 | 31 | 0 |
| `npm test` | 110 | 110 | 0 |

Las 79 pruebas de U1, U2 y U3 siguen pasando sin cambios. Cada componente tiene al menos un caso de éxito y dos de error o de borde.

## Desviaciones del plan

- **Un sexto archivo en `src/catalogo/`:** `modelo.js`, para la forma de los archivos del Paso 3, siguiendo la convención de U3.
- **31 pruebas en lugar de "unas 33":** es exactamente la suma de la tabla de las instrucciones de pruebas.
- **La regla de ids de producto está copiada** en `nombre.js` porque U3 no exporta `PATRON_ID`; una prueba comprueba que los ids generados cumplen la regla de U3.
- **La comprobación del nombre está en dos sitios** (servidor y pantalla, que no puede importar código del servidor); `pantalla.test.js` comprueba que coinciden.

## Pendiente de comprobar

- **La pantalla no se ha abierto en un navegador real.** Se probaron la lógica pura y el HTML servido, y `catalogo.js` pasa `node --check`. En Build and Test conviene comprobar a mano, con una carpeta de datos vacía: que aparecen los tres ejemplos, crear con el nombre vacío (se conserva lo escrito), renombrar, abrir y cancelar el borrado, borrar de verdad y abrir un paso en dos acciones (NFR3).
- **Las pruebas de arranque de U1 a U3 cargan ahora los ejemplos** en su carpeta temporal, porque cada arranque sobre una carpeta vacía es una primera apertura.
