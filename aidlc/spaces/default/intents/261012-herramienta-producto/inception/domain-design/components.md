# Componentes: herramienta de producto del panel

Piezas de software de la herramienta, qué datos es dueña cada una y cómo se relacionan. Parte de `inception/requirements-analysis/requirements.md` y de las respuestas de `domain-design-questions.md`. Las decisiones están razonadas en `decisions.md` (ADR-001 a ADR-007).

## Catálogo de componentes

```yaml
components:
  - name: DefinicionProceso
    summary: Lee y expone la definición fija del proceso (los 10 pasos y los 2 registros transversales).
    behaviour: >
      Carga al arrancar el archivo de definición del proceso y lo valida: deben existir los 10 pasos
      con orden único del 1 al 10, cada paso con nombre, tipo (texto, estructurado o visual), pasos
      de origen que existan y sean anteriores a él, plantilla de referencia y lista de campos; y los
      2 registros transversales (acuerdos; gaps y supuestos). Si el archivo falta o no es válido, la
      herramienta no arranca y el error nombra el archivo y el problema. Es de solo lectura: no
      ofrece ninguna operación para cambiar la definición (FR5.2). No guarda datos de productos.
    responsibilities:
      - Cargar y validar el archivo de definición del proceso
      - Exponer los pasos en orden, su tipo, sus pasos de origen y sus campos
      - Exponer los dos registros transversales y sus campos
      - Resolver los orígenes directos e indirectos de un paso (para la habilitación en cadena)
    depends_on: []
    dependents:
      - component: Recorrido
        interaction: Consulta el orden de los pasos, sus orígenes y los campos de cada plantilla
    external_dependencies:
      - name: Archivo de definición del proceso (formato de datos legible, en el proyecto)
        kind: other
        purpose: Fuente única de los pasos, su orden, sus orígenes y sus campos
    entities:
      - name: DefinicionPaso
        identifier: idPaso
        attributes: [idPaso, orden, nombre, tipo, pasosOrigen, plantilla, campos]
      - name: DefinicionRegistro
        identifier: idRegistro
        attributes: [idRegistro, nombre, plantilla, campos]

  - name: Catalogo
    summary: Gestiona los productos y muestra el catálogo con el paso actual de cada uno.
    behaviour: >
      Crea, renombra y borra productos. El nombre es obligatorio y no puede quedar vacío ni ser solo
      espacios, al crear ni al renombrar. Borrar pide confirmación nombrando el producto y, al
      confirmar, borra también todo su recorrido (pasos, adjuntos y registros transversales) a través
      de Recorrido. El paso actual de cada producto no lo calcula Catalogo: lo pide a Recorrido. Con
      el catálogo vacío muestra un mensaje y la opción de crear un producto. La primera vez que se
      abre la herramienta (nunca se ha guardado nada) carga tres productos ficticios (uno sin
      empezar, uno a medias, uno completo) y pide a Recorrido que siembre su contenido; un catálogo
      vaciado a propósito no vuelve a cargarlos (ADR-006). Incluye la pantalla de catálogo.
    responsibilities:
      - Crear, renombrar y borrar productos
      - Mostrar el catálogo con el nombre y el paso actual de cada producto
      - Cargar los datos de ejemplo en la primera apertura
      - Guardar los productos de forma legible y documentada
    depends_on:
      - component: Recorrido
        interaction: Pedir el paso actual de cada producto, crear el recorrido de un producto nuevo, borrar el recorrido de un producto borrado y sembrar el contenido de los productos de ejemplo
        style: sync
    dependents: []
    external_dependencies:
      - name: Carpeta de datos del proyecto (archivos legibles, servidos por un pequeño servidor local)
        kind: other
        purpose: Guardar los productos y la marca de primera apertura
    entities:
      - name: Producto
        identifier: idProducto
        attributes: [idProducto, nombre, creadoEn, actualizadoEn]

  - name: Recorrido
    summary: Gestiona el recorrido de cada producto por los 10 pasos, su contenido y sus registros transversales.
    behaviour: >
      Por cada producto guarda el estado de cada paso (Pendiente, En curso o Completo) y su contenido
      con los campos de su plantilla. Un producto nuevo empieza con los 10 pasos en Pendiente. La
      persona usuaria cambia el estado a mano; la herramienta no lo cambia sola. Un paso está
      habilitado solo si todos sus pasos de origen, directos e indirectos, están en Completo (ADR-004);
      el paso 1 y los registros transversales siempre lo están. En un paso no habilitado no se puede
      editar ni cambiar el estado, y se indica qué pasos faltan; si un origen deja de estar Completo,
      los pasos dependientes conservan contenido y estado, pero quedan bloqueados. Calcula el paso
      actual: el primer paso, en orden, que no está en Completo, o "Completo" si lo están todos.
      Ningún campo se rellena ni calcula a partir de otro paso. Los pasos estructurados admiten
      varios elementos (piezas, fichas, filas de tabla); los visuales guardan su checklist y un
      enlace o un archivo adjunto. Los registros de acuerdos, y de gaps y supuestos, son de cada
      producto (ADR-002). Cada guardado se aplica completo o no se aplica; si falla, se conservan
      los datos anteriores y se avisa. Incluye las pantallas de recorrido, de paso y de registros.
    responsibilities:
      - Crear, sembrar y borrar el recorrido de un producto
      - Guardar el estado y el contenido de cada paso
      - Aplicar la regla de habilitación en cadena y el bloqueo de dependientes
      - Calcular el paso actual de un producto
      - Guardar y servir los adjuntos de los pasos visuales
      - Gestionar los registros de acuerdos, y de gaps y supuestos, de cada producto
      - Guardar todo de forma legible y documentada, con guardados completos o nulos
    depends_on:
      - component: DefinicionProceso
        interaction: Obtener el orden de los pasos, sus orígenes directos e indirectos y los campos de cada plantilla
        style: sync
    dependents:
      - component: Catalogo
        interaction: Paso actual, alta, borrado y siembra del recorrido de un producto
    external_dependencies:
      - name: Carpeta de datos del proyecto (archivos legibles, servidos por un pequeño servidor local)
        kind: other
        purpose: Guardar el recorrido, el contenido de los pasos, los registros transversales y los adjuntos
    entities:
      - name: RecorridoProducto
        identifier: idProducto
        attributes: [idProducto, pasos, registros]
        references:
          - entity: Producto
            owned_by: Catalogo
            relationship: cada recorrido pertenece a un único producto y se borra con él
      - name: RegistroPaso
        identifier: idProducto + idPaso
        attributes: [idProducto, idPaso, estado, contenido, actualizadoEn]
        references:
          - entity: DefinicionPaso
            owned_by: DefinicionProceso
            relationship: cada registro de paso corresponde a un paso de la definición
      - name: Adjunto
        identifier: idAdjunto
        attributes: [idAdjunto, idProducto, idPaso, nombreArchivo, ruta, subidoEn]
      - name: EntradaTransversal
        identifier: idEntrada
        attributes: [idEntrada, idProducto, idRegistro, campos, creadaEn, actualizadaEn]
        references:
          - entity: DefinicionRegistro
            owned_by: DefinicionProceso
            relationship: cada entrada pertenece a uno de los dos registros transversales
```

