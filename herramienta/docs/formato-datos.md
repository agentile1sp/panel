# Formato de la carpeta de datos

Este documento describe cómo guarda la herramienta sus datos, para que una persona o
otro proceso (por ejemplo, AI-DLC) pueda leerlos sin pasar por la herramienta
(ADR-005). La base común (U1) define las reglas generales; cada unidad documenta
sus propios archivos en su sección.

## Dónde está

- Por defecto, en `herramienta/datos/`. Se puede cambiar con la variable de entorno
  `HERRAMIENTA_DATOS`.
- La carpeta se crea al arrancar si no existe. Está ignorada por git.

## Reglas generales

- **Archivos JSON legibles.** Cada dato se guarda como un archivo `.json` en UTF-8,
  con sangría de 2 espacios y un salto de línea al final. Los acentos y los
  símbolos se guardan tal cual, sin escapar.
- **Rutas.** Todas las rutas son relativas a la carpeta de datos y se separan con
  `/`. Ningún tramo de una ruta empieza por punto: los nombres que empiezan por
  punto están reservados para la propia herramienta.
- **Escritura completa o nula (NFR1).** Cada escritura crea primero un archivo
  temporal oculto en la misma carpeta (`.<nombre>.<aleatorio>.tmp`), lo fuerza a
  disco y después lo renombra sobre el definitivo. Si algo falla, el archivo
  anterior queda intacto. Un archivo temporal que se haya quedado tras un corte
  de luz se puede borrar sin perder nada.
- **Archivos dañados.** Si un archivo no es JSON válido, la herramienta no lo
  sobrescribe: avisa con el nombre del archivo para que se pueda revisar a mano.

## Elementos apartados: `.apartado/`

Cuando una operación compuesta necesita poder deshacerse (por ejemplo, borrar un
producto con todo su contenido), la herramienta no borra directamente: mueve el
archivo o la carpeta a `.apartado/<marca>/`.

```
.apartado/
  1760227200000-1a2b3c4d/      marca: milisegundos desde 1970 y 8 caracteres aleatorios
    apartado.json              { "ruta": "productos/p1", "fecha": "2026-10-12T10:00:00.000Z" }
    contenido                  el archivo o la carpeta apartados, tal cual
```

- `apartado.json` indica la ruta original y la fecha en que se apartó.
- Si la operación termina bien, lo apartado se borra. Si se deshace, vuelve a su
  ruta original.
- Si la herramienta se cierra a mitad de una operación, lo apartado no se pierde:
  sigue en `.apartado/` y la consola avisa al arrancar. Para recuperarlo a mano,
  basta con mover `contenido` a la ruta que indica `apartado.json`.

## Adjuntos

- Los adjuntos se guardan como archivos binarios, tal como se subieron, en la
  carpeta que indique la unidad que los usa.
- El nombre del archivo es un prefijo aleatorio de 16 caracteres hexadecimales,
  un guion y el nombre original saneado: `3f9a0c1d2e4b5a69-Informe final.pdf`.
  El nombre original se recupera quitando los 17 primeros caracteres.
- El nombre saneado no contiene carpetas, separadores, caracteres de control ni
  los caracteres `< > : " | ? *`, no empieza ni termina por punto o espacio, tiene
  como máximo 100 caracteres y es `adjunto` si no queda nada.
- Tamaño máximo: 10 MB por adjunto.

## Archivos de cada unidad

### U2 · Definición del proceso

La definición del proceso no está en la carpeta de datos: es un archivo del
propio proyecto que describe los 10 pasos y los 2 registros transversales
(ADR-003). La herramienta la lee directamente, sin pasar por el almacén.

- **Dónde vive:** `herramienta/proceso/definicion-proceso.json`, en UTF-8 y con
  sangría de 2 espacios. Se puede usar otro archivo con la variable de entorno
  `HERRAMIENTA_DEFINICION` (útil para las pruebas).
- **Se edita a mano y la herramienta solo la lee (FR5.2).** No hay ninguna
  pantalla ni ruta para agregar, mover, cambiar o eliminar pasos. Sus campos se
  escribieron a mano a partir de las plantillas de
  `docs/proceso-producto/plantillas/`.
- **Se valida al arrancar.** Si el archivo falta, no es JSON válido o no cumple
  las reglas de abajo, la herramienta no arranca y la consola nombra el archivo
  y todos los problemas encontrados.

#### Forma del archivo

```
{
  "version": 1,
  "pasos": [ { paso }, ... ],          exactamente 10
  "registros": [ { registro }, ... ]   exactamente "acuerdos" y "gaps-y-supuestos"
}
```

Cada **paso** tiene:

