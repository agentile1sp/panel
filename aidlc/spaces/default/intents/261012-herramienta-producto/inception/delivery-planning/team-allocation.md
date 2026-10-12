# Asignación de los Bolts

Un **Bolt** es una pasada de construcción sobre una parte del trabajo que termina en algo que funciona y se puede probar. Este documento dice quién construye cada Bolt de `bolt-plan.md`, sobre las unidades de `inception/units-generation/unit-of-work.md`.

## Quién construye

En este recorrido no hubo etapa de formación de equipo. La herramienta la construyes tú con Claude Code y AI-DLC, con el tiempo que haga falta (Approval & Handoff, Q2). Por eso todos los Bolts los ejecuta el agente desarrollador (`aidlc-developer-agent`, IA) desde esta misma sesión, y tú apruebas el resultado de cada uno.

| Bolt | Unidad | Construye | Aprueba |
|---|---|---|---|
| B1 · Base común | U1 `u1-base` | aidlc-developer-agent | Tú |
| B2 · Definición del proceso | U2 `u2-definicion-proceso` | aidlc-developer-agent | Tú |
| B3 · Recorrido | U3 `u3-recorrido` | aidlc-developer-agent | Tú |
| B4 · Catálogo | U4 `u4-catalogo` | aidlc-developer-agent | Tú |

## Forma de trabajo

- **Una sola sesión:** no hay equipos que se repartan unidades, así que no hace falta un tablero de coordinación entre equipos.
- **Uno tras otro:** los Bolts se construyen en serie, una unidad cada vez; cada unidad termina con su comprobación antes de empezar la siguiente.
- **Rama de trabajo:** según `org.md`, cada Bolt se integra en `main` desde una rama corta, con un único commit por Bolt.
