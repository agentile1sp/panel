# Requisitos: herramienta de producto del panel

Fuentes: la descripción inicial; la declaración de intención (`ideation/intent-capture/intent-statement.md`); el documento de alcance (`ideation/scope-definition/scope-document.md`); el brief de la iniciativa y el registro de decisiones (`ideation/approval-handoff/`), que mandan sobre los dos anteriores; y las respuestas de `requirements-analysis-questions.md`. El proceso de producto y sus plantillas están en `docs/proceso-producto/` (`LEEME.md` y `plantillas/`).

## Análisis de la intención

- **Objetivo:** ver de un vistazo en qué paso de la etapa 3 · Producto está cada producto y qué se produjo en cada paso (intent-statement, problema A).
- **Criterio rector:** todo se introduce a mano, para que la primera versión sea sencilla (DL-09). Ningún paso calcula ni copia datos de otro.
- **Criterios de éxito vigentes:** E1 (recorrido completo de un producto ficticio por los 10 pasos), E3 (paso actual visible en el catálogo) y E4 (estado de los 10 pasos y lo creado en cada uno). E2 y E5 salieron de esta versión (DL-09, DL-10).
- **Tipo de trabajo:** proyecto nuevo, sin código previo; herramienta local de un solo usuario; complejidad estándar.

## El proceso que recorre la herramienta

El proceso es fijo en esta versión (DL-06). Sus 10 pasos, en orden, con los pasos de los que toman datos (de `docs/proceso-producto/LEEME.md`):

| Paso | Nombre | Tipo | Toma datos de | Plantilla |
|---|---|---|---|---|
| 1 | Hipótesis | Texto con estructura mínima | La idea escogida (no se registra en la herramienta, Q9) | `01-hipotesis.md` |
| 2 | Línea base | Texto con estructura mínima | Paso 1 | `02-linea-base.md` |
| 3 | Walking skeleton | Texto con estructura mínima | Pasos 1 y 2 | `03-walking-skeleton.md` |
| 4 | Mapa de piezas | Estructurado | Paso 3 | `04-mapa-de-piezas.md` |
| 5 | Fichas (de capacidad y de instancia) | Estructurado | Pasos 3 y 4 | `05a-ficha-capacidad.md`, `05b-ficha-instancia.md` |
| 6 | User flow | Visual, con checklist | Paso 5 | `06-user-flow.md` |
| 7 | Story map (incluye tabla CRUD, tabla de estados y tabla de navegación) | Estructurado | Pasos 4, 5 y 6 | `07-story-map.md` |
| 8 | Wireframes | Visual, con checklist | Pasos 6 y 7 | `08-wireframes.md` |
| 9 | Cierre del alcance | Estructurado | Pasos 1 a 8 | `09-cierre-del-alcance.md` |
| 10 | Mockups | Visual, con checklist | Pasos 8 y 9 | `10-mockups.md` |
| — | Acuerdos | Registro que se añade | Siempre disponible (Q10) | `transversal-acuerdos.md` |
| — | Gaps y supuestos | Registro que se revisa | Siempre disponible (Q10) | `transversal-gaps-y-supuestos.md` |

## Requisitos funcionales

### FR1. Catálogo de productos

Origen: scope-document D1, D11; intent-statement E3; Q5, Q6.

- **FR1.1** La herramienta muestra un catálogo con todos los productos; cada producto aparece con su nombre y su paso actual.
- **FR1.2** El paso actual de un producto es el primer paso, en el orden del proceso, que no está en estado Completo. Si los 10 pasos están en Completo, el catálogo muestra "Completo".
- **FR1.3** La persona usuaria puede crear un producto indicando solo su nombre (Q5). El nombre es obligatorio y no puede quedar vacío ni ser solo espacios.
- **FR1.4** La persona usuaria puede cambiar el nombre de un producto.
- **FR1.5** La persona usuaria puede borrar un producto. Antes de borrarlo, la herramienta pide confirmación nombrando el producto; al confirmar, se borran el producto y todo su contenido.
- **FR1.6** Al elegir un producto del catálogo, la herramienta abre su recorrido.
- **FR1.7** Si no hay productos, el catálogo lo dice y ofrece crear uno.

Criterios de aceptación:
- **AC1.1** Dado un catálogo con tres productos, cuando lo abro, entonces veo los tres con su nombre y su paso actual.
- **AC1.2** Dado un producto con los pasos 1 a 3 en Completo y el 4 en En curso, cuando miro el catálogo, entonces su paso actual es "Mapa de piezas".
- **AC1.3** Dado el formulario de nuevo producto, cuando intento crearlo con el nombre vacío, entonces la herramienta no lo crea y me indica que el nombre es obligatorio, sin perder lo que escribí.
- **AC1.4** Dado un producto, cuando pido borrarlo y cancelo la confirmación, entonces el producto sigue en el catálogo sin cambios.
- **AC1.5** Dado un catálogo sin productos, cuando lo abro, entonces veo un mensaje que lo indica y la opción de crear un producto.

