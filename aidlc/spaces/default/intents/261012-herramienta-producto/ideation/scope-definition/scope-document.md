# Documento de alcance: herramienta de producto del panel

Parte de la declaración de intención aprobada (`ideation/intent-capture/intent-statement.md`) y de las respuestas de `scope-definition-questions.md`. Fija qué entra en la primera versión y qué queda fuera.

## Resumen

La primera versión se entrega completa de una vez (Q1): un catálogo de productos y, para cada producto, su recorrido por los 10 pasos de la etapa 3 · Producto, con el estado de cada paso, lo que se creó en cada uno y de dónde salieron sus datos. Una sola transformación de datos entre pasos es automática; el resto de los datos se escribe a mano (Q3, Q9). El proceso queda fijo en esta versión, pero descrito aparte para poder cambiarlo más adelante (Q4, Q8).

## Dentro del alcance

| # | Qué entra | De dónde sale |
|---|---|---|
| D1 | Catálogo con todos los productos; desde él se ve en qué paso va cada uno | intent-statement (E3) |
| D2 | Recorrido de cada producto por los 10 pasos de la etapa 3 · Producto, con el estado de cada paso y lo que se creó en cada uno | intent-statement (E1, E4) |
| D3 | Pasos de texto con estructura mínima: hipótesis, línea base y walking skeleton | intent-statement; descripción inicial |
| D4 | Pasos estructurados: mapa de piezas, fichas de capacidad y de instancia, story map y cierre del alcance | intent-statement; descripción inicial |
| D5 | Pasos visuales (user flow, wireframes, mockups) con su checklist y un enlace o archivo adjunto | intent-statement (Q8); Q2 |
| D6 | Tabla CRUD y tabla de estados que salen de las fichas | Q2 |
| D7 | Una transformación automática de datos entre pasos; cuál es se decide en Requirements Analysis | Q3, Q9, Q10; intent-statement (E2) |
| D8 | En cada paso se ve de qué pasos anteriores tomó sus datos | intent-statement (E5) |
| D9 | Registros transversales: acuerdos, y gaps y supuestos | Q2 |
| D10 | El proceso (etapa 3 con sus 10 pasos y de qué pasos toma datos cada uno) descrito en una definición separada, fija en esta versión | Q4, Q8 |
| D11 | Datos de ejemplo ficticios para recorrer el proceso | intent-statement; descripción inicial |

## Fuera del alcance

| # | Qué queda fuera | De dónde sale |
|---|---|---|
| F1 | Agregar, eliminar o mover etapas y pasos del proceso, desde la herramienta o de otra forma | Q4, Q8 |
| F2 | Qué pasa con los productos a mitad de recorrido si el proceso cambia | Q5 |
| F3 | Las etapas 1 · Problema y 2 · Solución | intent-statement |
| F4 | Conexión con AI-DLC u otros procesos en tiempo real (el diseño no debe cerrarle la puerta) | intent-statement |
| F5 | Despliegue, autenticación e integraciones externas | intent-statement |
| F6 | Edición visual del user flow, los wireframes y los mockups | intent-statement (Q8) |
| F7 | Las otras vistas del panel: arquitectura, flujo en vivo, analítica de uso y versiones | intent-statement (Q8) |
| F8 | Varios usuarios o edición compartida | intent-statement (Q8) |
| F9 | Las otras cinco transformaciones de datos del LEEME; esos datos se escriben a mano | Q3, Q9 |

## Cambio respecto a la declaración de intención

La declaración de intención aprobada dice que el proceso tiene que poder cambiarse con facilidad (mover, agregar o eliminar etapas y pasos). En esta etapa se decidió que en la primera versión el proceso queda fijo y que esa capacidad pasa a una versión posterior. Se conserva la parte que no cierra la puerta: el proceso se describe en una definición separada (Q4, Q8).

## Orden y plazo

- **Orden:** valor primero; el catálogo y el recorrido tienen que verse cuanto antes (Q6).
- **Plazo:** lo antes posible, en unas horas (Q7).

## Flujo de valor

Cómo pasa el valor de la idea al resultado que la persona usuaria ve:

1. **Idea escogida:** entra en la etapa 3 como punto de partida (D2).
2. **Producto en el catálogo:** queda registrado y visible con su paso actual (D1).
3. **Pasos de texto:** la hipótesis, la línea base y el walking skeleton dan contexto al producto (D3).
4. **Pasos estructurados:** el mapa de piezas y las fichas recogen los datos que luego se reutilizan (D4, D6).
5. **Transformación automática:** un paso toma sus datos de pasos anteriores sin copiarlos a mano (D7).
6. **Pasos visuales y cierre:** checklist y enlaces de los visuales, y cierre del alcance (D5, D4).
7. **Visibilidad:** estado de cada paso, lo creado y el origen de los datos, a la vista (D2, D8).

## Riesgos de alcance

- **Todo es imprescindible y el plazo es de horas.** Con los 11 elementos del alcance marcados como imprescindibles (Q2) y un plazo de unas horas (Q7), no hay un orden de recorte acordado si algo no cabe. El orden de entrega, que pone el valor primero (Q6), deja al final la transformación automática y la visibilidad del origen de los datos.
- **Transformación sin elegir.** La única transformación automática todavía no está elegida (Q10); hasta decidirla no se sabe qué datos se escriben a mano.

## Assumptions & Open Questions

- [assumption] Si el plazo no alcanza, se recorta empezando por el final del orden de entrega del backlog (`intent-backlog.md`); este orden de recorte no se ha confirmado.
- Pregunta abierta para Requirements Analysis: cuál es la única transformación automática (Q10).
