# Domain Design: preguntas

Contexto: `inception/requirements-analysis/requirements.md` (aprobado, con 8 hallazgos de la revisión aceptados). Esta etapa define las piezas de software de la herramienta, qué datos es dueña cada una y cómo se relacionan. Varias preguntas resuelven hallazgos de la revisión de requisitos que afectan al modelo de datos.

## Q1. ¿En cuántas piezas de software se divide la herramienta?

Hay más de una división razonable. Cada pieza tiene sus propios datos y su propia lógica.

A. Tres piezas: Definición del proceso (los 10 pasos fijos, sus orígenes y campos), Catálogo (los productos) y Recorrido (estado y contenido de cada paso de un producto, con la regla de habilitación). Recomendada: separa lo fijo, lo que cambia poco y lo que cambia mucho, sin trocear de más.
B. Cuatro piezas: las tres anteriores, pero separando el contenido de los pasos (los campos de cada plantilla) del estado y el orden del recorrido
C. Dos piezas: Definición del proceso, y todo lo demás junto
D. Not yet defined
X. Other (please specify)

[Answer]: A

## Q2. ¿Los registros de acuerdos, y de gaps y supuestos, son de cada producto o globales?

Hallazgo R-02 de la revisión de requisitos. Las plantillas llevan el nombre del producto en el título, lo que apunta a uno por producto. Decide de qué pieza son y si se borran con el producto.

A. Uno por producto: pertenecen al producto y se borran con él
B. Uno global para todos los productos
C. Not yet defined
X. Other (please specify)

[Answer]: A

## Q3. ¿Cuándo se cargan los datos de ejemplo?

Hallazgo R-01: si borras todos los productos y vuelves a abrir la herramienta, ¿vuelven los ejemplos?

A. Solo la primera vez que se abre (nunca se ha guardado nada); un catálogo vaciado a propósito sigue vacío
B. Siempre que el catálogo esté vacío al abrir
C. Solo la primera vez, y además hay una opción para volver a cargarlos cuando quiera
D. Not yet defined
X. Other (please specify)

[Answer]: A

## Q4. ¿Cómo se describe la definición separada del proceso?

Requisito FR5.1: los pasos, su orden, sus orígenes y su plantilla viven fuera del código.

A. Un archivo de datos legible con los 10 pasos, sus orígenes y los campos de cada plantilla escritos a partir de las plantillas de `docs/proceso-producto/plantillas/`. Recomendada: sencillo de leer y de cambiar a mano más adelante.
B. Las propias plantillas Markdown de `docs/proceso-producto/plantillas/` como fuente: la herramienta las lee y saca los campos de ellas
C. Not yet defined
X. Other (please specify)

[Answer]: A

## Q5. ¿El bloqueo de pasos se propaga en cadena?

Hallazgo R-07: si el paso 5 vuelve a En curso, el 6 queda bloqueado (FR3.5). El 7 depende del 6, que sigue en Completo: ¿se bloquea también?

A. Sí, en cadena: un paso solo está habilitado si todos los pasos de los que depende, directa o indirectamente, están en Completo
B. No: solo cuentan los pasos de los que toma datos directamente
C. Not yet defined
X. Other (please specify)

[Answer]: A

## Q6. ¿Dónde se guardan los datos en el equipo?

Requisito FR6.1 y supuesto de FR4.4: todo se conserva al cerrar y volver a abrir, incluidos los archivos adjuntos de los pasos visuales. Es una dependencia externa de las piezas, no una pieza en sí.

A. En archivos de una carpeta del proyecto, gestionados por un pequeño servidor local. Recomendada: los datos quedan a la vista y se pueden versionar con git; los adjuntos no tienen límite práctico de tamaño.
B. En el almacenamiento del propio navegador, sin servidor (más simple, pero los adjuntos tienen límite de tamaño y los datos no quedan a la vista)
C. En una base de datos local ligera, gestionada por un pequeño servidor local
D. Not yet defined
X. Other (please specify)

[Answer]: A

## Q7. ¿Qué hace el diseño para no cerrar la puerta a conectarse con AI-DLC más adelante?

Hallazgo R-08: el alcance pide no cerrar esa puerta (scope-document F4), pero los requisitos no dicen cómo.

A. Que los datos de cada producto y de cada paso se guarden en un formato legible y documentado, para que otro proceso pueda leerlos o escribirlos más adelante
B. Nada especial por ahora: se resuelve cuando toque
C. Not yet defined
X. Other (please specify)

[Answer]: A

## Consolidated Summary Confirmation

- Tres piezas de software: Definición del proceso, Catálogo y Recorrido (Q1)
- Los registros de acuerdos, y de gaps y supuestos, son de cada producto y se borran con él (Q2)
- Los datos de ejemplo se cargan solo la primera vez; un catálogo vaciado a propósito sigue vacío (Q3)
- La definición del proceso es un archivo de datos legible con los 10 pasos, sus orígenes y los campos de cada plantilla (Q4)
- El bloqueo de pasos se propaga en cadena (Q5)
- Los datos y los adjuntos se guardan en archivos de una carpeta del proyecto, gestionados por un pequeño servidor local (Q6)
- Los datos de cada producto y paso se guardan en un formato legible y documentado, para conectarlos con AI-DLC más adelante (Q7)

Does this all look correct before I generate the artifact?

- Looks correct
- Request changes

[Answer]: Looks correct