## Diagrama de componentes

```mermaid
graph LR
  Catalogo["Catalogo"] -->|"paso actual; alta, borrado y siembra del recorrido"| Recorrido["Recorrido"]
  Recorrido -->|"orden, orígenes y campos de los pasos"| DefinicionProceso["DefinicionProceso"]
```

<!-- Text fallback: Catalogo llama a Recorrido para obtener el paso actual de cada producto y para dar de alta, borrar y sembrar recorridos. Recorrido llama a DefinicionProceso para obtener el orden de los pasos, sus orígenes y sus campos. No hay más dependencias ni ciclos. -->

Catalogo depende de Recorrido, y Recorrido depende de DefinicionProceso. No hay ciclos.

## Resumen de componentes

| Component | Purpose | Depends On | Dependents | Entities Owned |
|---|---|---|---|---|
| DefinicionProceso | Leer y exponer la definición fija del proceso | — | Recorrido | DefinicionPaso, DefinicionRegistro |
| Catalogo | Productos y catálogo con su paso actual | Recorrido | — | Producto |
| Recorrido | Estado, contenido y habilitación de los pasos; registros transversales; adjuntos | DefinicionProceso | Catalogo | RecorridoProducto, RegistroPaso, Adjunto, EntradaTransversal |

## Propiedad de las entidades