### FR2. Recorrido de un producto

Origen: scope-document D2; intent-statement E1, E4.

- **FR2.1** El recorrido muestra los 10 pasos del proceso en orden, cada uno con su nombre y su estado.
- **FR2.2** Un producto nuevo empieza con los 10 pasos en estado Pendiente.
- **FR2.3** Desde el recorrido se puede abrir cualquier paso para ver lo que se creó en él.
- **FR2.4** Desde el recorrido se accede siempre a los registros de acuerdos, y de gaps y supuestos (Q10).
- **FR2.5** El recorrido indica qué pasos están habilitados y, para cada paso no habilitado, de qué pasos depende.

Criterios de aceptación:
- **AC2.1** Dado un producto recién creado, cuando abro su recorrido, entonces veo los 10 pasos en orden y todos en Pendiente.
- **AC2.2** Dado un producto ficticio, cuando lo llevo por los 10 pasos introduciendo su contenido y marcando cada uno como Completo, entonces al terminar el recorrido muestra los 10 pasos en Completo y el catálogo muestra el producto como "Completo" (criterio E1).
- **AC2.3** Dado un producto a medias, cuando abro un paso en Completo, entonces veo el contenido que se introdujo en él (criterio E4).

### FR3. Estados y orden de los pasos

Origen: Q1, Q3, Q4, Q10; DL-09.

- **FR3.1** Cada paso tiene uno de tres estados: Pendiente, En curso o Completo (Q1).
- **FR3.2** La persona usuaria cambia a mano el estado de un paso habilitado (Q4); la herramienta no lo cambia sola.
- **FR3.3** Un paso está habilitado cuando todos los pasos de los que toma datos están en Completo (Q3). El paso 1 está siempre habilitado, porque solo toma datos de la idea escogida, que no se registra (Q9). Los registros transversales están siempre habilitados (Q10).
- **FR3.4** En un paso no habilitado no se puede editar el contenido ni cambiar el estado; la herramienta indica qué pasos faltan por completar.
- **FR3.5** Si un paso de origen deja de estar en Completo, los pasos que dependen de él conservan su contenido y su estado, pero no se pueden editar hasta que el paso de origen vuelva a Completo.

Criterios de aceptación:
- **AC3.1** Dado un producto con el paso 3 en En curso, cuando intento abrir el paso 4 para editarlo, entonces no puedo y la herramienta me indica que falta completar "Walking skeleton".
- **AC3.2** Dado un producto con los pasos 1 a 3 en Completo, cuando abro el paso 4, entonces puedo editar su contenido y cambiar su estado.
- **AC3.3** Dado un producto con el paso 5 en Completo y el paso 6 con contenido, cuando devuelvo el paso 5 a En curso, entonces el paso 6 conserva su contenido y su estado, y deja de poder editarse.
- **AC3.4** Dado un producto recién creado, cuando abro el registro de acuerdos, entonces puedo añadir un acuerdo aunque ningún paso esté en Completo.

### FR4. Contenido de cada paso

Origen: scope-document D3, D4, D5, D6, D9; Q2; DL-09.

- **FR4.1** Cada paso se rellena con los campos de su plantilla de `docs/proceso-producto/plantillas/` (Q2).
- **FR4.2** Los pasos de texto (1, 2 y 3) recogen los campos de su plantilla como texto.
- **FR4.3** Los pasos estructurados admiten varios elementos del mismo tipo: varias piezas en el mapa de piezas, varias fichas de capacidad y de instancia, y varias actividades, historias y filas de tabla en el story map (incluidas la tabla CRUD, la tabla de estados y la tabla de navegación). Se pueden añadir, editar y quitar elementos.
- **FR4.4** Los pasos visuales (6, 8 y 10) recogen su checklist y un enlace o un archivo adjunto.
- **FR4.5** Los registros de acuerdos, y de gaps y supuestos, admiten añadir, editar y quitar entradas con los campos de su plantilla.
- **FR4.6** Ningún campo se rellena, copia ni calcula a partir de otro paso: todo el contenido lo introduce la persona usuaria (DL-09).
- **FR4.7** El contenido de un paso se guarda sin que haga falta marcarlo como Completo.

Criterios de aceptación:
- **AC4.1** Dado el paso Fichas habilitado, cuando añado dos fichas de capacidad y una de instancia, entonces las tres quedan guardadas y visibles en el paso.
- **AC4.2** Dado el paso Story map, cuando relleno la tabla CRUD con dos objetos, entonces las dos filas quedan guardadas y ningún dato aparece copiado de las fichas.
- **AC4.3** Dado el paso User flow, cuando marco su checklist y añado un enlace, entonces ambos quedan guardados y el enlace se muestra en el paso.
- **AC4.4** Dado un campo de texto con comillas, saltos de línea o caracteres especiales, cuando lo guardo y lo vuelvo a abrir, entonces se ve exactamente igual.

### FR5. Definición del proceso

Origen: scope-document D10; DL-06.

