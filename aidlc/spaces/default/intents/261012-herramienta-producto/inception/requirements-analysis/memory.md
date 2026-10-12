<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
- 2026-10-12T04:40:18Z — La tabla CRUD y la tabla de estados se ubicaron dentro del paso 7 (Story map) porque así lo trae su plantilla; el alcance las listaba como pieza aparte (IB-7).
- 2026-10-12T04:40:18Z — El paso actual de un producto (FR1.2) se definió como el primer paso no completo en orden; no había respuesta explícita y se dejó como supuesto.

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->
- 2026-10-12T04:40:18Z — Se leyeron solo 3 de las 13 plantillas (LEEME, ficha de capacidad, cierre del alcance, story map) en vez de todas; bastaron para fijar qué pasos tienen elementos repetibles, y los requisitos remiten a las plantillas en lugar de copiar sus campos.

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->
- 2026-10-12T04:40:18Z — Ante el hueco del orden obligatorio cuando un paso de origen vuelve atrás, se eligió conservar el contenido de los pasos dependientes y bloquear su edición (FR3.5) en lugar de devolverlos a Pendiente; no se pierde trabajo y se respeta el orden.

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
- 2026-10-12T04:40:18Z — Cómo se describe la definición separada del proceso y cómo se guardan los datos en el equipo; se decide en Domain Design.
