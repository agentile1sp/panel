# Plan de Bolts: herramienta de producto del panel

Un **Bolt** es una pasada de construcción sobre una parte del trabajo que termina en algo que funciona y se puede probar. Este plan ordena los Bolts que construyen las cuatro unidades de `inception/units-generation/unit-of-work.md`, respetando el grafo de `unit-of-work-dependency.md`. Parte de las respuestas de `delivery-planning-questions.md`.

## Resumen

| Orden | Bolt | Unidad | Requisitos | Complejidad | Walking skeleton |
|---|---|---|---|---|---|
| 1 | B1 · Base común | U1 `u1-base` | FR6, FR6.1, NFR1 | M | No |
| 2 | B2 · Definición del proceso | U2 `u2-definicion-proceso` | FR5, FR5.1, FR5.2 | S | No |
| 3 | B3 · Recorrido | U3 `u3-recorrido` | FR1.2, FR2 a FR4.7 (21 requisitos), NFR2, NFR4 | L | No |
| 4 | B4 · Catálogo | U4 `u4-catalogo` | FR1 (salvo FR1.2), FR6.2, FR6.3, NFR3 | M | No |

Un Bolt por unidad (Q1). Los cuatro se construyen uno tras otro, desde esta sesión. El **walking skeleton** (una primera porción mínima de punta a punta que demuestra que todo encaja) no se usa en este plan.

Este documento explica el orden y lo que demuestra cada Bolt. La construcción sigue el grafo de Units Generation: U1 y U2 no dependen entre sí, así que también podrían ir en el orden inverso.

## Condiciones comunes a todos los Bolts

Un Bolt está terminado cuando, además de lo propio de cada uno:
- El código de la unidad está completo y se ejecuta, sin partes a medio hacer.
- Hay una prueba unitaria por requisito de la unidad, con al menos un caso de éxito por componente, y todas pasan (NFR5). Las pruebas de los Bolts anteriores siguen pasando.
- Los errores en el guardado y en la lectura de archivos se devuelven o se avisan; nunca se pierden en silencio.
- El comando de comprobación de la intención pasa. Se elige al terminar B1, cuando ya exista el proyecto (Q3).

## B1 · Base común (U1 `u1-base`)

- **Qué incluye:** el servidor local que se arranca con un comando, el guardado completo o nulo en la carpeta de datos, la lectura y el borrado, el deshacer para las operaciones compuestas, los adjuntos y el documento del formato de los datos.
- **Terminado cuando:**
  - La aplicación arranca con un comando y responde solo en el propio equipo y a su propio origen.
  - Un guardado que falla deja el archivo anterior intacto y devuelve el error (NFR1).
  - Lo guardado se conserva al cerrar y volver a abrir la aplicación (FR6.1).
  - Un nombre de adjunto con rutas como `../` nunca escribe fuera de la carpeta de datos.
  - El formato de los archivos de datos está documentado.
- **Qué demuestra:** que el guardado en archivos legibles es fiable sin base de datos, y que la elección de tecnología aguanta el resto del plan.
- **Demo:** arrancar la aplicación, guardar un dato de prueba, cerrarla, volver a abrirla y ver el dato; forzar un fallo de escritura y ver que el dato anterior sigue ahí.

## B2 · Definición del proceso (U2 `u2-definicion-proceso`)

- **Qué incluye:** el archivo de definición con los 10 pasos y los 2 registros transversales, escrito a mano desde `docs/proceso-producto/plantillas/`, y el código que lo lee, lo valida y resuelve los orígenes directos e indirectos de cada paso.
- **Terminado cuando:**
  - La definición contiene los 10 pasos y los 2 registros con su orden, tipo, pasos de origen, plantilla y campos, como en la tabla de `requirements.md` (AC5.1).
  - Los pasos con varios tipos de elemento los recogen todos: fichas de capacidad y de instancia en el paso 5; historias y las tablas CRUD, de estados y de navegación en el paso 7.
  - Con la definición ausente o inválida, la aplicación no arranca y el error nombra el archivo y el problema.
  - No existe ninguna forma de cambiar la definición desde la herramienta (FR5.2).
- **Qué demuestra:** que los campos de las plantillas se pueden describir como datos sin tocar el código, que es lo que deja abierta la puerta a cambiar el proceso más adelante.
- **Demo:** arrancar con la definición correcta; estropear un paso de origen en el archivo y ver que la aplicación se niega a arrancar con un mensaje claro.

## B3 · Recorrido (U3 `u3-recorrido`)

- **Qué incluye:** estados y contenido de cada paso, habilitación en cadena y bloqueo, cálculo del paso actual, pasos de texto, estructurados y visuales, registros de acuerdos y de gaps y supuestos, las operaciones que usará el catálogo y las pantallas de recorrido, de paso y de registros.
- **Terminado cuando:**
  - Un producto nuevo tiene los 10 pasos en Pendiente (AC2.1).
  - Un paso sin sus orígenes en Completo no se puede editar y nombra lo que falta (AC3.1); al devolver un origen a En curso, los dependientes conservan su contenido y quedan bloqueados (AC3.3).
  - Se pueden añadir, editar y quitar varios elementos en los pasos estructurados (AC4.1, AC4.2), y guardar checklist más enlace o adjunto en los visuales (AC4.3).
  - El texto con comillas, saltos de línea y caracteres especiales se ve igual al volver a abrirlo (AC4.4).
  - Los registros transversales admiten entradas aunque ningún paso esté completo (AC3.4).
  - La interfaz está en español, el estado se muestra con texto y todo se hace con el teclado (NFR2, NFR4).
- **Qué demuestra:** que las reglas de habilitación en cadena y los pasos con varios elementos funcionan con datos introducidos a mano, que es el corazón de la herramienta.
- **Demo:** con un producto de prueba creado a mano en la carpeta de datos, recorrer los pasos 1 a 5 marcándolos como Completo, devolver el paso 3 a En curso y ver los pasos 4 y 5 bloqueados con su contenido intacto.

## B4 · Catálogo (U4 `u4-catalogo`)

- **Qué incluye:** crear, renombrar y borrar productos; el catálogo con el paso actual de cada uno; las operaciones compuestas con el recorrido y su deshacer; y la carga de los tres productos ficticios en la primera apertura.
- **Terminado cuando:**
  - El catálogo muestra cada producto con su nombre y su paso actual (AC1.1, AC1.2), y un mensaje con la opción de crear cuando está vacío (AC1.5).
  - Un nombre vacío o solo con espacios no crea ni renombra el producto, y no se pierde lo escrito (AC1.3).
  - Borrar pide confirmación nombrando el producto, y cancelar no cambia nada (AC1.4).
  - Si falla la segunda escritura al crear o borrar un producto o al cargar los ejemplos, se deshace la primera y todo queda como estaba.
  - Los tres ejemplos aparecen solo en la primera apertura y un ejemplo borrado no vuelve (AC6.2, AC6.3).
  - Desde el catálogo se llega al contenido de cualquier paso en dos acciones (NFR3).
  - Se puede llevar un producto ficticio por los 10 pasos hasta que el catálogo lo muestre como "Completo" (AC2.2, criterio de éxito E1).
- **Qué demuestra:** que la herramienta completa cumple los criterios de éxito E1, E3 y E4: ver de un vistazo en qué paso está cada producto y qué se creó en cada uno.
- **Demo:** abrir la herramienta por primera vez y ver los tres productos ficticios; crear un producto, entrar a su recorrido, completar un paso, volver al catálogo y ver su nuevo paso actual; borrarlo y comprobar que no vuelve.
