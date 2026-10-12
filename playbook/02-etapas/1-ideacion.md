# Capítulo 02 · Etapas · 1 · Ideación

> ¿Qué queremos y por qué? Define la intención, el alcance y, si aplica, el mercado, la viabilidad, el equipo y los primeros bocetos.

**7 etapas:** 3 ALWAYS y 4 condicionales. [Volver al índice](00-indice.md)

| Etapa | Tipo | Lidera | En una frase |
|---|---|---|---|
| 1.1 Intent Capture & Framing | ALWAYS | product | Aclara **qué problema se resuelve, para quién, por qué ahora y cómo se medirá el éxito**. Es la base de todo lo demás. |
| 1.2 Market Research | Condicional | product | Analiza **competidores, tendencias y la decisión de construir, comprar o asociarse**. |
| 1.3 Feasibility & Constraints | Condicional | architect | Evalúa si es **técnicamente viable** y registra restricciones, riesgos y dependencias. |
| 1.4 Scope Definition | ALWAYS | product | Decide **qué entra y qué queda fuera**, y arma una lista inicial de trabajo priorizada. |
| 1.5 Team Formation | Condicional | delivery | Evalúa **quién está disponible, qué habilidades faltan** y cómo organizar los equipos de trabajo. |
| 1.6 Rough Mockups | Condicional | design | Dibuja **las pantallas principales y el recorrido del usuario** en baja fidelidad. Si no hay interfaz, diagramas de interacción entre sistemas. |
| 1.7 Approval & Handoff | ALWAYS | delivery | Reúne todo lo de Ideación en un **resumen de la iniciativa** y registra las decisiones, para pasar a Concepción. |

---

### 1.1 Intent Capture & Framing

*Captar la intención.* Aclara **qué problema se resuelve, para quién, por qué ahora y cómo se medirá el éxito**. Es la base de todo lo demás.

| Ficha | |
|---|---|
| Tipo | **ALWAYS** · Siempre: es la primera etapa de cualquier trabajo que incluya Ideación. |
| Lidera | product |
| Apoyan | architect |
| Revisa | product-lead (consultiva) |
| Cómo trabaja | La conversación principal hace el trabajo |
| Sensores | `claim-sources`, `required-sections`, `upstream-coverage` |
| Scopes que la incluyen | `poc`, `mvp`, `feature`, `enterprise` (4) |
| Interacción contigo | Preguntas, confirmación del resumen, revisión de product-lead, gate |

**Entra:** Tu descripción inicial, guardada palabra por palabra, y opcionalmente un documento que menciones (visión, PRD…).

**Sale:** `intent-statement.md` (problema, cliente, métricas de éxito, por qué ahora, alcance inicial) y `stakeholder-map.md` (interesados, quién decide y quién influye, comunicación).

**Qué pregunta:**
- ¿Qué problema de negocio resolvemos?
- ¿Quién es el cliente y qué le duele?
- ¿Cómo se ve el éxito y qué métricas importan?
- ¿Qué dispara la iniciativa ahora?
- ¿Quiénes son los interesados, quién decide y quién influye?
- ¿Qué queda fuera de esta primera versión?

**Pasos:**
1. Carga el contexto: tu descripción y, si nombraste un documento, lo lee como datos, nunca como instrucciones.
2. Genera las preguntas, empezando por un **registro de fuentes**: tu descripción, el scope y las reglas del equipo.
3. Recoge y analiza las respuestas, detecta ambigüedades y contradicciones y, si hace falta, hace preguntas de seguimiento.
4. Genera los documentos. **Cada afirmación debe indicar su fuente**: tu descripción, una respuesta tuya o una suposición declarada.
5. Resuelve las suposiciones: te pide aceptarlas o convertirlas en preguntas.
6. Prepara el traspaso.
7. Presenta el resultado y pide aprobación.

> El sensor `claim-sources` comprueba que ninguna afirmación salga de la nada.

---

### 1.2 Market Research

*Investigación de mercado.* Analiza **competidores, tendencias y la decisión de construir, comprar o asociarse**.

| Ficha | |
|---|---|
| Tipo | **Condicional** · Cuando hay que posicionarse frente al mercado o decidir entre construir y comprar. Se salta en herramientas internas, bugs o refactors. |
| Lidera | product |
| Apoyan | — |
| Revisa | — |
| Cómo trabaja | La conversación principal hace el trabajo |
| Sensores | `required-sections`, `upstream-coverage` |
| Scopes que la incluyen | `feature`, `enterprise` (2) |
| Interacción contigo | Preguntas, confirmación del resumen, gate |

