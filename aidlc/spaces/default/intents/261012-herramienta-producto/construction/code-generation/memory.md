<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
- 2026-10-12T05:52:32Z — [unit u1-base] Ninguna etapa anterior eligió tecnología; el plan de u1-base fijó Node.js 20+ con JavaScript, sin dependencias, node --test y archivos JSON, y la persona lo aprobó en la aprobación del plan.
- 2026-10-12T06:39:48Z — [unit u3-recorrido] El plan decía que el paso 7 depende del 5 de forma indirecta, pero en la definición es directo; la prueba de bloqueo en cadena cubre el 7 y además el 8, que sí es indirecto.

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->
- 2026-10-12T05:52:32Z — [unit u1-base] El comando de pruebas aprobado (node --test tests/u1-base/) no funciona desde Node 21; se cambió a *.test.js en el plan, las instrucciones y package.json, y el plan corregido se volvió a aprobar.
- 2026-10-12T06:11:37Z — [unit u2-definicion-proceso] Los registros transversales se modelaron con tipos de elemento (acuerdo; gap y supuesto) en lugar de solo campos, porque la plantilla de gaps y supuestos tiene dos tablas distintas.

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->
- 2026-10-12T05:52:32Z — [unit u1-base] El desarrollador añadió defensas de seguridad no pedidas (solo JSON en cambios, Sec-Fetch-Site, CSP estricta); obliga a U3 y U4 a no usar JavaScript ni CSS en línea.

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
- 2026-10-12T05:52:32Z — [unit u1-base] La revisión dejó un hallazgo Major: un JSON dañado no se puede sobrescribir, borrar ni restaurar, solo apartar; afecta al deshacer que usará U4.
- 2026-10-12T06:11:37Z — [unit u2-definicion-proceso] La revisión señaló que el validador no fija los ids de paso: renombrar uno a mano dejaría huérfanos los datos ya guardados por U3.
- 2026-10-12T06:39:48Z — [unit u3-recorrido] Las pantallas de recorrido, paso y registros no se han abierto en un navegador real; conviene probarlas a mano en Build and Test.

