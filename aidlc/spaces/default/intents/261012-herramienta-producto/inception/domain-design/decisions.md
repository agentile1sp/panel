# Decisiones de arquitectura: herramienta de producto del panel

Registro de las decisiones significativas de Domain Design. Parte de `inception/requirements-analysis/requirements.md` y de `domain-design-questions.md`; los componentes resultantes están en `components.md`.

## ADR-001: Tres piezas de software

### Status: Accepted

- **Context:** La herramienta tiene tres tipos de datos con ritmos de cambio distintos: la definición del proceso (fija), los productos (alta, renombre y baja) y el recorrido de cada producto (estados y contenido que cambian a menudo). Hay que separarlos lo justo para que cambiar el proceso no obligue a rehacer la herramienta (FR5.1) sin trocear de más una herramienta personal. Origen: Q1.
- **Decision:** Tres componentes: DefinicionProceso, Catalogo y Recorrido. El contenido y el estado de un paso viven juntos en Recorrido.
- **Consequences:** (+) Cada pieza se prueba por separado, y el proceso se puede cambiar más adelante tocando solo DefinicionProceso y su archivo. (+) Las dependencias son lineales y no tienen ciclos. (−) Recorrido es la pieza más grande, porque concentra estados, contenido, adjuntos y registros. (Seguridad) Sin impacto: no hay fronteras de confianza entre las piezas.
- **Alternatives Rejected:**
  - *Cuatro piezas, con el contenido aparte.* El contenido y el estado de un paso cambian y se guardan juntos; separarlos añadía una llamada y una frontera sin ganancia.
  - *Dos piezas.* Mezclaba los productos con la lógica de pasos; cambios en una obligarían a tocar la otra.

## ADR-002: Registros transversales por producto, propiedad de Recorrido

### Status: Accepted

- **Context:** Los requisitos no decían si los registros de acuerdos, y de gaps y supuestos, eran por producto o globales (hallazgo R-02). Las plantillas llevan el nombre del producto en el título. Origen: Q2.
- **Decision:** Cada producto tiene sus propios registros transversales (entidad EntradaTransversal en Recorrido). Se borran con el producto.
- **Consequences:** (+) El borrado de un producto (FR1.5) es completo y no deja datos huérfanos. (+) Coincide con las plantillas. (−) No hay vista de acuerdos de todos los productos a la vez, que tampoco se pidió. (Seguridad) Sin impacto.
- **Alternatives Rejected:**
  - *Un registro global.* Contradice las plantillas y obliga a decidir qué pasa con las entradas al borrar un producto.

## ADR-003: La definición del proceso es un archivo de datos legible

### Status: Accepted

- **Context:** FR5.1 pide que los pasos, su orden, sus orígenes y su plantilla vivan fuera del código, y que el proceso sea fijo en esta versión pero cambiable más adelante (DL-06). Origen: Q4.
- **Decision:** Un archivo de datos legible en el proyecto describe los 10 pasos y los 2 registros transversales: orden, nombre, tipo, pasos de origen, plantilla de referencia y campos. Sus campos se escriben a mano a partir de las plantillas de `docs/proceso-producto/plantillas/`. DefinicionProceso lo valida al arrancar.
- **Consequences:** (+) Es sencillo de leer y de cambiar a mano, y la validación al arrancar detecta errores (orígenes inexistentes o posteriores, pasos que faltan). (−) Si una plantilla cambia, hay que actualizar el archivo a mano; ninguno de los dos se deriva del otro. (Seguridad) El archivo forma parte del proyecto y solo se lee; no hay entrada de terceros.
- **Alternatives Rejected:**
  - *Leer directamente las plantillas Markdown.* Habría una sola fuente, pero interpretar Markdown libre es frágil y las plantillas no marcan qué es un campo y qué es texto de ayuda.
  - *Definir los pasos en el código.* Contradice FR5.1.

## ADR-004: Habilitación de pasos en cadena

### Status: Accepted