| Clave | Qué es |
|---|---|
| `id` | Id estable en minúsculas con guiones (ver la tabla de ids). |
| `orden` | Número del 1 al 10, sin repetir. |
| `nombre` | Nombre que se muestra. |
| `tipo` | `texto`, `estructurado` o `visual`. |
| `origenes` | Ids de los pasos de los que toma datos. Deben existir y ser anteriores. Vacío en el paso 1. |
| `plantilla` | Nombre del archivo de la plantilla en `docs/proceso-producto/plantillas/` (debe existir). |
| `campos` | Campos que se rellenan una sola vez en el paso (puede estar vacío salvo en los pasos de texto). |
| `elementos` | Solo en los pasos estructurados: tipos de elemento que se repiten (al menos uno). |
| `checklist` | Solo en los pasos visuales: puntos de comprobación, cada uno con `id` y `texto`. |
| `evidencia` | Solo en los pasos visuales: siempre `"enlace-o-adjunto"`. |

Cada **tipo de elemento** tiene `id`, `nombre`, `plantilla` y `campos` (al menos
uno). Por ejemplo, el paso 5 tiene `ficha-capacidad` y `ficha-instancia`, y el
paso 7 tiene `actividad`, `historia`, `fila-crud`, `fila-estados` y
`fila-navegacion`.

Cada **campo** tiene `id`, `nombre`, `tipo` (`texto` para una línea,
`texto-largo` para varias líneas o `lista` para una lista de líneas) y, si hace
falta, `ayuda` con lo que pide la plantilla.

Cada **registro** tiene `id`, `nombre`, `plantilla`, `campos` (vacío en esta
versión) y `elementos` con los tipos de entrada que se añaden al registro:
`acuerdo` en `acuerdos`, y `gap` y `supuesto` en `gaps-y-supuestos`.

Los ids de campos, tipos de elemento y puntos de checklist no se repiten dentro
de su lista.

#### Ids estables

El recorrido de cada producto (U3) guarda su contenido con estos ids, así que
no se deben cambiar:

| Orden | Paso | Id | Tipo | Toma de |
|---|---|---|---|---|
| 1 | Hipótesis | `hipotesis` | texto | (la idea escogida, que no se registra) |
| 2 | Línea base | `linea-base` | texto | 1 |
| 3 | Walking skeleton | `walking-skeleton` | texto | 1, 2 |
| 4 | Mapa de piezas | `mapa-de-piezas` | estructurado | 3 |
| 5 | Fichas | `fichas` | estructurado | 3, 4 |
| 6 | User flow | `user-flow` | visual | 5 |
| 7 | Story map | `story-map` | estructurado | 4, 5, 6 |
| 8 | Wireframes | `wireframes` | visual | 6, 7 |
| 9 | Cierre del alcance | `cierre-del-alcance` | estructurado | 1 a 8 |
| 10 | Mockups | `mockups` | visual | 8, 9 |
| — | Acuerdos | `acuerdos` | registro | — |
| — | Gaps y supuestos | `gaps-y-supuestos` | registro | — |

Los orígenes indirectos (por ejemplo, el story map depende en cadena de los
pasos 1 a 6) los calcula la herramienta a partir de `origenes`; no se escriben
en el archivo (ADR-004).

### U3 · Recorrido

Cada producto tiene su propio recorrido por los 10 pasos: el estado y el
contenido de cada paso, sus registros de acuerdos y de gaps y supuestos
(ADR-002) y los adjuntos de sus pasos visuales.

```
recorridos/
  <idProducto>/
    recorrido.json                         pasos y registros del producto
    adjuntos/
      3f9a0c1d2e4b5a69-Flujo final.png     adjuntos de los pasos visuales
```

- **Un archivo por producto.** Cada cambio (guardar contenido, cambiar un
  estado, añadir una entrada a un registro...) reescribe `recorrido.json`
  completo con la escritura completa o nula de U1: o queda el cambio entero o
  queda el archivo anterior (NFR1).
- **Id del producto.** `<idProducto>` lo pone el catálogo (U4). Solo puede
  tener letras, números, guiones (`-`) y guiones bajos (`_`), empieza por letra
  o número y tiene como máximo 64 caracteres.
- **Ids de los pasos, registros, campos y tipos de elemento.** Son los ids
  estables de la definición del proceso (tabla de la sección U2).
- **Nada se copia entre pasos (FR4.6, DL-09).** El contenido de cada paso es
  solo lo que se introdujo en ese paso.

#### Forma de `recorrido.json`

