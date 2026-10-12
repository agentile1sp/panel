# Proceso de producto

La etapa **3 · Producto** del proceso de desarrollo: cómo la idea escogida se convierte en algo acotado y listo para construir. Es el mismo proceso para cualquier producto.

## Qué hay aquí

| Archivo | Qué es |
|---|---|
| [proceso-producto.html](proceso-producto.html) | El proceso visual: los 10 pasos, de qué pasos toma datos cada uno, sus entregables, los transversales, el paquete de producto y el glosario |
| [plantillas/](plantillas/) | Una plantilla por artefacto |

## Los 10 pasos y sus plantillas

| # | Paso | Toma de | Tipo de artefacto | Plantilla |
|---|---|---|---|---|
| 1 | Hipótesis | La idea escogida | Texto con estructura mínima | [01-hipotesis.md](plantillas/01-hipotesis.md) |
| 2 | Línea base | Idea escogida, Hipótesis | Texto con estructura mínima | [02-linea-base.md](plantillas/02-linea-base.md) |
| 3 | Walking skeleton | Hipótesis, Línea base | Texto con estructura mínima | [03-walking-skeleton.md](plantillas/03-walking-skeleton.md) |
| 4 | Mapa de piezas | Idea escogida, Walking skeleton | **Estructurado** | [04-mapa-de-piezas.md](plantillas/04-mapa-de-piezas.md) |
| 5 | Fichas | Mapa de piezas, Walking skeleton | **Estructurado** | [05a-ficha-capacidad.md](plantillas/05a-ficha-capacidad.md) · [05b-ficha-instancia.md](plantillas/05b-ficha-instancia.md) |
| 6 | User flow | Fichas | Visual, con checklist | [06-user-flow.md](plantillas/06-user-flow.md) |
| 7 | Story map | Fichas, User flow, Mapa de piezas | **Estructurado** | [07-story-map.md](plantillas/07-story-map.md) |
| 8 | Wireframes | User flow, Story map | Visual, con checklist | [08-wireframes.md](plantillas/08-wireframes.md) |
| 9 | Cierre del alcance | Todos los anteriores | **Estructurado** | [09-cierre-del-alcance.md](plantillas/09-cierre-del-alcance.md) |
| 10 | Mockups | Wireframes, Cierre del alcance | Visual, con checklist | [10-mockups.md](plantillas/10-mockups.md) |
| — | Acuerdos | Todos | Registro que se añade | [transversal-acuerdos.md](plantillas/transversal-acuerdos.md) |
| — | Gaps y supuestos | Todos | Registro que se revisa | [transversal-gaps-y-supuestos.md](plantillas/transversal-gaps-y-supuestos.md) |

## Cómo se transforman los datos

Las **fichas** son el corazón estructurado del proceso. De ellas se derivan los pasos siguientes:

| De… | Se obtiene… |
|---|---|
| Conexiones de las fichas | Las dependencias del mapa de piezas (segunda pasada) |
| Momentos de las fichas | La columna vertebral del story map y los pasos del user flow |
| Actores y criterios de aceptación | Las historias del story map, con su actor |
| Entrada y salida | Los objetos y la tabla CRUD |
| Estados de la salida | La tabla de estados |
| Fuera de alcance y walking skeleton | La línea de corte del story map |

## Origen

Proceso definido al construir el producto True Sense y corregido el 11 de octubre de 2026. Las correcciones y su motivo están en `~/cowork/True Sense 2.0/Correcciones/`.
