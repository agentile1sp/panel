# Backlog de la intención: herramienta de producto del panel

Primer corte del trabajo en piezas que se pueden construir por separado (proto-unidades). Sale del documento de alcance (`scope-document.md`) y de la declaración de intención aprobada (`ideation/intent-capture/intent-statement.md`).

## Prioridad (MoSCoW)

Todas las piezas del alcance son **Must** (Q2: nada es prescindible). El orden de entrega sigue el criterio de valor primero (Q6).

| Orden | Pieza | Qué incluye | Alcance | Criterio de éxito | Depende de | MoSCoW |
|---|---|---|---|---|---|---|
| 1 | IB-1 Definición del proceso | La etapa 3 con sus 10 pasos, el tipo de cada paso y de qué pasos toma datos; fija en esta versión y separada de la herramienta | D10 | Base de E1 | — | Must |
| 2 | IB-2 Catálogo de productos | Lista de productos con el paso en que va cada uno; datos de ejemplo ficticios | D1, D11 | E3 | IB-1 | Must |
| 3 | IB-3 Recorrido de un producto | Los 10 pasos de un producto con su estado y lo que se creó en cada uno | D2 | E1, E4 | IB-1, IB-2 | Must |
| 4 | IB-4 Pasos de texto | Hipótesis, línea base y walking skeleton con estructura mínima | D3 | E1 | IB-3 | Must |
| 5 | IB-5 Pasos estructurados | Mapa de piezas, fichas de capacidad y de instancia, story map y cierre del alcance | D4 | E1 | IB-3 | Must |
| 6 | IB-6 Pasos visuales | User flow, wireframes y mockups con su checklist y un enlace o archivo adjunto | D5 | E1 | IB-3 | Must |
| 7 | IB-7 Tablas de las fichas | Tabla CRUD y tabla de estados | D6 | E1 | IB-5 | Must |
| 8 | IB-8 Registros transversales | Acuerdos, y gaps y supuestos | D9 | — | IB-3 | Must |
| 9 | IB-9 Transformación automática | Un paso toma sus datos de pasos anteriores sin copiarlos a mano; cuál, por decidir (Q10) | D7 | E2 | IB-5 | Must |
| 10 | IB-10 Origen de los datos | En cada paso se ve de qué pasos anteriores tomó sus datos | D8 | E5 | IB-1, IB-9 | Must |

## Won't Have (esta vez)

| Pieza | Motivo |
|---|---|
| Cambiar el proceso (agregar, eliminar o mover etapas y pasos) | En esta versión el proceso es fijo (Q4, Q8) |
| Productos a mitad de recorrido ante un cambio de proceso | Fuera de alcance (Q5) |
| Las otras cinco transformaciones de datos | Una sola es automática (Q3, Q9) |
| Edición visual, otras vistas del panel y varios usuarios | Excluidos en la declaración de intención |
| Etapas 1 y 2, tiempo real con AI-DLC, despliegue, autenticación e integraciones | Excluidos en la declaración de intención |

## Notas de priorización

- **Todo es Must.** La guía MoSCoW advierte que, si todo es imprescindible, no hay priorización real. Aquí el recorte ya se hizo antes, en la transformación única y el proceso fijo (Q3, Q4, Q8), y el orden de entrega sirve de orden de recorte si falta tiempo (ver `scope-document.md`, Riesgos de alcance).
- **Dependencia crítica.** La definición del proceso (IB-1) va primero porque el catálogo y el recorrido necesitan saber qué pasos existen.

## Assumptions & Open Questions

- [assumption] El orden de entrega es también el orden de recorte si el plazo de unas horas no alcanza (Q7); no se ha confirmado.
- Pregunta abierta para Requirements Analysis: qué transformación automatiza IB-9 (Q10).
