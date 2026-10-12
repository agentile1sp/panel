# Herramienta de producto

Herramienta local, para una sola persona, que sigue cada producto a lo largo del proceso de producto de 10 pasos. Todo se introduce a mano y se guarda en archivos legibles en tu propio equipo.

## Requisitos

- **Node.js 20 o superior.** No hace falta instalar ninguna dependencia: la herramienta solo usa lo que trae Node.

## Cómo arrancar

Dentro de la carpeta `herramienta/`:

```
npm start
```

La consola muestra la dirección local, por ejemplo `La herramienta está en marcha en http://127.0.0.1:3210`. Ábrela en el navegador: la página inicial es el catálogo de productos. Para detenerla, pulsa `Ctrl+C` en la consola.

La primera vez que se abre, la herramienta carga tres productos ficticios para que puedas verla funcionando (uno sin empezar, uno a medias y uno con los 10 pasos completos), y la consola lo indica. No vuelven a cargarse nunca más, aunque los borres todos.

Si no se puede arrancar (el puerto está ocupado o la carpeta de datos no se puede crear), la consola explica el motivo y el proceso termina con un código de salida distinto de cero.

## Variables de entorno

| Variable | Para qué sirve | Valor por defecto |
|---|---|---|
| `PUERTO` | Puerto local en el que escucha la herramienta (de 0 a 65535; con `0` el sistema elige uno libre). | `3210` |
| `HERRAMIENTA_DATOS` | Carpeta donde se guardan los datos. Puede ser relativa a la carpeta desde la que arrancas o absoluta. | `herramienta/datos/` |
| `HERRAMIENTA_DEFINICION` | Archivo de definición del proceso (los 10 pasos y los 2 registros). Puede ser relativo a la carpeta desde la que arrancas o absoluto. | `herramienta/proceso/definicion-proceso.json` |

