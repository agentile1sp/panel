# Delivery Planning: preguntas

Contexto: `inception/units-generation/` (aprobada, con los hallazgos R-01 a R-05 de su revisión aceptados como riesgo), `inception/domain-design/components.md` e `inception/requirements-analysis/requirements.md`. Esta etapa decide en qué orden se construyen las cuatro unidades y en cuántos Bolts. Un Bolt es una pasada de construcción sobre una parte del trabajo que termina en algo que funciona y se puede probar.

Varias preguntas habituales de esta etapa ya están respondidas y no se repiten:
- **Qué construir primero:** valor primero, con el catálogo y el recorrido visibles cuanto antes (Scope Definition, Q6 B). El grafo de dependencias obliga a construir la base común (U1) y la definición del proceso (U2) antes que el recorrido (U3), y el recorrido antes que el catálogo (U4).
- **Plazo y recursos:** lo antes posible, en unas horas (Scope Definition, Q7); lo construyes tú con Claude Code y AI-DLC, el tiempo que haga falta (Approval & Handoff, Q2).
- **Equipo:** no hubo formación de equipo; todos los Bolts los construye el agente desarrollador desde esta sesión.
- **En paralelo o uno tras otro:** la construcción está configurada unidad a unidad y en serie.
- **Dependencias externas:** no hay integraciones externas, despliegue ni autenticación (restricciones de la descripción inicial).
- **Walking skeleton** (una primera porción mínima de punta a punta que demuestra que todo encaja): el plan de este trabajo no lo usa.

## Q1. ¿Cuántas unidades entran en cada Bolt?

Decide cuántas veces se para la construcción para que revises algo que ya funciona.

A. Un Bolt por unidad: cuatro Bolts (base común, definición del proceso, recorrido, catálogo). Recomendada: cada Bolt termina en algo que se prueba solo y es el mismo corte que ya usa la construcción.
B. Tres Bolts: la base común y la definición del proceso juntas, luego el recorrido, luego el catálogo
C. Un solo Bolt con toda la herramienta
D. Not yet defined
X. Other (please specify)

[Answer]: A

## Q2. ¿Qué te preocupa más de la construcción, para atacarlo pronto? (select all that apply)

Al aprobar Units Generation aceptaste como riesgo dos huecos que señaló la revisión. Lo que elijas aquí se comprueba de forma explícita en el primer Bolt que lo toque.

A. Cómo se monta la aplicación: quién comprueba al arrancar que la definición del proceso es válida y cómo llegan las pantallas del recorrido y del catálogo al servidor local (hallazgo R-01)
B. Qué pasa si una operación que toca catálogo y recorrido (crear o borrar un producto, cargar los ejemplos) falla a la mitad, o si falla el propio deshacer (hallazgo R-02)
C. Los pasos estructurados con varios elementos del recorrido (fichas, story map con sus tablas), que son la parte más grande
D. Nada en especial
X. Other (please specify)

[Answer]: D

## Q3. ¿Con qué comando se comprueba cada unidad terminada?

Es el comando que se ejecuta al terminar cada unidad para confirmar que funciona. Aún no hay código ni tecnología elegida, así que todavía no existe un comando real.

A. Decidirlo al terminar la primera unidad, cuando ya exista el proyecto. Recomendada: no se inventa un comando que aún no funciona.
B. Fijarlo ya con un comando habitual (indica cuál, por ejemplo `npm test`)
C. Not yet defined
X. Other (please specify)

[Answer]: A

## Consolidated Summary Confirmation

- Cuatro Bolts, uno por unidad: base común, definición del proceso, recorrido y catálogo (Q1)
- Orden por valor dentro de lo que permiten las dependencias: base común y definición del proceso primero (son independientes entre sí), luego el recorrido, luego el catálogo (Scope Definition Q6 y grafo de Units Generation)
- No hay un riesgo concreto que atacar primero; los hallazgos R-01 y R-02 siguen como riesgo aceptado y se verifican dentro de su Bolt (Q2)
- El comando de comprobación se decide al terminar la primera unidad, cuando ya exista el proyecto (Q3)
- Todo lo construye el agente desarrollador desde esta sesión, en serie y unidad a unidad; sin dependencias externas ni walking skeleton

Does this all look correct before I generate the artifact?

- Looks correct
- Request changes

[Answer]: Looks correct
