# Units Generation: preguntas

Contexto: `inception/domain-design/components.md` y `decisions.md` (aprobados, con los hallazgos R-01 a R-05 de su revisión aceptados) y `inception/requirements-analysis/requirements.md`. Esta etapa agrupa los componentes en unidades de trabajo que se construyen y prueban por separado, y dice qué unidad depende de cuál. El orden de construcción lo decide la etapa siguiente.

## Q1. ¿Cómo se agrupan los componentes en unidades de trabajo?

La revisión del diseño señaló que el pequeño servidor local y el guardado en archivos no tienen una pieza dueña (hallazgo R-02).

A. Cuatro unidades: una base común (servidor local, guardado en archivos y formato documentado de los datos) y una por cada componente (definición del proceso, catálogo, recorrido). Recomendada: resuelve R-02 y cada unidad se prueba sola.
B. Tres unidades, una por componente, con el servidor local y el guardado dentro de la unidad de la definición del proceso
C. Una sola unidad con toda la herramienta
D. Not yet defined
X. Other (please specify)

[Answer]: A

## Q2. ¿Cómo se arranca la herramienta?

Es el modelo de despliegue local: una aplicación o varias.

A. Una sola aplicación local que se arranca con un comando y reúne todas las unidades
B. Cada unidad se arranca por separado
C. Not yet defined
X. Other (please specify)

[Answer]: A

## Q3. ¿Cómo se comunican las unidades entre sí?

Define los puntos de integración entre unidades.

A. Con llamadas internas dentro de la misma aplicación; solo las pantallas hablan con el servidor local
B. Cada unidad expone su propia interfaz por red y las demás la llaman por ahí
C. Not yet defined
X. Other (please specify)

[Answer]: A

## Q4. ¿Qué pasa si una operación que toca catálogo y recorrido falla a la mitad?

Hallazgo R-01 de la revisión del diseño: crear un producto, borrarlo o cargar los ejemplos escribe en dos sitios, y si falla la segunda escritura pueden quedar datos huérfanos.

A. Orden fijo y limpieza al arrancar: al crear, primero el recorrido y luego el producto; al borrar, primero el producto y luego su recorrido; la marca de primera apertura se escribe al terminar de cargar los ejemplos; al arrancar, los recorridos sin producto se borran. Recomendada: sencillo y sin datos huérfanos visibles.
B. Que un fallo deje los datos como estaban, deshaciendo la primera escritura si la segunda falla
C. Not yet defined
X. Other (please specify)

[Answer]: B

## Aprobación del plan de división

Plan: cuatro unidades en una sola aplicación local con llamadas internas. U1 `u1-base` (service), U2 `u2-definicion-proceso` (library), U3 `u3-recorrido` (ui), U4 `u4-catalogo` (ui). U3 depende de U1 y U2; U4 depende de U1 y U3; U1 y U2 son independientes.

A. Approve Plan
B. Revise Plan

[Answer]: A. Approve Plan

## Consolidated Summary Confirmation

- Cuatro unidades: base común (servidor local, guardado y formato de los datos) más una por componente (Q1)
- Una sola aplicación local que se arranca con un comando (Q2)
- Las unidades se comunican con llamadas internas; solo las pantallas hablan con el servidor local (Q3)
- Si una operación que toca catálogo y recorrido falla a la mitad, se deshace la primera escritura y todo queda como estaba (Q4)
- Plan aprobado: U1 base, U2 definición del proceso, U3 recorrido, U4 catálogo, con U3 dependiendo de U1 y U2, y U4 de U1 y U3

Does this all look correct before I generate the artifact?

- Looks correct
- Request changes

[Answer]: Looks correct