- **Context:** Con orden obligatorio (FR3.3) y bloqueo de dependientes (FR3.5), los requisitos no decían si el bloqueo se propaga a los pasos que dependen indirectamente (hallazgo R-07). Origen: Q5.
- **Decision:** Un paso está habilitado solo si todos sus pasos de origen, directos e indirectos, están en Completo. DefinicionProceso resuelve los orígenes indirectos; Recorrido aplica la regla.
- **Consequences:** (+) El estado del recorrido es coherente: nunca hay un paso editable que dependa de algo sin cerrar. (−) Devolver un paso temprano a En curso bloquea de golpe varios pasos posteriores, aunque conservan su contenido. (Seguridad) Sin impacto.
- **Alternatives Rejected:**
  - *Solo orígenes directos.* Permite editar el paso 7 con el 5 reabierto, que es justo lo que el orden obligatorio quiere evitar.

## ADR-005: Guardado en archivos legibles con un pequeño servidor local

### Status: Accepted

- **Context:** FR6.1 pide conservar todo al cerrar y volver a abrir, incluidos los archivos adjuntos de los pasos visuales (FR4.4). NFR1 pide guardados completos o nulos. Además, el diseño no debe cerrar la puerta a conectar la herramienta con AI-DLC más adelante (scope-document F4, hallazgo R-08). Origen: Q6, Q7.
- **Decision:** Los datos de productos, recorridos, registros y adjuntos se guardan como archivos en una carpeta de datos del proyecto, en un formato legible y documentado. Un pequeño servidor local los lee y escribe; cada escritura se hace sobre un archivo temporal que luego sustituye al definitivo.
- **Consequences:** (+) Los datos quedan a la vista y se pueden versionar con git. (+) Los adjuntos no tienen límite práctico de tamaño. (+) Otro proceso, como AI-DLC, podrá leer o escribir esos archivos más adelante. (−) Hace falta arrancar el servidor local para usar la herramienta. (Seguridad) El servidor solo escucha en el propio equipo y no tiene autenticación, que está fuera de alcance. Los nombres de los adjuntos se sanean para que nunca se escriba fuera de la carpeta de datos.
- **Alternatives Rejected:**
  - *Almacenamiento del navegador.* Sin servidor, pero con límite de tamaño para los adjuntos y con los datos ocultos dentro del navegador, lo que cierra la puerta a AI-DLC.
  - *Base de datos local ligera.* Guardados robustos, pero los datos dejan de ser legibles a simple vista y añade una dependencia más.

## ADR-006: Datos de ejemplo solo en la primera apertura

### Status: Accepted

- **Context:** FR6.3 era ambiguo sobre qué pasa si se borran todos los productos (hallazgo R-01). Origen: Q3.
- **Decision:** Catalogo guarda una marca de primera apertura. Los tres productos ficticios se cargan solo si nunca se ha guardado nada; un catálogo vaciado a propósito sigue vacío.
- **Consequences:** (+) La herramienta respeta lo que la persona usuaria borró. (−) Para recuperar los ejemplos hay que borrar la carpeta de datos a mano. (Seguridad) Sin impacto.
- **Alternatives Rejected:**
  - *Cargar los ejemplos siempre que el catálogo esté vacío.* Haría reaparecer productos borrados a propósito.
  - *Opción para recargarlos.* Añade una función que no se pidió.

## ADR-007: El paso actual lo calcula Recorrido

### Status: Accepted

- **Context:** El catálogo muestra el paso actual de cada producto (FR1.1, FR1.2), pero los estados de los pasos son de Recorrido.
- **Decision:** Recorrido calcula el paso actual (el primer paso no completo en orden, o "Completo") y Catalogo se lo pide; Catalogo no guarda una copia.
- **Consequences:** (+) Hay una sola fuente de verdad para el estado, así que el catálogo nunca muestra un paso desactualizado. (−) Mostrar el catálogo exige consultar a Recorrido por cada producto, lo que es irrelevante con pocos productos. (Seguridad) Sin impacto.
- **Alternatives Rejected:**
  - *Guardar el paso actual en el producto.* Son dos copias del mismo dato que pueden desincronizarse.