- **FR5.1** Los pasos, su orden, su tipo, los pasos de los que toman datos y su plantilla están descritos en una definición separada del código de la herramienta.
- **FR5.2** En esta versión la herramienta no ofrece ninguna forma de cambiar esa definición.

Criterios de aceptación:
- **AC5.1** Dada la definición del proceso, cuando la reviso, entonces contiene los 10 pasos y los 2 registros transversales con su orden, tipo, pasos de origen y plantilla, tal como en la tabla de esta especificación.
- **AC5.2** Dada la herramienta abierta, cuando busco una opción para agregar, mover o eliminar pasos, entonces no existe.

### FR6. Guardado y datos de ejemplo

Origen: Q7, Q8; scope-document D11.

- **FR6.1** Todo lo que se introduce se guarda en el equipo y se conserva al cerrar y volver a abrir la herramienta (Q7).
- **FR6.2** La primera vez que se abre, la herramienta trae tres productos ficticios: uno sin empezar, uno a medias y uno con los 10 pasos completos (Q8).
- **FR6.3** Los datos de ejemplo se cargan solo cuando no hay datos guardados; nunca sobrescriben lo que la persona usuaria introdujo.

Criterios de aceptación:
- **AC6.1** Dado un producto con contenido en el paso 2, cuando cierro la herramienta y la vuelvo a abrir, entonces el contenido y el estado del paso 2 siguen ahí.
- **AC6.2** Dada una instalación sin datos guardados, cuando abro la herramienta por primera vez, entonces veo los tres productos ficticios en distintos puntos del recorrido.
- **AC6.3** Dado que borré uno de los productos ficticios, cuando cierro y vuelvo a abrir la herramienta, entonces ese producto no vuelve a aparecer.

## Requisitos no funcionales

- **NFR1. Integridad de los datos.** Un guardado se aplica completo o no se aplica; si falla, se conservan los datos anteriores y la herramienta avisa del error sin dar el guardado por bueno.
- **NFR2. Idioma.** Toda la interfaz está en español.
- **NFR3. Navegación.** Desde el catálogo se llega al contenido de cualquier paso de un producto en dos acciones como máximo (elegir el producto y elegir el paso).
- **NFR4. Accesibilidad básica.** El estado de cada paso se muestra con texto, no solo con color, y todas las acciones se pueden hacer con el teclado.
- **NFR5. Pruebas.** Se aplica la postura de pruebas por defecto de `org.md` para este tipo de trabajo: una prueba unitaria por requisito, con al menos un caso de éxito por componente.

## Restricciones

- Proyecto nuevo, sin código previo (descripción inicial).
- Aplicación web que se ejecuta en local, sin despliegue, sin autenticación y sin integraciones externas (descripción inicial).
- Una sola persona usuaria (intent-statement).
- Datos de ejemplo ficticios (descripción inicial).

## Supuestos

- [assumption] FR1.2: el paso actual es el primer paso no completo en el orden del proceso. Las respuestas no lo definían, y es la lectura más directa de "en qué paso va cada producto".
- [assumption] FR3.5: si un paso de origen deja de estar Completo, los pasos que dependen de él conservan su contenido, pero no se pueden editar. Cierra el hueco que deja el orden obligatorio (Q3) sin borrar el trabajo hecho.
- [assumption] FR4.3: los pasos estructurados admiten varios elementos del mismo tipo, porque sus plantillas así lo describen (por ejemplo, una ficha por pieza).
- [assumption] FR4.4: el archivo adjunto de un paso visual se guarda en el equipo junto con el resto de los datos (FR6.1).
- [assumption] NFR3 y NFR4 no salen de una respuesta explícita. Son los mínimos razonables para una herramienta personal de uso diario y cubren el barrido de casos límite.

## Fuera de alcance

- Cualquier transformación automática de datos entre pasos, y mostrar de qué pasos tomó datos cada paso (DL-09, DL-10).
- Agregar, mover o eliminar etapas o pasos, y qué pasa con productos a mitad de recorrido si el proceso cambia (DL-06; scope-document F1, F2).
- Registrar la idea escogida (Q9).
- Las etapas 1 · Problema y 2 · Solución; la conexión en tiempo real con AI-DLC; el despliegue, la autenticación y las integraciones externas (scope-document F3 a F5).
- Edición visual del user flow, los wireframes y los mockups; otras vistas del panel; varios usuarios (scope-document F6 a F8).
- Exportar o importar datos: no se pidió en ninguna etapa.

## Preguntas abiertas

- Para Domain Design: cómo se describe la definición separada del proceso (FR5.1) y cómo se guardan los datos en el equipo (FR6.1).
- Los términos del proceso (fichas, story map, walking skeleton) se definen en `docs/proceso-producto/LEEME.md` y en `docs/proceso-producto/proceso-producto.html`; quien construya debe tenerlos a mano (hallazgo R-03 de la revisión de la intención).

## Assumptions & Open Questions

Los supuestos están en "Supuestos" y las preguntas en "Preguntas abiertas".