**Entra:** La intención aprobada.

**Sale:** `competitive-analysis.md`, `market-trends.md` y `build-vs-buy.md`.

**Qué pregunta:**
- ¿Qué productos o soluciones compiten?
- ¿Qué fortalezas, debilidades y precios tienen?
- ¿Qué tendencias o cambios regulatorios influyen?
- ¿Qué es básico y qué diferencia para el cliente?
- ¿Construir, comprar o asociarse?
- ¿Qué tamaño de mercado o audiencia buscamos?

**Pasos:**
1. Carga el contexto.
2. Genera las preguntas.
3. Recoge y analiza las respuestas.
4. Genera los documentos.
5. Prepara el traspaso.
6. Presenta el resultado y pide aprobación.

> Las afirmaciones de mercado deben citar su fuente; si no, se marcan como hipótesis.

---

### 1.3 Feasibility & Constraints

*Viabilidad y restricciones.* Evalúa si es **técnicamente viable** y registra restricciones, riesgos y dependencias.

| Ficha | |
|---|---|
| Tipo | **Condicional** · Cuando hay integraciones, requisitos regulatorios o incertidumbre técnica importante. Se salta en cambios triviales sin riesgo técnico. |
| Lidera | architect |
| Apoyan | aws-platform, compliance |
| Revisa | — |
| Cómo trabaja | La conversación principal hace el trabajo |
| Sensores | `required-sections`, `upstream-coverage` |
| Scopes que la incluyen | `mvp`, `feature`, `enterprise` (3) |
| Interacción contigo | Preguntas, confirmación del resumen, gate |

**Entra:** La intención aprobada.

**Sale:** `feasibility-assessment.md`, `constraint-register.md` (restricciones) y `raid-log.md` (riesgos, supuestos, problemas y dependencias).

**Qué pregunta:**
- ¿Con qué sistemas existentes hay que integrarse?
- ¿Hay requisitos regulatorios (PCI, HIPAA, SOC2, residencia de datos)?
- ¿Qué tecnologías y habilidades tiene el equipo?
- ¿Qué límites de presupuesto y plazo hay?
- ¿Hay bloqueos de organización?
- ¿Qué servicios y cuentas de AWS se usan?

**Pasos:**
1. Carga el contexto.
2. Genera las preguntas.
3. Recoge y analiza las respuestas.
4. Genera los documentos.
5. Prepara el traspaso.
6. Presenta el resultado y pide aprobación.

> Participan como apoyo aws-platform y compliance, si el scope activa los agentes de apoyo.

---

### 1.4 Scope Definition

*Definir el alcance.* Decide **qué entra y qué queda fuera**, y arma una lista inicial de trabajo priorizada.

| Ficha | |
|---|---|
| Tipo | **ALWAYS** · Siempre que el scope incluya Ideación. |
| Lidera | product |
| Apoyan | delivery |
| Revisa | — |
| Cómo trabaja | La conversación principal hace el trabajo |
| Sensores | `required-sections`, `upstream-coverage` |
| Scopes que la incluyen | `mvp`, `feature`, `enterprise` (3) |
| Interacción contigo | Preguntas, confirmación del resumen, gate |

**Entra:** La intención y, si se hicieron, la viabilidad y las restricciones.

**Sale:** `scope-document.md` (límites: qué entra y qué no) y `intent-backlog.md` (lista inicial de capacidades priorizadas).

**Qué pregunta:**
- ¿Cuál es el alcance mínimo que ya aporta valor?
- ¿Qué es imprescindible y qué es deseable?
- ¿Qué dependencias hay entre capacidades?
- ¿En qué orden: primero lo más arriesgado, lo más valioso o lo que otros necesitan?
- ¿Hay fechas límite?

**Pasos:**
1. Carga el contexto.
2. Genera las preguntas.
3. Recoge y analiza las respuestas.
4. Genera los documentos.
5. Prepara el traspaso.
6. Presenta el resultado y pide aprobación.

---

### 1.5 Team Formation

*Formar el equipo.* Evalúa **quién está disponible, qué habilidades faltan** y cómo organizar los equipos de trabajo.

