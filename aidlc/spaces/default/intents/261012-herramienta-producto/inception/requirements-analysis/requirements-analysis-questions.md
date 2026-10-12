# Requirements Analysis: preguntas

Contexto: la descripción inicial, `ideation/intent-capture/intent-statement.md`, `ideation/scope-definition/scope-document.md` y el brief de la iniciativa (`ideation/approval-handoff/initiative-brief.md`), que manda sobre los anteriores: todo se introduce a mano, el proceso es fijo y los criterios de éxito vigentes son E1, E3 y E4.

## Q1. ¿Qué estados puede tener cada paso del recorrido?

El criterio E4 pide ver "el estado de cada uno de los 10 pasos", pero nadie ha dicho qué estados existen (hallazgo R-02 de la revisión de la intención).

A. Pendiente / En curso / Completo
B. Pendiente / En curso / Completo / Bloqueado
C. Solo Pendiente / Completo
D. Not yet defined
X. Other (please specify)

[Answer]: A

## Q2. ¿Qué cuenta como "lo que se creó" en cada paso?

El criterio E4 también pide ver lo que se creó en cada paso. Cada paso tiene su plantilla en `docs/proceso-producto/plantillas/`.

A. El contenido del paso dentro de la herramienta, con los campos de su plantilla
B. Un texto libre por paso, sin campos
C. Los campos de la plantilla en los pasos estructurados, y texto libre en los demás
D. Not yet defined
X. Other (please specify)

[Answer]: A

## Q3. ¿Se pueden trabajar los pasos en cualquier orden?

El proceso declara de qué pasos toma datos cada uno (por ejemplo, las fichas toman del mapa de piezas). Como todo se introduce a mano, hay que decidir si ese orden obliga o solo orienta.

A. Orden libre: puedo trabajar cualquier paso en cualquier momento
B. Orden obligatorio: un paso se habilita cuando están completos los pasos de los que toma datos
C. Orden libre, pero la herramienta avisa si un paso del que se toman datos no está completo
D. Not yet defined
X. Other (please specify)

[Answer]: B

## Q4. ¿Cómo cambia el estado de un paso?

Define si el estado lo decides tú o lo calcula la herramienta.

A. Lo cambio yo a mano
B. Lo calcula la herramienta: Completo cuando todos los campos obligatorios están llenos
C. Lo cambio yo, pero la herramienta no deja marcar Completo si faltan campos obligatorios
D. Not yet defined
X. Other (please specify)

[Answer]: A

## Q5. ¿Qué datos tiene un producto en el catálogo?

La vista de catálogo del panel (`docs/vision-panel.md`) muestra cada producto como una tarjeta con nombre y tipo; la etapa 3 parte de la idea escogida.

A. Nombre y tipo o categoría
B. Nombre, tipo o categoría, y la idea escogida (un texto)
C. Nombre, tipo o categoría, idea escogida y una descripción breve
D. Not yet defined
X. Other (please specify)

[Answer]: X. Other: Nombre

## Q6. ¿Qué puedes hacer con los productos del catálogo?

Define las operaciones sobre productos.

A. Crear, editar y borrar productos
B. Crear y editar, sin borrar
C. Solo usar los productos de ejemplo que vengan cargados
D. Not yet defined
X. Other (please specify)

[Answer]: A

## Q7. ¿Lo que introduces se tiene que conservar al cerrar y volver a abrir la herramienta?

Es una herramienta local sin despliegue; esto decide si los datos sobreviven entre sesiones.

A. Sí: todo se guarda en el equipo y sigue ahí al volver a abrirla
B. No hace falta: basta con que dure mientras está abierta
C. Not applicable
D. Not yet defined
X. Other (please specify)

[Answer]: A

## Q8. ¿Con qué datos de ejemplo ficticios arranca?

La descripción pide datos de ejemplo ficticios; sirven para comprobar el criterio E1 y para enseñar la herramienta al equipo.

A. Tres productos ficticios en distintos puntos del recorrido (uno sin empezar, uno a medias, uno completo)
B. Un único producto ficticio con los 10 pasos completos
C. Ninguno: empieza vacía y yo creo el producto ficticio
D. Not yet defined
X. Other (please specify)

[Answer]: A

## Q9. Seguimiento de Q5: ¿dónde se escribe la idea escogida?

La etapa 3 parte de la idea escogida, y el paso 1 (Hipótesis) toma sus datos de ella. En Q5 elegiste que el producto solo tenga nombre.

A. Dentro del paso 1 (Hipótesis), como un campo más de su contenido
B. Como un dato del producto aparte de los pasos (el producto pasa a tener nombre e idea escogida)
C. No se registra: queda implícita en el nombre del producto
D. Not yet defined
X. Other (please specify)

[Answer]: C

## Q10. Seguimiento de Q3: con orden obligatorio, ¿cuándo están disponibles los registros transversales?

Los registros de acuerdos, y de gaps y supuestos, toman de todos los pasos. Con orden obligatorio (Q3), un paso solo se habilita cuando están completos los pasos de los que toma datos.

A. Siempre, desde el inicio del recorrido: se van llenando a lo largo de todos los pasos
B. Solo cuando los 10 pasos están completos
C. Not applicable
D. Not yet defined
X. Other (please specify)

[Answer]: A

## Consolidated Summary Confirmation

- Estados de cada paso: Pendiente, En curso y Completo (Q1)
- Lo creado en cada paso: su contenido dentro de la herramienta, con los campos de su plantilla (Q2)
- Orden obligatorio: un paso se habilita cuando están completos los pasos de los que toma datos (Q3)
- El estado de cada paso lo cambia la persona usuaria a mano (Q4)
- El producto solo tiene nombre (Q5); la idea escogida no se registra (Q9)
- Productos: crear, editar y borrar (Q6)
- Todo se guarda en el equipo y se conserva al cerrar y volver a abrir (Q7)
- Arranca con tres productos ficticios: uno sin empezar, uno a medias y uno completo (Q8)
- Los registros de acuerdos, y de gaps y supuestos, están disponibles siempre (Q10)

Does this all look correct before I generate the requirements artifact?

- Looks correct
- Request changes

[Answer]: Looks correct
