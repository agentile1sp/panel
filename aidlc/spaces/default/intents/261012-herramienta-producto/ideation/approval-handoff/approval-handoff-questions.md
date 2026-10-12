# Approval & Handoff: preguntas

Contexto: `ideation/intent-capture/intent-statement.md`, `ideation/intent-capture/stakeholder-map.md`, `ideation/scope-definition/scope-document.md` e `ideation/scope-definition/intent-backlog.md`, todos aprobados.

Varias preguntas habituales de esta etapa ya están respondidas o no aplican, y no se repiten:
- **Acuerdo de los interesados:** decides tú solo, y ya aprobaste la intención y el alcance.
- **Mockups y estudio de mercado:** esas etapas no se ejecutaron en este recorrido.
- **Equipo:** no hay formación de equipo; eres el único usuario y quien decide.

## Q1. ¿Aceptas el orden de recorte para cuando no alcance el tiempo?

El documento de alcance tiene dos riesgos: todo es imprescindible con un plazo de unas horas, y la única transformación automática aún no está elegida. Como supuesto, si falta tiempo se recorta desde el final del orden de entrega del backlog: primero el origen de los datos visible (IB-10), luego la transformación automática (IB-9), luego los registros transversales (IB-8), y así hacia atrás.

A. Sí: ese es el orden de recorte
B. Recortar primero otras piezas (indica cuáles)
C. No recortar nada: si hace falta, se amplía el plazo
D. Not yet defined
X. Other (please specify)

[Answer]: X. Other: hagamos algo y quitemos la transformacion de los datos que todo se manual mejor

## Q2. ¿Con qué recursos y tiempo cuentas para construirla?

Es el compromiso de recursos de la iniciativa: quién la construye y cuánto tiempo hay disponible.

A. Yo, con Claude Code y AI-DLC, el tiempo que haga falta hasta terminar
B. Yo, con Claude Code y AI-DLC, pero con tiempo limitado (indica cuánto)
C. Not applicable
D. Not yet defined
X. Other (please specify)

[Answer]: A

## Q3. Seguimiento de Q1: ¿qué consecuencias aceptas al quitar la transformación automática?

En Q1 pediste quitar la transformación automática de datos y que todo sea manual. Eso cambia lo aprobado en las dos etapas anteriores:
- Desaparece el criterio de éxito E2 ("los pasos estructurados toman los datos de los anteriores sin copiarlos a mano").
- Sale la pieza IB-9 del backlog.
- Uno de los dos problemas de fondo de la intención, que los datos se copian a mano entre pasos y se desincronizan, queda sin resolver en esta versión.

Queda por decidir qué pasa con el criterio E5 ("en cada paso se ve de qué pasos anteriores tomó sus datos").

A. Quitarla; en cada paso se sigue viendo de qué pasos toma sus datos según la definición del proceso, aunque se copien a mano (E5 e IB-10 se mantienen)
B. Quitarla, y quitar también el origen de los datos (E5 e IB-10 salen)
C. Mejor no quitarla: se mantiene una sola transformación automática, como estaba
D. Not yet defined
X. Other (please specify)

[Answer]: B

## Consolidated Summary Confirmation

Does this all look correct before I generate the artifact?

- Looks correct
- Request changes

[Answer]: Looks correct

## Requested Changes Feedback

What should change?

[Answer]: Que todo se meta de forma manual asi hacemos la herramienta mas sencilla en esta primera etapa