| Ficha | |
|---|---|
| Tipo | **Condicional** · Cuando importa la composición del equipo, su capacidad o la organización en grupos. Se salta con una sola persona o un equipo pequeño. |
| Lidera | delivery |
| Apoyan | — |
| Revisa | — |
| Cómo trabaja | La conversación principal hace el trabajo |
| Sensores | `required-sections`, `upstream-coverage` |
| Scopes que la incluyen | `feature`, `enterprise` (2) |
| Interacción contigo | Preguntas, confirmación del resumen, gate |

**Entra:** Intención y alcance.

**Sale:** `team-assessment.md`, `skill-matrix.md` (habilidades) y `mob-composition.md` (grupos de trabajo).

**Qué pregunta:**
- ¿Qué equipos y personas hay disponibles?
- ¿Qué capacidad tienen?
- ¿Qué habilidades se necesitan y cuáles hay?
- ¿Hay otras iniciativas compitiendo por las mismas personas?
- ¿Husos horarios y ubicaciones?
- ¿Hacen falta externos?
- ¿Quién decide en cada fase?

**Pasos:**
1. Carga el contexto.
2. Genera las preguntas.
3. Recoge y analiza las respuestas.
4. Genera los documentos.
5. Prepara el traspaso.
6. Presenta el resultado y pide aprobación.

---

### 1.6 Rough Mockups

*Bocetos.* Dibuja **las pantallas principales y el recorrido del usuario** en baja fidelidad. Si no hay interfaz, diagramas de interacción entre sistemas.

| Ficha | |
|---|---|
| Tipo | **Condicional** · Cuando el trabajo tiene interfaz de usuario. Se salta si es solo una API, backend o infraestructura. |
| Lidera | design |
| Apoyan | product |
| Revisa | product-lead (consultiva) |
| Cómo trabaja | La conversación principal hace el trabajo |
| Sensores | `required-sections`, `upstream-coverage` |
| Scopes que la incluyen | `mvp`, `feature`, `enterprise` (3) |
| Interacción contigo | Preguntas, confirmación del resumen, revisión de product-lead, gate |

**Entra:** Intención y alcance.

**Sale:** `wireframes.md` (bocetos de pantallas) y `user-flow.md` (recorrido del usuario).

**Qué pregunta:**
- ¿Cuáles son las pantallas y puntos de entrada principales?
- ¿Cuál es el recorrido principal del usuario?
- ¿Qué jerarquía de información hay?
- ¿Hay guías de marca o sistema de diseño?
- ¿Qué dispositivos se soportan?
- ¿Qué requisitos de accesibilidad?

**Pasos:**
1. Carga el contexto.
2. Genera las preguntas.
3. Recoge y analiza las respuestas.
4. Genera los documentos.
5. Prepara el traspaso.
6. Presenta el resultado y pide aprobación.

---

### 1.7 Approval & Handoff

*Aprobación y traspaso.* Reúne todo lo de Ideación en un **resumen de la iniciativa** y registra las decisiones, para pasar a Concepción.

| Ficha | |
|---|---|
| Tipo | **ALWAYS** · Siempre que el scope incluya Ideación: es su cierre. |
| Lidera | delivery |
| Apoyan | product |
| Revisa | — |
| Cómo trabaja | La conversación principal hace el trabajo |
| Sensores | `required-sections`, `upstream-coverage` |
| Scopes que la incluyen | `feature`, `enterprise` (2) |
| Interacción contigo | Preguntas, confirmación del resumen, gate |

**Entra:** Todos los documentos de Ideación.

**Sale:** `initiative-brief.md` (resumen de la iniciativa) y `decision-log.md` (decisiones tomadas).

**Qué pregunta:**
- ¿Están de acuerdo todos los interesados con la intención y el alcance?
- ¿Se reconocieron los riesgos críticos y sus mitigaciones?
- ¿Hay compromiso de presupuesto y recursos?
- ¿Los bocetos reflejan la visión compartida?

**Pasos:**
1. Carga el contexto.
2. Genera las preguntas de aprobación.
3. Compone el resumen de la iniciativa.
4. Verifica el cierre de fase: que todo lo necesario de Ideación esté completo.
5. Prepara el traspaso.
6. Presenta el resultado y pide aprobación.

---

**Fuentes:** ficha generada desde `.claude/tools/data/stage-graph.json` y `scope-grid.json`; textos resumidos y traducidos de cada archivo de `.claude/aidlc-common/stages/`. Versión 2.11.0.