| Entity | Owning Component | Identifier | Attributes | References |
|---|---|---|---|---|
| DefinicionPaso | DefinicionProceso | idPaso | idPaso, orden, nombre, tipo, pasosOrigen, plantilla, campos | — |
| DefinicionRegistro | DefinicionProceso | idRegistro | idRegistro, nombre, plantilla, campos | — |
| Producto | Catalogo | idProducto | idProducto, nombre, creadoEn, actualizadoEn | — |
| RecorridoProducto | Recorrido | idProducto | idProducto, pasos, registros | Producto (Catalogo) |
| RegistroPaso | Recorrido | idProducto + idPaso | idProducto, idPaso, estado, contenido, actualizadoEn | DefinicionPaso (DefinicionProceso) |
| Adjunto | Recorrido | idAdjunto | idAdjunto, idProducto, idPaso, nombreArchivo, ruta, subidoEn | — |
| EntradaTransversal | Recorrido | idEntrada | idEntrada, idProducto, idRegistro, campos, creadaEn, actualizadaEn | DefinicionRegistro (DefinicionProceso) |

## Dependencias externas

| Component | Dependency | Kind | Purpose |
|---|---|---|---|
| DefinicionProceso | Archivo de definición del proceso | other | Fuente única de los pasos, su orden, sus orígenes y sus campos |
| Catalogo | Carpeta de datos del proyecto, con un pequeño servidor local | other | Guardar productos y la marca de primera apertura |
| Recorrido | Carpeta de datos del proyecto, con un pequeño servidor local | other | Guardar recorridos, contenido, registros transversales y adjuntos |

## Justificación

| Component | Why it is a separate building block |
|---|---|
| DefinicionProceso | Cambia a otro ritmo (fijo en esta versión, editable a mano más adelante) y no tiene datos de productos; aislarla es lo que permite cambiar el proceso sin rehacer la herramienta (FR5.1) |
| Catalogo | Su dato (el producto) tiene un ciclo de vida propio, de alta, renombre y baja, y es la entrada a todo lo demás |
| Recorrido | Concentra la lógica con más reglas (estados, habilitación en cadena, bloqueo, guardado completo o nulo) y los datos que más cambian |

**Alternativas rechazadas** (detalle en ADR-001):
- Cuatro piezas, separando el contenido de los pasos del estado y el orden. Se descartó porque el contenido y el estado de un paso cambian juntos y se guardan juntos; separarlos añadía una frontera sin ganancia.
- Dos piezas. Se descartó porque mezclaba los productos con la lógica de los pasos, que cambian por motivos distintos.

## Aclaraciones respecto a los requisitos

Esta etapa resolvió tres hallazgos de la revisión de requisitos. Los requisitos aprobados no se reescriben; estas aclaraciones mandan sobre ellos:
- **R-01 (FR6.3):** los datos de ejemplo se cargan solo la primera vez que se abre la herramienta; un catálogo vaciado a propósito sigue vacío (ADR-006).
- **R-02 (FR2.4, FR4.5):** los registros transversales son de cada producto y se borran con él (ADR-002).
- **R-07 (FR3.3, FR3.5):** la habilitación es en cadena: cuentan los pasos de origen directos e indirectos (ADR-004).