```
{
  "version": 1,
  "idProducto": "p1",
  "pasos": {
    "<idPaso>": {
      "estado": "pendiente" | "en-curso" | "completo",
      "contenido": { contenido },
      "actualizadoEn": "2026-10-12T10:00:00.000Z" | null
    },
    ...                                   los 10 pasos de la definición
  },
  "registros": {
    "acuerdos": { "acuerdo": [ { entrada }, ... ] },
    "gaps-y-supuestos": { "gap": [ { entrada }, ... ], "supuesto": [ { entrada }, ... ] }
  }
}
```

| Estado | Texto en pantalla |
|---|---|
| `pendiente` | Pendiente |
| `en-curso` | En curso |
| `completo` | Completo |

Un producto nuevo empieza con los 10 pasos en `pendiente`, el contenido vacío y
los registros sin entradas (FR2.2). `actualizadoEn` es la fecha del último
cambio de contenido o de estado del paso, o `null` si nunca ha cambiado.

El **contenido** de un paso tiene siempre estas cuatro partes:

```
{
  "campos": { "<idCampo>": "texto" | ["línea", ...] },
  "elementos": { "<idTipo>": [ { "id": "...", "campos": { "<idCampo>": ... } }, ... ] },
  "checklist": { "<idPunto>": true | false },
  "evidencia": null | { "tipo": "enlace", "url": "https://..." }
                    | { "tipo": "adjunto", "idAdjunto": "3f9a0c1d2e4b5a69-Flujo final.png", "nombre": "Flujo final.png" }
}
```

- `campos` lleva todos los campos del paso: los de tipo `texto` y `texto-largo`
  son un texto (vacío si no se ha escrito nada) y los de tipo `lista`, una lista
  de textos (vacía si no hay ninguno). El texto se guarda tal cual, con comillas,
  saltos de línea y caracteres especiales.
- `elementos` solo tiene listas en los pasos estructurados (4, 5, 7 y 9), una
  por tipo de elemento; cada elemento tiene un `id` propio y sus campos. En los
  demás pasos es `{}`.
- `checklist` solo tiene casillas en los pasos visuales (6, 8 y 10). En los
  demás pasos es `{}`.
- `evidencia` solo puede tener valor en los pasos visuales: un enlace (solo
  `http://` o `https://`) o un adjunto. `idAdjunto` es el nombre del archivo
  dentro de `adjuntos/` y `nombre`, el nombre original saneado. En los demás
  pasos es `null`.

Cada **entrada** de un registro es:

```
{
  "id": "6f1c2a9e-...",
  "campos": { "<idCampo>": "texto" | ["línea", ...] },
  "creadaEn": "2026-10-12T10:00:00.000Z",
  "actualizadaEn": "2026-10-12T10:05:00.000Z"
}
```

con los campos del tipo de elemento del registro (por ejemplo, `codigo`,
`tema`, `decision`, `detalle`, `motivo` y `paso-del-proceso` en un `acuerdo`).

#### Reglas que aplica la herramienta

- Un paso está **habilitado** si todos sus pasos de origen, directos e
  indirectos, están en `completo` (ADR-004). El paso 1 y los registros lo están
  siempre. En un paso no habilitado no se puede guardar contenido ni cambiar el
  estado. Si un origen deja de estar en `completo`, los pasos que dependen de él
  conservan su contenido y su estado.
- El **paso actual** de un producto es el primer paso, en orden, que no está en
  `completo`, o "Completo" si lo están todos (ADR-007). No se guarda: se calcula.
- Guardar el contenido de un paso no cambia su estado (FR4.7).
- Si se sustituye un adjunto (por otro adjunto o por un enlace), el archivo que
  ya no se usa se borra de `adjuntos/`.
- Al borrar un producto, U4 aparta la carpeta `recorridos/<idProducto>/`
  completa a `.apartado/` y, si la operación termina bien, la borra.

#### Archivos dañados

Si `recorrido.json` no tiene la forma de arriba (por ejemplo, falta `pasos` o un
paso tiene un estado desconocido), la herramienta no lo sobrescribe: responde
con un error que nombra el archivo para que se pueda revisar a mano. Si solo le
falta algún paso o registro (por ejemplo, porque se escribió a mano), lo
completa vacío al leerlo y lo guarda así en el siguiente cambio.

### U4 · Catálogo

El catálogo guarda la lista de productos y la marca de primera apertura. El
contenido de cada producto (sus pasos y registros) está en su recorrido (U3).

```
catalogo/
  productos.json            la lista de productos, en orden de creación
  primera-apertura.json     marca de primera apertura (ADR-006)
```

#### Forma de `productos.json`

```
{
  "version": 1,
  "productos": [
    {
      "idProducto": "p-3f9a0c1d2e4b",
      "nombre": "Recordatorio de agua",
      "creadoEn": "2026-10-12T10:00:00.000Z",
      "actualizadoEn": "2026-10-12T10:05:00.000Z"
    },
    ...
  ]
}
```

