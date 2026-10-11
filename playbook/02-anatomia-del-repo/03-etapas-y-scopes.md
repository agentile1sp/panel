# Capítulo 02 · Nivel 2 · Etapas y scopes (`aidlc-common/` y `scopes/`)

> **En una frase:** cada **etapa** es una receta escrita (qué hacer, quién, qué entra y qué sale), y cada **scope** es un menú: elige qué recetas se preparan y con cuánto rigor.

## 1 · `aidlc-common/`: el manual

| Contenido | Qué es | Cuántos |
|---|---|---:|
| `stages/<fase>/` | La definición de cada etapa, una carpeta por fase | 33 |
| `protocols/` | Las reglas comunes que se aplican a todas las etapas | 9 |
| `conductor.md` | Las instrucciones del jefe: cómo pedir al motor el siguiente paso, ejecutarlo e informar | 1 |

> Las 33 etapas, cada una con su ficha, qué entra, qué sale, qué pregunta y todos sus pasos, están en la [Referencia de etapas](../referencia-etapas/00-indice.md).

### Una etapa por dentro

Cada archivo de etapa tiene dos partes. Ejemplo real: `stages/inception/requirements-analysis.md`.

**Parte 1, la ficha.** Son datos que lee el motor; no son instrucciones para la IA.

| Campo | Valor en 2.3 Requirements Analysis | Qué significa |
|---|---|---|
| `execution` | `ALWAYS` | Siempre se ejecuta (ver capítulo 01) |
| `lead_agent` | `aidlc-product-agent` | Quién la lidera |
| `reviewer` | `aidlc-product-lead-agent` | Quién la revisa |
| `review_class` | `advisory` | Intensidad de la revisión: consultiva |
| `reviewer_max_iterations` | `2` | Máximo de rondas de revisión |
| `summary_confirmation` | `required` | Antes de escribir, te muestra un resumen de lo que entendió para que lo confirmes |
| `consumes` | intención, alcance, prácticas del equipo… | Qué documentos de etapas anteriores usa |
| `produces` | `requirements`, `requirements-analysis-questions` | Qué documentos genera |
| `sensors` | `required-sections`, `upstream-coverage` | Qué revisiones automáticas se aplican a sus documentos |
| `scopes` | los 11 | En qué scopes aparece |

**Parte 2, los pasos.** Son instrucciones para la IA. En esta etapa son 12:

1. Cargar el contexto anterior.
2. Analizar lo que se pide.
3. Decidir el nivel de detalle.
4. Evaluar los requisitos que ya existen.
5. Detectar qué falta.
6. Generar preguntas.
7. Recoger y analizar las respuestas.
8. Hacer preguntas de seguimiento.
9. Confirmar un resumen contigo.
10. Escribir los requisitos.
11. Preparar el traspaso.
12. Presentar el resultado y pedir aprobación.

### Los protocolos

| Protocolo | Cuándo se usa | Qué regula |
|---|---|---|
| `stage-protocol.md` | En **todas** las etapas | Las reglas generales: preguntas, aprobaciones, registro. Es el más largo, con unas 1.300 líneas |
| `stage-definition.md` | Al leer una etapa | La forma obligatoria que debe tener cada archivo de etapa |
| `stage-protocol-reviewer.md` | Cuando la etapa tiene revisor | Cómo se lanza el revisor y cómo se responde a sus observaciones |
| `stage-protocol-ensemble.md` | Cuando participan varios agentes | Cómo colaboran el líder y los agentes de apoyo |
| `stage-protocol-construction.md` | En Construcción | Puntos de control por unidad de código |
| `stage-protocol-swarm.md` | En Construcción en paralelo | Cómo trabajar varias unidades a la vez sin pisarse |
| `stage-protocol-learnings.md` | Antes de cada aprobación, si está activo | Cómo convertir tus correcciones en reglas permanentes (capítulo 03) |
| `stage-protocol-governance.md` | Al cambiar de fase | Comprobaciones al cerrar Ideación, Concepción y Construcción |
| `stage-protocol-recovery.md` | Al retomar una sesión | Cómo reconstruir dónde se quedó el trabajo |

## 2 · `scopes/`: el menú

Un scope decide dos cosas:
1. **Qué etapas** entran en el recorrido.
2. **Con cuánto rigor**: nivel de detalle, revisiones y controles.

### Qué etapas ejecuta cada scope

Ordenados de menor a mayor. Cada celda indica cuántas etapas de esa fase entran.

