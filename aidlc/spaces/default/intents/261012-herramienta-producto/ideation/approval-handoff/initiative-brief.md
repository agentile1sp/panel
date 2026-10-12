# Brief de la iniciativa: herramienta de producto del panel

Resumen de una página de la Ideación. Reúne la declaración de intención (`ideation/intent-capture/intent-statement.md`), el mapa de interesados (`ideation/intent-capture/stakeholder-map.md`), el documento de alcance (`ideation/scope-definition/scope-document.md`) y el backlog (`ideation/scope-definition/intent-backlog.md`), con los cambios decididos en esta etapa. Donde este brief y esos documentos difieran, manda este brief.

## Intención y problema

- **Qué es:** una herramienta para recorrer la etapa 3 · Producto del proceso de producto, con un catálogo de productos y el recorrido de cada uno paso a paso.
- **Problema que resuelve en esta versión:** hoy no se ve de un vistazo en qué paso está cada producto ni qué se produjo en cada paso.
- **Problema que no resuelve todavía:** que los datos se copien a mano entre pasos y se desincronicen. Se decidió posponerlo para simplificar la primera versión (decisión DL-09 del registro de decisiones).
- **Para quién:** una única persona usuaria, que define el proceso, lo recorre e introduce los datos.

## Criterio rector de esta versión

**Todo se introduce a mano**, para que la herramienta sea más sencilla en esta primera etapa. Ningún paso calcula ni deriva datos de otro: ni los pasos estructurados (mapa de piezas, fichas, story map, cierre del alcance) ni las tablas CRUD y de estados.

## Criterios de éxito vigentes

| # | Criterio | Cómo se comprueba |
|---|---|---|
| E1 | Recorrido completo | Un producto ficticio se lleva por los 10 pasos de la etapa 3 · Producto dentro de la herramienta, de principio a fin |
| E3 | Visibilidad en el catálogo | Desde el catálogo se ve en qué paso va cada producto |
| E4 | Visibilidad del recorrido | Al entrar en un producto se ve el estado de cada uno de los 10 pasos y lo que se creó en cada uno |

E2 (datos derivados) y E5 (origen de los datos) salen de esta versión (DL-09, DL-10).

## Validación de mercado

No aplica: es una herramienta personal y el estudio de mercado no forma parte de este recorrido.

## Viabilidad y riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Todo es imprescindible y se quiere cuanto antes | Media | Medio | El recorte ya se hizo: proceso fijo y sin transformaciones automáticas. Recursos: el tiempo que haga falta (DL-11) |
| Los datos de los pasos se desincronizan porque se copian a mano | Alta | Bajo en esta versión | Aceptado conscientemente para simplificar; se retoma en una versión posterior (DL-09) |
| Cambiar el proceso más adelante obligue a rehacer la herramienta | Baja | Alto | El proceso se describe en una definición separada (DL-06) |

## Límite del alcance

**Dentro:** catálogo de productos; recorrido de cada producto por los 10 pasos con el estado de cada paso y lo creado; pasos de texto; pasos estructurados; pasos visuales con checklist y enlace o adjunto; tablas CRUD y de estados; registros transversales (acuerdos, y gaps y supuestos); definición del proceso separada y fija; datos de ejemplo ficticios. Todo introducido a mano.

**Fuera:** cualquier transformación automática de datos entre pasos; mostrar de qué pasos tomó datos cada paso; cambiar el proceso (agregar, eliminar o mover etapas y pasos); etapas 1 y 2; conexión en tiempo real con AI-DLC; despliegue, autenticación e integraciones; edición visual; otras vistas del panel; varios usuarios.

## Backlog vigente

Ocho piezas, todas Must, en orden de valor primero: IB-1 Definición del proceso, IB-2 Catálogo, IB-3 Recorrido, IB-4 Pasos de texto, IB-5 Pasos estructurados, IB-6 Pasos visuales, IB-7 Tablas de las fichas, IB-8 Registros transversales. IB-9 e IB-10 salen (DL-09, DL-10).

## Elementos visuales

No hay mockups en este recorrido. La referencia visual del proceso es `docs/proceso-producto/proceso-producto.html`.

## Plan de equipo

La persona usuaria construye la herramienta con Claude Code y AI-DLC, el tiempo que haga falta hasta terminar (DL-11). No hay más equipo. Su equipo es interesado en el piloto de AI-DLC, no en la herramienta.

## Recomendación

**Go.** El alcance es pequeño y está acotado: una herramienta local de un solo usuario, con todo introducido a mano y riesgo bajo. Las decisiones que lo redujeron están registradas y dejan la puerta abierta a las versiones siguientes.

## Assumptions & Open Questions

- Pregunta abierta para Requirements Analysis: qué valores de estado tiene cada paso y qué cuenta como "lo que se creó" (hallazgo R-02 de la revisión de la intención).
- Pregunta abierta para Requirements Analysis: los términos del proceso (fichas, story map, walking skeleton) se definen en `docs/proceso-producto/LEEME.md`, que debe acompañar a los requisitos (hallazgo R-03).
