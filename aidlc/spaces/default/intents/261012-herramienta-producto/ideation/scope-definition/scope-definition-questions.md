# Scope Definition: preguntas

Contexto: `ideation/intent-capture/intent-statement.md` (aprobado). Esta etapa fija qué entra en la primera versión, en qué orden y qué es imprescindible.

## Q1. ¿Cuál es el alcance mínimo que ya te aporta valor?

La declaración de intención tiene cinco criterios de éxito (recorrido completo, datos derivados, visibilidad en el catálogo, en el recorrido y del origen de los datos). Esta pregunta decide si todos tienen que estar en la primera entrega o si hay un corte más pequeño que ya sirve.

A. Todo junto: los 10 pasos con sus datos derivados; sin eso no aporta valor
B. Primero catálogo, recorrido con estado de cada paso y pasos de texto; los pasos estructurados y las derivaciones después
C. Primero el núcleo estructurado (fichas y lo que se deriva de ellas); catálogo y recorrido después
D. Not yet defined
X. Other (please specify)

[Answer]: A

## Q2. ¿Qué partes NO son imprescindibles en esta primera versión? (select all that apply)

Para priorizar hace falta separar lo imprescindible de lo deseable; si todo es imprescindible, se marca None.

A. Los registros transversales (acuerdos, y gaps y supuestos)
B. Los pasos visuales (user flow, wireframes, mockups) con su checklist y enlace
C. Las tablas derivadas de las fichas (tabla CRUD y tabla de estados)
D. None: todo es imprescindible
X. Other (please specify)

[Answer]: D

## Q3. ¿Cuántas de las transformaciones de datos entre pasos entran en esta versión?

`docs/proceso-producto/LEEME.md` describe seis: de las conexiones de las fichas salen las dependencias del mapa de piezas; de los momentos, la columna vertebral del story map y los pasos del user flow; de actores y criterios, las historias; de entrada y salida, los objetos y la tabla CRUD; de los estados de la salida, la tabla de estados; y de fuera de alcance y walking skeleton, la línea de corte del story map.

A. Las seis
B. Solo las que alimentan el story map (momentos, actores y criterios, línea de corte)
C. Una sola, como prueba de que el mecanismo funciona (por ejemplo, de las fichas al story map)
D. Not yet defined
X. Other (please specify)

[Answer]: C

## Q4. ¿Desde dónde cambias el proceso (mover, agregar o eliminar etapas y pasos)?

Tu descripción pide que el proceso sea fácil de cambiar. Hacerlo desde la herramienta añade pantallas; hacerlo editando una definición es más rápido de construir.

A. Desde la propia herramienta, con una pantalla para configurarlo
B. Editando una definición del proceso (un archivo), sin pantalla de configuración
C. Me da igual en esta versión, mientras no haya que tocar el código
D. Not yet defined
X. Other (please specify)

[Answer]: X. Other: Sabes que decidi que para esta etapa el flujo ya lo tenemos no deberiamos realmente de modficialro asi que agregar, eliminar o mover etapas no lo vamos a hacer, primero debe funcionar lo basico

## Q5. Si cambias el proceso cuando ya hay productos a mitad de recorrido, ¿qué les pasa?

Es la consecuencia directa de poder cambiar el proceso: un producto que ya recorrió cuatro pasos puede quedarse con pasos que ya no existen o sin pasos nuevos.

A. Siguen con la versión del proceso con la que empezaron
B. Se adaptan al proceso nuevo (los pasos nuevos aparecen pendientes; los eliminados se archivan sin perder datos)
C. No hace falta resolverlo en esta versión: queda fuera de alcance
D. Not yet defined
X. Other (please specify)

[Answer]: C

## Q6. ¿En qué orden prefieres construir?

Ordena el plan de entrega: atacar primero lo más incierto, lo más visible o lo que otras partes necesitan.

A. Riesgo primero: el modelo de datos y las transformaciones, que es lo más incierto
B. Valor primero: catálogo y recorrido visibles cuanto antes
C. Dependencias primero: lo que las demás partes necesitan para funcionar
D. Not yet defined
X. Other (please specify)

[Answer]: B

## Q7. ¿Hay alguna fecha límite ligada a alguna parte?

Si existe, condiciona qué se recorta cuando falta tiempo.

A. Sí, una fecha concreta (indica cuál y para qué parte)
B. Sin fecha fija, pero cuanto antes para poder documentar el piloto
C. None: no hay fechas
D. Not yet defined
X. Other (please specify)

[Answer]: X. Other: Si lo antes posible en unas horas

## Q8. Seguimiento de Q4: ¿cómo queda lo de poder cambiar el proceso?

La descripción y la declaración de intención aprobada dicen que el proceso tiene que ser fácil de cambiar y quedar "bien hecho desde el principio". En Q4 dijiste que en esta versión el flujo ya está definido y no se van a agregar, eliminar ni mover etapas o pasos: primero tiene que funcionar lo básico.

A. Proceso fijo en esta versión, pero descrito en una definición separada, para poder cambiarlo más adelante sin rehacer la herramienta
B. Proceso fijo y escrito directamente en la herramienta; si algún día cambia, se adapta la herramienta
C. Not yet defined
X. Other (please specify)

[Answer]: A

## Q9. Seguimiento de Q1, Q2 y Q3: ¿qué datos se derivan solos y cuáles se escriben a mano?

En Q1 elegiste entregarlo todo junto y en Q2 marcaste todo como imprescindible, incluidas la tabla CRUD y la tabla de estados, que salen de las fichas. En Q3 elegiste una sola transformación automática. Además, el criterio de éxito E2 dice que los pasos estructurados toman datos de los anteriores sin copiarlos a mano.

A. Una sola transformación automática; el resto de los datos de los pasos estructurados se escribe a mano en esta versión (E2 se cumple con esa transformación)
B. Las seis transformaciones del LEEME (Q3 pasa a "Las seis")
C. Las que alimentan el story map, más la tabla CRUD y la tabla de estados
D. Not yet defined
X. Other (please specify)

[Answer]: A

## Q10. Seguimiento de Q9: ¿cuál es esa única transformación automática?

Con una sola transformación automática, conviene elegir la que mejor demuestra que los datos fluyen de un paso a otro.

A. De las fichas al story map (los momentos forman la columna vertebral, y los actores y criterios, las historias)
B. De las fichas al user flow (los momentos forman los pasos del flujo)
C. De las fichas a la tabla CRUD (la entrada y la salida forman los objetos y sus operaciones)
D. Not yet defined
X. Other (please specify)

[Answer]: D

## Consolidated Summary Confirmation

Does this all look correct before I generate the artifact?

- Looks correct
- Request changes

[Answer]: Looks correct