- **`idProducto`** lo pone la herramienta al crear el producto: `p-` y 12
  caracteres hexadecimales aleatorios. Es también el nombre de su carpeta en
  `recorridos/<idProducto>/`. No se repite dentro de la lista.
- **`nombre`** es obligatorio: sin espacios a los lados, no vacío ni solo
  espacios y de hasta 100 caracteres. Se guarda tal cual, con comillas, acentos
  o emojis. Dos productos pueden llamarse igual.
- **`creadoEn`** es la fecha de creación y **`actualizadoEn`**, la del último
  cambio de nombre.
- **No se guarda el paso actual.** Se pide al recorrido (U3) cada vez que se
  muestra el catálogo (ADR-007).
- Si el archivo no existe, el catálogo está vacío. Si existe pero no tiene la
  forma de arriba (por ejemplo, falta `productos`, un id no es válido o está
  repetido), la herramienta no lo sobrescribe: responde con un error que nombra
  el archivo para que se pueda revisar a mano.

#### Operaciones que tocan el catálogo y el recorrido

Crear y borrar un producto escriben en dos sitios. Si la segunda escritura
falla, la herramienta deshace la primera y todo queda como estaba (Q4 de Units
Generation):

| Operación | Primera escritura | Segunda escritura | Si la segunda falla |
|---|---|---|---|
| Crear | Crea `recorridos/<idProducto>/recorrido.json` | Guarda `productos.json` con el producto nuevo | Borra el recorrido creado |
| Borrar | Aparta `recorridos/<idProducto>/` a `.apartado/` | Guarda `productos.json` sin el producto | Devuelve el recorrido a su sitio |

Si el borrado termina bien, lo apartado se elimina. Si el propio deshacer
fallara, la consola muestra los dos errores; lo apartado sigue en `.apartado/` y
la herramienta avisa de ello al arrancar.

#### Marca de primera apertura: `primera-apertura.json`

```
{ "version": 1, "ejemplosCargadosEn": "2026-10-12T10:00:00.000Z" }
```

Indica que la herramienta ya se abrió alguna vez. Al arrancar:

- **Si existe la marca**, no se carga ningún ejemplo. Un ejemplo borrado no
  vuelve, y un catálogo vaciado a propósito sigue vacío (FR6.3).
- **Si no existe la marca pero sí `productos.json`** (por ejemplo, si la
  herramienta se cerró justo antes de escribir la marca), no se carga nada, no
  se toca lo que hay y solo se escribe la marca.
- **Si no existe ninguno de los dos**, se cargan los tres productos de ejemplo:
  primero sus recorridos, luego `productos.json` y por último la marca. Si algo
  falla a medias, se deshace todo y se vuelve a intentar en el siguiente
  arranque; la herramienta arranca igualmente y avisa en la consola.

Para volver a ver los ejemplos hay que borrar la carpeta de datos (o usar otra
con `HERRAMIENTA_DATOS`): la herramienta no tiene una opción para recargarlos
(ADR-006).

#### Datos de ejemplo: `proceso/ejemplos.json`

Los productos de ejemplo no están en la carpeta de datos: son un archivo del
propio proyecto, `herramienta/proceso/ejemplos.json`, que se edita a mano y que
la herramienta solo lee en la primera apertura.

```
{
  "version": 1,
  "nota": "texto libre para quien lo edite",
  "productos": [
    {
      "nombre": "Ejemplo: Recordatorio de agua",
      "recorrido": {
        "pasos": { "<idPaso>": { "estado": "completo", "contenido": { contenido } } },
        "registros": { "<idRegistro>": { "<tipo>": [ { "campos": { ... } } ] } }
      }
    },
    ...
  ]
}
```

- `nombre` sigue las reglas del nombre de un producto.
- `recorrido` usa la forma de la siembra de U3: los pasos que no aparecen
  quedan en `pendiente` y vacíos; el contenido de cada paso y los campos de cada
  entrada siguen la forma de `recorrido.json` (sección U3), sin `id` (los pone
  la herramienta). Los ids de pasos, registros, campos y tipos de elemento son
  los de la definición del proceso.
- **Respeta la habilitación en cadena** (hallazgo R-04 del diseño): un paso con
  estado distinto de `pendiente` o con contenido debe tener todos sus orígenes
  en `completo`. Si no, la carga se rechaza y se deshace.
- **Solo enlaces, no adjuntos**: los pasos visuales llevan un enlace `https://`
  como evidencia.
- Trae tres productos ficticios: uno sin empezar, uno a medias (pasos 1 a 3 en
  `completo` y el 4 en `en-curso`, con contenido) y uno con los 10 pasos en
  `completo` y contenido en cada uno.