| Scope | Para qué | Inicial. | Ideación | Concepción | Construcción | Operación | **Total** |
|---|---|---:|---:|---:|---:|---:|---:|
| `poc` | Probar una idea rápido | 3 | 1 | 2 | 2 | 0 | **8** |
| `bugfix` | Corregir un bug | 3 | 0 | 2 | 2 | 2 | **9** |
| `express` | Lo más ligero: de requisitos a despliegue | 3 | 0 | 2 | 2 | 3 | **10** |
| `refactor` | Limpiar código existente | 3 | 0 | 2 | 3 | 2 | **10** |
| `security-patch` | Responder a una vulnerabilidad | 3 | 0 | 2 | 3 | 2 | **10** |
| `infra` | Cambios de infraestructura | 3 | 0 | 2 | 4 | 4 | **13** |
| `classic` | Concepción y Construcción completas | 3 | 0 | 9 | 6 | 0 | **18** |
| `mvp` | Construir lo esencial, sin operación | 3 | 4 | 9 | 7 | 0 | **23** |
| `workshop` | Sesión en grupo con aprobaciones obligatorias | 3 | 0 | 9 | 7 | 7 | **26** |
| `feature` | Ciclo completo para una funcionalidad nueva | 3 | 7 | 9 | 7 | 7 | **33** |
| `enterprise` | Funcionalidad regulada, con auditoría completa | 3 | 7 | 9 | 7 | 7 | **33** |

### Con cuánto rigor

| Scope | Detalle | Esqueleto | Revisión máxima | Controles | Aprobar plan de código | Confirmar resumen | Agentes de apoyo |
|---|---|---|---|---|---|---|---|
| `poc` | Minimal | sí | consultiva | apagados | no | sí | no |
| `bugfix` | Minimal | no | consultiva | apagados | sí | no | no |
| `express` | Minimal | no | **sin revisión** | apagados | no | no | no |
| `refactor` | Minimal | no | sin límite | apagados | sí | sí | no |
| `security-patch` | Minimal | no | sin límite | apagados | sí | sí | no |
| `infra` | Standard | sí | sin límite | apagados | sí | sí | no |
| `classic` | Standard | no | consultiva | apagados | sí | no | no |
| `mvp` | Standard | sí | sin límite | apagados | sí | sí | no |
| `workshop` | Standard | sí | consultiva | apagados | sí | sí | no |
| `feature` | Standard | sí | sin límite | apagados | sí | sí | no |
| `enterprise` | **Comprehensive** | sí | sin límite | **estrictos** | sí | sí | **sí** |

Qué significa cada columna:
- **Detalle** (*depth*): cuánto profundiza cada etapa. **Minimal**: pedido claro y acotado. **Standard**: alcance moderado, con algunas incógnitas. **Comprehensive**: alcance grande o dominio complejo.
- **Esqueleto** (*skeleton*): si se construye primero la porción mínima que funcione de punta a punta y la apruebas antes de seguir con el resto.
- **Revisión máxima** (*review_cap*): el tope de intensidad de las revisiones. "Sin límite" permite revisiones adversariales.
- **Controles** (*guard_policy*): el rigor ante cambios en documentos ya aprobados. **Apagados** no significa sin control: los cambios se registran y se avisan, y la presencia de una persona para aprobar se exige siempre.
- **Aprobar plan de código** (*plan_approval*): si hay que aprobar el plan antes de que se escriba código. Es el control del hook `plan-approval-guard`.
- **Confirmar resumen** (*summary_confirmation*): si, antes de escribir un documento, te muestra un resumen de lo que entendió para que lo confirmes.
- **Agentes de apoyo** (*collaborators*): si participan los agentes que apoyan al líder. Cuando está en "no", cada etapa la hace solo el agente líder. Se puede activar con `/aidlc --collaborators on`.

### Cuatro cosas que no se ven a primera vista

1. **El scope marca las etapas candidatas, pero las condicionales se siguen evaluando.** `poc` incluye 2.1 Reverse Engineering, pero si no hay código existente se salta. En un proyecto nuevo, `poc` ejecuta 7 etapas, no 8.
2. **ALWAYS no significa "en todos los scopes".** 1.1 Intent Capture es ALWAYS, pero `bugfix` no la incluye porque un bug no necesita definir una intención.
3. **`feature` y `enterprise` ejecutan las mismas 33 etapas.** Cambia el rigor: `enterprise` usa detalle Comprehensive y controles estrictos, y es el único scope en el que participan los agentes de apoyo.
4. **`poc` y `express` no piden aprobar el plan de código.** Lo dejan escrito y te avisan, pero empiezan a programar. Es decir, el scope puede relajar un control que en otros scopes es obligatorio.

---

**Fuentes:** ficha y pasos de `.claude/aidlc-common/stages/inception/requirements-analysis.md`; primera línea de cada archivo de `.claude/aidlc-common/protocols/`; ficha de cada archivo de `.claude/scopes/`; etapas por scope calculadas con `.claude/tools/data/scope-grid.json`. Versión 2.11.0.
