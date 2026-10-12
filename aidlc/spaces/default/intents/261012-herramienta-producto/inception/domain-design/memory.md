<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
- 2026-10-12T04:56:38Z — Las pantallas no se modelaron como componente aparte: cada pieza incluye las suyas (Catálogo su pantalla; Recorrido las de recorrido, paso y registros), para respetar las tres piezas elegidas en Q1.
- 2026-10-12T04:56:38Z — La carga de los datos de ejemplo se asignó a Catálogo, que pide a Recorrido sembrar el contenido; así no hizo falta una cuarta pieza ni una dependencia circular.

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->
- 2026-10-12T04:56:38Z — Los hallazgos R-01, R-02 y R-07 de la revisión de requisitos se resolvieron aquí con preguntas y ADRs, sin reabrir requirements.md; components.md declara que sus aclaraciones mandan sobre esos requisitos.

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->
- 2026-10-12T04:56:38Z — Se eligió el guardado en archivos legibles con un servidor local frente al almacenamiento del navegador: cuesta arrancar un servidor, pero los adjuntos no tienen límite y los datos quedan abiertos para AI-DLC.

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
- 2026-10-12T04:56:38Z — Un control automático marcó en Intent Capture que el encabezado traducido "Señal inicial de alcance (Initial Scope Signal)" no coincide con el literal que espera; los encabezados de las plantillas de etapa deben quedar en inglés.
