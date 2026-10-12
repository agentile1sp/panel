# Unidades de trabajo: herramienta de producto del panel

Agrupa los componentes de `inception/domain-design/components.md` (y sus decisiones en `decisions.md`) en unidades que se construyen y prueban por separado, para cubrir `inception/requirements-analysis/requirements.md`. Parte de las respuestas de `units-generation-questions.md`.

## Modelo de despliegue

Las cuatro unidades forman **una sola aplicación local** que se arranca con un comando (Q2). Dentro de ella, las unidades se llaman con **llamadas internas**; solo las pantallas hablan con el servidor local (Q3). No hay despliegue fuera del equipo.

## Unidades

| Unit ID | Directory | Nombre | Tipo | Componente de Domain Design | Complejidad | Despliegue |
|---|---|---|---|---|---|---|
| U1 | u1-base | Base común | service | — (capa de persistencia y servidor; resuelve R-02 del diseño) | M | Compartida: es la aplicación que arranca y aloja a las demás |
| U2 | u2-definicion-proceso | Definición del proceso | library | DefinicionProceso | S | Embebida en la aplicación |
| U3 | u3-recorrido | Recorrido | ui | Recorrido | L | Embebida en la aplicación |
| U4 | u4-catalogo | Catálogo | ui | Catalogo | M | Embebida en la aplicación |

### U1 · Base común (`u1-base`)

- **Qué es:** el pequeño servidor local y la capa de guardado que comparten las demás unidades. Es la dueña única de la escritura de archivos (hallazgo R-02 de la revisión del diseño).
- **Responsabilidades:**
  - Arrancar la aplicación con un comando y servir las pantallas. Escucha solo en el propio equipo y acepta peticiones solo de su propio origen (hallazgo R-03 del diseño).
  - Leer y escribir archivos legibles en la carpeta de datos del proyecto. Cada escritura es completa o nula: se escribe un archivo temporal y luego sustituye al definitivo (NFR1). Si falla, se conserva el dato anterior y se devuelve el error.
  - Ofrecer a las demás unidades las operaciones de guardar, leer, borrar y deshacer que necesitan para cumplir la regla de Q4.
  - Guardar y servir los adjuntos. Sanea sus nombres para que nunca se escriba fuera de la carpeta de datos, y los sirve como descarga con tipo de contenido controlado, sin ejecutarlos.
  - Documentar el formato de los archivos de datos, para que otro proceso, como AI-DLC, pueda leerlos más adelante (ADR-005, Q7 de Domain Design).
- **Requisitos que cubre:** FR6.1, NFR1.
- **Notas:** no contiene reglas de negocio de productos ni de pasos.

### U2 · Definición del proceso (`u2-definicion-proceso`)

- **Qué es:** el archivo de definición del proceso y el código que lo lee y lo valida (ADR-003).
- **Responsabilidades:**
  - Escribir el archivo de definición con los 10 pasos y los 2 registros transversales: orden, nombre, tipo, pasos de origen, plantilla y campos. Los campos se escriben a mano a partir de `docs/proceso-producto/plantillas/`. Un paso puede tener varios tipos de elemento, cada uno con su plantilla y sus campos: el paso 5 tiene fichas de capacidad y de instancia, y el paso 7 tiene historias más las tablas CRUD, de estados y de navegación (hallazgo R-05 del diseño).
  - Validarlo al arrancar. Si falta o no es válido, la aplicación no arranca y el error nombra el problema.
  - Exponer los pasos en orden y resolver los orígenes directos e indirectos de un paso (ADR-004).
- **Requisitos que cubre:** FR5, FR5.1, FR5.2; da soporte a FR3.3 y FR4.1.
- **Notas:** es de solo lectura y no guarda datos de productos. Lee su archivo del proyecto directamente, sin pasar por la carpeta de datos.

### U3 · Recorrido (`u3-recorrido`)

- **Qué es:** el recorrido de cada producto por los 10 pasos, con sus pantallas.
- **Responsabilidades:**
  - Estado y contenido de cada paso. Un producto nuevo empieza con todos sus pasos en Pendiente, y el estado lo cambia la persona usuaria a mano.
  - Regla de habilitación en cadena y bloqueo de los pasos dependientes (ADR-004).
  - Cálculo del paso actual (ADR-007).
  - Pasos estructurados con varios elementos, y pasos visuales con checklist y un enlace o un adjunto. Solo se aceptan enlaces http o https (hallazgo R-03 del diseño).
  - Registros de acuerdos, y de gaps y supuestos, de cada producto (ADR-002).
  - Operaciones para crear, sembrar, borrar y deshacer el recorrido de un producto, que usa U4.
  - Pantallas de recorrido, de paso y de registros.
- **Requisitos que cubre:** FR1.2 (cálculo), FR2, FR3, FR4, NFR2, NFR4.
- **Notas:** ningún campo se rellena ni se calcula a partir de otro paso (DL-09). Usa U2 para saber qué pasos existen y U1 para guardar.

### U4 · Catálogo (`u4-catalogo`)

- **Qué es:** los productos y el catálogo, con su pantalla.
- **Responsabilidades:**
  - Crear, renombrar y borrar productos. El nombre es obligatorio, y borrar pide confirmación.
  - Mostrar el catálogo con el paso actual de cada producto, que pide a U3.
  - Coordinar las operaciones compuestas con U3 (crear producto, borrar producto, cargar los ejemplos). Si falla la segunda escritura, se deshace la primera y todo queda como estaba (Q4, resuelve R-01 del diseño).
  - Cargar los tres productos ficticios solo en la primera apertura. La marca de primera apertura es un dato de U4 y se escribe al terminar la carga (ADR-006). El contenido de los ejemplos vive en un archivo de datos de ejemplo de U4 y respeta la habilitación en cadena (hallazgo R-04 del diseño).
- **Requisitos que cubre:** FR1 (salvo el cálculo de FR1.2), FR6.2, FR6.3, NFR3.
- **Notas:** no guarda una copia del paso actual de los productos.
