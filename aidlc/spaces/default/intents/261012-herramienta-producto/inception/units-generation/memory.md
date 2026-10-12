<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
- 2026-10-12T05:05:36Z — U3 y U4 se marcaron como tipo ui aunque tienen lógica propia; ningún tipo encaja exacto y las etapas de diseño por unidad están fuera de este plan, así que el tipo no cambia qué se construye.

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->
- 2026-10-12T05:05:36Z — Los hallazgos R-01 a R-05 de la revisión de Domain Design se resolvieron aquí: R-01 y R-02 con preguntas; R-03, R-04 y R-05 como responsabilidades de U1, U4 y U2, sin preguntar, porque eran mínimos de seguridad y de modelo propuestos por el revisor.

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->
- 2026-10-12T05:05:36Z — La persona eligió deshacer la primera escritura en las operaciones compuestas (Q4 B) en vez del orden fijo con limpieza al arrancar; es más código en U4, pero no deja estados intermedios.

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