La definición del proceso es un archivo del proyecto que se edita a mano y que la herramienta solo lee; se valida al arrancar y, si falta o no es válida, la herramienta no arranca y la consola nombra el archivo y el problema. Su forma está descrita en [`docs/formato-datos.md`](docs/formato-datos.md#u2--definición-del-proceso).

Ejemplo:

```
PUERTO=4000 HERRAMIENTA_DATOS=/ruta/a/mis-datos npm start
```

La carpeta `herramienta/datos/` está ignorada por git: tus datos no se suben al repositorio. El formato de los archivos está descrito en [`docs/formato-datos.md`](docs/formato-datos.md).

## Cómo se usa

1. **Catálogo** (`/`). Muestra todos los productos con su nombre y su paso actual: el primer paso que no está en Completo, o "Completo" si lo están los 10. Desde aquí se crea un producto (solo hace falta el nombre), se le cambia el nombre o se borra; antes de borrar, un diálogo nombra el producto y permite cancelar.
2. **Recorrido** de un producto: se abre pulsando su nombre en el catálogo. Muestra los 10 pasos con su estado y, para los que no están habilitados, qué falta completar.
3. **Paso**: se abre desde el recorrido. Se rellena con los campos de su plantilla, se guarda y, cuando está terminado, se marca como Completo. Eso habilita los pasos que dependen de él.
4. **Registros** de acuerdos, y de gaps y supuestos: se abren desde el recorrido y se pueden usar en cualquier momento.

Desde el catálogo se llega al contenido de cualquier paso en dos acciones: elegir el producto y elegir el paso.

### Volver a ver los productos de ejemplo

Los ejemplos solo se cargan en la primera apertura. Para verlos otra vez, detén la herramienta y borra la carpeta de datos (por defecto, `herramienta/datos/`; **se perderá todo lo que hayas introducido**), o arranca con otra carpeta vacía:

```
HERRAMIENTA_DATOS=/ruta/a/otra-carpeta npm start
```

El contenido de los ejemplos está en `proceso/ejemplos.json`; su formato se describe en [`docs/formato-datos.md`](docs/formato-datos.md#u4--catálogo).

## Pantalla del catálogo (U4)

| Pantalla | Dirección | Qué muestra |
|---|---|---|
| Catálogo | `/` | Los productos en orden de creación, cada uno con su nombre (enlace a su recorrido) y su paso actual en texto. **Crear producto** con el nombre (obligatorio, hasta 100 caracteres; si no es válido, el formulario lo explica y conserva lo escrito), **Cambiar nombre** y **Borrar** con un diálogo de confirmación que nombra el producto. Si no hay productos, lo dice y ofrece crear uno. |

## Pantallas del recorrido (U3)

| Pantalla | Dirección | Qué muestra |
|---|---|---|
| Recorrido | `recorrido.html?producto=<id>` | Los 10 pasos en orden con su estado en texto (Pendiente, En curso o Completo), el paso actual y, para cada paso no habilitado, qué pasos faltan por completar. Enlaces a cada paso, a los dos registros y al catálogo. |
| Paso | `paso.html?producto=<id>&paso=<idPaso>` | El formulario del paso construido desde la definición: campos, elementos que se añaden y se quitan, checklist y enlace o adjunto en los pasos visuales. **Guardar** guarda sin marcar el paso como Completo; el estado se cambia aparte. Un paso no habilitado se muestra de solo lectura e indica qué falta completar. |
| Registros | `registros.html?producto=<id>&registro=<idRegistro>` | Las entradas de acuerdos, o de gaps y supuestos, con añadir, editar y quitar. Siempre se pueden usar. |

Se llega a ellas desde el catálogo. El JavaScript y el CSS de las pantallas
están en `public/js/` y `public/css/`; la lógica que no toca la página
(`public/js/logica-*.js`) se prueba con `node --test`.

## Seguridad

- El servidor escucha solo en `127.0.0.1`: no es accesible desde otros equipos.
- Solo acepta peticiones dirigidas a su propio origen (`127.0.0.1:<puerto>` o `localhost:<puerto>`). Los cambios que lleguen desde otra página web se rechazan.
- Los adjuntos se guardan siempre dentro de la carpeta de datos y se descargan como archivo; el navegador nunca los abre ni los ejecuta.
- Las páginas solo pueden cargar recursos de la propia herramienta (cabecera `Content-Security-Policy: default-src 'self'`). El JavaScript y el CSS de las pantallas van en archivos de `public/`, no en línea.

## Pruebas

Dentro de la carpeta `herramienta/`:

```
npm test
```

Para ejecutar solo las pruebas de la base común (U1):

```
node --test tests/u1-base/*.test.js
```

Para las de la definición del proceso (U2):

```
node --test tests/u2-definicion-proceso/*.test.js
```

Para las del recorrido (U3):

```
node --test tests/u3-recorrido/*.test.js
```

Para las del catálogo (U4):

```
node --test tests/u4-catalogo/*.test.js
```

Desde la raíz del repositorio también funciona `node --test herramienta/tests/u1-base/*.test.js` (o `u2-definicion-proceso`, `u3-recorrido` o `u4-catalogo`).

> Nota: a partir de Node 21, `node --test` ya no acepta una carpeta (`node --test tests/u1-base/`), solo archivos o patrones. Por eso los comandos usan `*.test.js`, que funciona en Node 20 y en las versiones posteriores.

## Estructura

```
herramienta/
  package.json
  src/
    main.js          raíz de composición: carga la definición, crea el almacén, registra las rutas y arranca
    base/            base común (U1)
      config.js      puerto, host 127.0.0.1, carpeta de datos y ubicación de la definición
      almacen.js     guardado completo o nulo, lectura, borrado, apartar y restaurar
      adjuntos.js    saneado de nombres, guardado y lectura de adjuntos
      servidor.js    servidor HTTP, registro de rutas, archivos estáticos y control de origen
      errores.js     tipos de error de la base
    definicion/      definición del proceso (U2): lectura, validación y consultas de solo lectura
    recorrido/       recorrido de cada producto (U3)
      modelo.js      forma del recorrido y validación del contenido contra la definición
      reglas.js      habilitación en cadena, paso actual y cambios (funciones puras)
      servicio.js    lectura y guardado con el almacén; operaciones para U4
      rutas.js       API local del recorrido
      index.js       lo que pueden usar main.js y U4
    catalogo/        catálogo de productos (U4)
      nombre.js      reglas del nombre y del id de un producto
      modelo.js      forma de catalogo/productos.json y de la marca de primera apertura
      servicio.js    listar, crear, renombrar y borrar, con deshacer si algo falla a medias
      ejemplos.js    carga de los productos de ejemplo en la primera apertura
      rutas.js       API local del catálogo
      index.js       lo que puede usar main.js
  proceso/
    definicion-proceso.json   los 10 pasos y los 2 registros transversales (se edita a mano)
    ejemplos.json             los tres productos ficticios de la primera apertura (se edita a mano)
  public/            pantallas (archivos estáticos): catálogo (index.html), recorrido, paso y registros, con js/ y css/
  tests/             pruebas (ejecutor integrado de Node)
  docs/              documentación del formato de datos
```

## Para las siguientes unidades

- Las rutas se registran en `src/main.js` con `rutas.registrar(metodo, patron, manejador, opciones)`. El patrón admite parámetros (`/api/productos/:id`). El manejador recibe `{ metodo, ruta, parametros, consulta, cuerpo, cabeceras }` y devuelve los datos; el servidor responde `{ ok: true, datos }`. Para otro código de estado se devuelve `conEstado(201, datos)` y para una descarga, `descarga({ contenido, nombre })`.
- Los cuerpos JSON deben enviarse con `Content-Type: application/json` (máximo 1 MB). Para subir un adjunto, registra la ruta con `{ cuerpo: "binario" }` y envíalo con `Content-Type: application/octet-stream` (máximo 10 MB).
- La definición del proceso llega a `arrancar()` ya validada (`aplicacion.definicion`). Se consulta con `pasos()`, `paso(id)`, `registros()`, `registro(id)`, `origenesDirectos(id)` y `origenesTodos(id)`; un id desconocido lanza `ErrorDefinicion`. Es de solo lectura.
- Toda escritura de archivos pasa por el almacén (`almacen.guardar`, `almacen.borrar`, `almacen.apartar`...) o por los adjuntos. Para deshacer una operación compuesta, usa el contenido anterior que devuelven `guardar` y `borrar` con `restaurar`, o `apartar` con `recuperar` y `descartar`.
- **Recorrido (U3) para U4.** `arrancar()` devuelve `recorridos`, el servicio del recorrido. El catálogo usa estas operaciones (todas asíncronas; un fallo lanza `ErrorRecorrido` con `codigo`, mensaje en español y `estado` HTTP sugerido, o el error del almacén tal cual):

  | Operación | Qué hace |
  |---|---|
  | `crear(idProducto)` | Crea el recorrido vacío (10 pasos en Pendiente). Devuelve `{ idProducto, recorrido }`, lo que necesita `deshacerCreacion`. Si ya existe, lanza `YA_EXISTE`. |
  | `sembrar(idProducto, datos)` | Crea el recorrido de un producto de ejemplo con `datos = { pasos: { <idPaso>: { estado, contenido } }, registros: { <idRegistro>: { <tipo>: [ { campos } ] } } }`. Rechaza (`SIEMBRA_INCOHERENTE`) un paso con estado o contenido cuyos orígenes no estén en Completo, y no admite adjuntos, solo enlaces. Devuelve lo mismo que `crear`. |
  | `deshacerCreacion(creacion)` | Deshace `crear` o `sembrar`: borra la carpeta del recorrido. Acepta lo que devolvieron o el id. |
  | `borrar(idProducto)` | Aparta el recorrido con sus adjuntos y devuelve la marca. |
  | `recuperarBorrado(marca)` / `confirmarBorrado(marca)` | Devuelve el recorrido apartado a su sitio, o lo borra de verdad. |
  | `existe(idProducto)` | Indica si el producto tiene recorrido. |
  | `pasoActual(idProducto)` | `{ completo: false, id, nombre }` del primer paso no Completo, o `{ completo: true, id: null, nombre: "Completo" }`. |

  El id del producto solo puede tener letras, números, `-` y `_` (máximo 64 caracteres).
- **Nombre del producto en las pantallas de U3.** `registrarRutasRecorrido` recibe el proveedor opcional `nombreDe(idProducto)` (puede devolver una promesa). En `src/main.js` es `catalogo.nombreDe`, que busca el nombre en el catálogo de U4; si el producto no está en el catálogo devuelve `null` y las pantallas muestran "Producto <id>". Así U3 no depende de U4.
- **Catálogo (U4).** `arrancar()` devuelve también `catalogo`, el servicio del catálogo: `listar()`, `obtener(id)`, `crear(nombre)`, `renombrar(id, nombre)`, `borrar(id)` y `nombreDe(id)`. Un fallo lanza `ErrorCatalogo` con `codigo`, mensaje en español y `estado` HTTP sugerido (400 si el nombre no es válido, 404 si el producto no existe). Su API local:

  | Ruta | Qué hace |
  |---|---|
  | `GET /api/productos` | Productos en orden de creación con `idProducto`, `nombre`, `creadoEn`, `actualizadoEn` y `pasoActual` (el de U3). |
  | `POST /api/productos` | Crea un producto con `{ "nombre": "..." }` y su recorrido vacío. Responde 201. |
  | `GET /api/productos/:id` | Un producto con su paso actual. |
  | `PUT /api/productos/:id` | Cambia el nombre: `{ "nombre": "..." }`. |
  | `DELETE /api/productos/:id` | Borra el producto con su recorrido y todo su contenido. |
