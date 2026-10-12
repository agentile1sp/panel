# Por qué este orden de Bolts

Un **Bolt** es una pasada de construcción sobre una parte del trabajo que termina en algo que funciona y se puede probar. Este documento explica el orden de `bolt-plan.md` y los riesgos que quedan abiertos, a partir del grafo de `inception/units-generation/unit-of-work-dependency.md` y de las respuestas de `delivery-planning-questions.md`.

## Criterio de orden: valor primero

Elegiste construir primero lo más valioso: el catálogo y el recorrido visibles cuanto antes (Scope Definition, Q6 B). Es el criterio "valor primero": ordenar por el valor que entrega cada parte cuando el riesgo es bajo, que es el caso de esta herramienta local, de un solo usuario y con todo introducido a mano (brief de la iniciativa).

No se usa un modelo de puntuación formal, como el WSJF (que pondera valor, urgencia y reducción de riesgo frente al tamaño de cada trabajo): con cuatro unidades y un grafo que casi fija el orden, no cambiaría el resultado.

## Lo que permite el grafo

| Unidad | Depende de |
|---|---|
| U1 `u1-base` | — |
| U2 `u2-definicion-proceso` | — |
| U3 `u3-recorrido` | U1, U2 |
| U4 `u4-catalogo` | U1, U3 |

El valor visible está en U3 y U4, pero U3 necesita U1 y U2, y U4 necesita U3. Por eso el valor primero se traduce en llegar a U3 y U4 por el camino más corto: U1 y U2 primero, luego U3 y luego U4. El orden del plan (B1 U1, B2 U2, B3 U3, B4 U4) respeta el grafo; no hay ninguna desviación que justificar.

Entre U1 y U2 no hay dependencia. Va primero U1 porque es la que arranca la aplicación y deja algo que se ve funcionando desde el primer Bolt.

## Tamaño de los Bolts

Un Bolt por unidad (Q1). Cada Bolt termina en algo que se prueba solo y coincide con el corte que ya usa la construcción, unidad a unidad. Se descartaron juntar U1 y U2 en un Bolt (una parada menos, pero un Bolt con dos cosas que no se relacionan) y un Bolt único (sin paradas para revisar hasta el final).

## Riesgos

No elegiste ningún riesgo concreto para atacar primero (Q2). Los riesgos conocidos y cómo se tratan:

| Riesgo | Probabilidad | Impacto | Tratamiento |
|---|---|---|---|
| Nadie es dueño de montar la aplicación: quién valida la definición al arrancar y cómo llegan recorrido y catálogo al servidor local (hallazgo R-01 de Units Generation, aceptado como riesgo) | Media | Medio | Se resuelve al construir: B1 deja el punto de arranque y B2 la validación; B3 y B4 se conectan a ese punto sin crear dependencias nuevas en el grafo |
| Una operación que toca catálogo y recorrido falla a la mitad, o falla el propio deshacer (hallazgo R-02, aceptado como riesgo) | Baja | Medio | B1 ofrece el deshacer y B4 lo usa; la condición de terminado de B4 comprueba el fallo de la segunda escritura. Una caída del proceso entre las dos escrituras queda como riesgo aceptado |
| B3 es la unidad más grande (21 requisitos, complejidad L) | Media | Medio | Su orden interno de `unit-of-work-story-map.md` va de las reglas a las pantallas; los pasos estructurados se prueban con varios elementos desde el principio |
| No hay tecnología elegida ni comando de comprobación | Alta | Bajo | La tecnología se elige al generar el código de B1, y el comando de comprobación se decide al terminar B1 (Q3) |
| Todo se quiere en pocas horas (Scope Definition, Q7) | Media | Bajo | El alcance ya se recortó: proceso fijo y sin transformaciones automáticas. Si falta tiempo, se decide en la aprobación de cada Bolt |
