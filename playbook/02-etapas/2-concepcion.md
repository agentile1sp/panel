# Capítulo 02 · Etapas · 2 · Concepción

> ¿Qué exactamente, en qué partes y en qué orden? Convierte lo acordado en requisitos, diseño, unidades y un plan de construcción.

**9 etapas:** 3 ALWAYS y 6 condicionales. [Volver al índice](00-indice.md)

| Etapa                     | Tipo        | Lidera          | En una frase                                                                                                                                 |
| ------------------------- | ----------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.1 Reverse Engineering   | Condicional | developer       | Analiza **el código existente** para entender qué hace, cómo está organizado y en qué estado está.                                           |
| 2.2 Practices Discovery   | Condicional | pipeline-deploy | Descubre **cómo trabaja el equipo**: ramas, pruebas, despliegue y estilo de código. Al aprobarlo, se guarda en `team.md`.                    |
| 2.3 Requirements Analysis | ALWAYS      | product         | Convierte lo acordado en **requisitos que se puedan probar**.                                                                                |
| 2.4 User Stories          | Condicional | product         | Escribe **personas e historias de usuario** con sus criterios de aceptación y prioridad.                                                     |
| 2.5 Refined Mockups       | Condicional | design          | Pasa de los bocetos a **pantallas detalladas**: interacción, estados, sistema de diseño y accesibilidad.                                     |
| 2.6 Domain Design         | Condicional | architect       | Define **los componentes del sistema**, qué datos posee cada uno y las **decisiones de arquitectura**.                                       |
| 2.7 Units Generation      | ALWAYS      | architect       | Divide el sistema en **unidades construibles** y define en qué orden dependen unas de otras.                                                 |
| 2.8 Contract Design       | Condicional | architect       | Fija **los contratos entre unidades y las APIs públicas**: qué se envía, qué se recibe y quién es dueño de cada uno.                         |
| 2.9 Delivery Planning     | ALWAYS      | delivery        | Ordena la construcción en ***bolts***, que son ciclos cortos de construcción, cada uno con su definición de terminado, y señala los riesgos. |

---

### 2.1 Reverse Engineering

*Ingeniería inversa.* Analiza **el código existente** para entender qué hace, cómo está organizado y en qué estado está.

| Ficha | |
|---|---|
| Tipo | **Condicional** · Cuando el proyecto ya tiene código. Se salta en proyectos nuevos. Si ya se analizó antes y el código no cambió, puedes reutilizar el análisis. |
| Lidera | developer |
| Apoyan | architect |
| Revisa | — |
| Cómo trabaja | Cadena de agentes: uno empieza y otro termina |
| Sensores | `required-sections`, `upstream-coverage` |
| Scopes que la incluyen | `poc`, `bugfix`, `express`, `refactor`, `security-patch`, `classic`, `mvp`, `workshop`, `feature`, `enterprise` (10) |
| Interacción contigo | Gate |

**Entra:** El código del repositorio (o de varios repositorios).

**Sale:** Nueve documentos en `codekb/<repositorio>/`: negocio, arquitectura, estructura del código, APIs, inventario de componentes, tecnologías, dependencias, calidad del código y fecha del análisis.

**Pasos:**
1. Comprueba las condiciones y, si ya existe un análisis, si sigue vigente.
2. El agente developer escanea el código.
3. El agente architect sintetiza el resultado en los nueve documentos, con diagramas.
4. Prepara el traspaso.
5. Presenta el resultado y pide aprobación.

> Es una cadena: developer escanea y architect sintetiza.

---

### 2.2 Practices Discovery

*Descubrir las prácticas del equipo.* Descubre **cómo trabaja el equipo**: ramas, pruebas, despliegue y estilo de código. Al aprobarlo, se guarda en `team.md`.

| Ficha | |
|---|---|
| Tipo | **Condicional** · Se vuelve a ejecutar siempre que el scope la incluye, para que esté al día. En un proyecto existente se basa en evidencia; en uno nuevo, te pregunta partiendo de los valores por defecto. |
| Lidera | pipeline-deploy |
| Apoyan | quality, developer, devsecops |
| Revisa | — |
| Cómo trabaja | Se lanza un subagente que hace el trabajo |
| Sensores | `required-sections`, `upstream-coverage` |
| Scopes que la incluyen | `infra`, `classic`, `mvp`, `workshop`, `feature`, `enterprise` (6) |
| Interacción contigo | Preguntas, confirmación del resumen, gate |

**Entra:** En un proyecto existente: el análisis del código, el historial de Git y la configuración de CI. En uno nuevo: los valores por defecto de `org.md`.

**Sale:** `team-practices.md`, `discovered-rules.md` (reglas obligatorias y prohibidas), `evidence.md` y una contribución por agente de apoyo. Al aprobar, las prácticas pasan a `memory/team.md`.

**Qué pregunta:**
- Forma de trabajar y ramas
- Esqueleto inicial
- Postura de pruebas
- Despliegue
- Estilo de código

**Pasos:**
1. Comprueba las condiciones.
2. El líder (pipeline-deploy) escribe un borrador.
3. Si están activos los agentes de apoyo, quality, developer y devsecops revisan el borrador cada uno por su lado, sin ver lo que dicen los demás.
4. Entrevista contigo sobre las cinco áreas.
5. El líder integra todo.
6. Ritual de aprendizajes y **gate de confirmación** de las prácticas.
7. Si apruebas, las prácticas se copian a `team.md`.
8. Registra la aprobación.

---

### 2.3 Requirements Analysis

*Análisis de requisitos.* Convierte lo acordado en **requisitos que se puedan probar**.

| Ficha | |
|---|---|
| Tipo | **ALWAYS** · Siempre: la profundidad se ajusta a la complejidad. |
| Lidera | product |
| Apoyan | — |
| Revisa | product-lead (consultiva) |
| Cómo trabaja | La conversación principal hace el trabajo |
| Sensores | `required-sections`, `upstream-coverage` |
| Scopes que la incluyen | todos (11) |
| Interacción contigo | Preguntas, confirmación del resumen, revisión de product-lead, gate |

**Entra:** Tu descripción, la intención, el alcance, las prácticas del equipo y, en proyectos existentes, el análisis del código.

**Sale:** `requirements.md`: requisitos funcionales y no funcionales, cada uno con un criterio de aceptación.

**Qué pregunta:**
- Las preguntas dependen de lo que falte tras analizar la petición: comportamiento esperado, usuarios, reglas, límites, calidad…

**Pasos:**
1. Carga el contexto anterior.
2. Analiza la petición: claridad, tipo, alcance y complejidad.
3. Decide la profundidad.
4. Evalúa los requisitos que ya existen.
5. Detecta qué falta.
6. Genera preguntas.
7. Recoge y analiza las respuestas.
8. Hace preguntas de seguimiento.
9. Confirma contigo un resumen.
10. Escribe los requisitos.
11. Prepara el traspaso.
12. Presenta el resultado y pide aprobación.

---

### 2.4 User Stories

*Historias de usuario.* Escribe **personas e historias de usuario** con sus criterios de aceptación y prioridad.

| Ficha | |
|---|---|
| Tipo | **Condicional** · Cuando hay funcionalidades para usuarios, varias personas, lógica de negocio compleja o trabajo entre equipos. Se salta en refactors, bugs aislados, infraestructura o herramientas internas de desarrollo. |
| Lidera | product |
| Apoyan | design, developer, quality |
| Revisa | product-lead (consultiva) |
| Cómo trabaja | Varios agentes trabajan juntos (mob) |
| Sensores | `required-sections`, `upstream-coverage`, `traceability` |
| Scopes que la incluyen | `classic`, `mvp`, `workshop`, `feature`, `enterprise` (5) |
| Interacción contigo | Preguntas, confirmación del resumen, revisión de product-lead, gate |

**Entra:** Los requisitos.

**Sale:** `personas.md`, `stories.md` (historias con criterios Given/When/Then y prioridad MoSCoW), una evaluación y la trazabilidad.

**Qué pregunta:**
- ¿Quiénes son los usuarios y qué buscan?
- ¿Con qué granularidad se escriben las historias?
- ¿Cómo se dividen: por funcionalidad, persona, flujo o dominio?

**Pasos:**
1. Carga el rol del líder.
2. Valida que hagan falta historias.
3. Carga el contexto.
4. Parte 1: crea un plan de historias con preguntas.
5. Recoge las respuestas.
6. Las analiza.
7. Presenta el plan y genera.
8. Parte 2: el líder escribe un borrador. Si están activos los agentes de apoyo, **varios agentes lo trabajan juntos** (developer, quality, design) y el líder integra sus aportes; si no, el líder lo completa solo.
9. Abre el gate.
10. Presenta el resultado y pide aprobación.

> Está pensada como etapa en grupo (mob): con los agentes de apoyo activos, varios agentes aportan a la vez.

---

### 2.5 Refined Mockups

*Pantallas refinadas.* Pasa de los bocetos a **pantallas detalladas**: interacción, estados, sistema de diseño y accesibilidad.

| Ficha | |
|---|---|
| Tipo | **Condicional** · Cuando hay interfaz y se hicieron bocetos en Ideación. En APIs, refina los diagramas de interacción. |
| Lidera | design |
| Apoyan | product |
| Revisa | product-lead (consultiva) |
| Cómo trabaja | La conversación principal hace el trabajo |
| Sensores | `required-sections`, `upstream-coverage` |
| Scopes que la incluyen | `classic`, `mvp`, `workshop`, `feature`, `enterprise` (5) |
| Interacción contigo | Preguntas, confirmación del resumen, revisión de product-lead, gate |

**Entra:** Bocetos e historias de usuario.

**Sale:** `mockups.md`, `interaction-spec.md`, `design-system-mapping.md` y `accessibility-checklist.md`.

**Qué pregunta:**
- ¿Cómo se representa cada historia en la interfaz?
- ¿Qué patrones de interacción hacen falta?
- ¿Qué estados maneja cada pantalla (carga, vacío, error, éxito)?
- ¿Se alinea con el sistema de diseño?
- ¿Qué nivel de accesibilidad?
- ¿Qué tamaños de pantalla?

**Pasos:**
1. Carga el contexto.
2. Genera las preguntas.
3. Recoge y analiza las respuestas.
4. Genera los documentos.
5. Prepara el traspaso.
6. Presenta el resultado y pide aprobación.

---

### 2.6 Domain Design

*Diseño del dominio.* Define **los componentes del sistema**, qué datos posee cada uno y las **decisiones de arquitectura**.

| Ficha | |
|---|---|
| Tipo | **Condicional** · Cuando hacen falta componentes nuevos. Se salta si solo se modifican componentes existentes. |
| Lidera | architect |
| Apoyan | aws-platform, design |
| Revisa | architecture-reviewer (consultiva) |
| Cómo trabaja | La conversación principal hace el trabajo |
| Sensores | `required-sections`, `upstream-coverage`, `traceability` |
| Scopes que la incluyen | `classic`, `mvp`, `workshop`, `feature`, `enterprise` (5) |
| Interacción contigo | Preguntas, confirmación del resumen, revisión de architecture-reviewer, gate |

**Entra:** Los requisitos y, si existen, las historias de usuario.

**Sale:** `components.md` (catálogo de componentes, diagrama, quién posee cada dato, dependencias externas y por qué cada componente es independiente) y `decisions.md` (decisiones de arquitectura en formato ADR: contexto, decisión, consecuencias y alternativas descartadas).

**Qué pregunta:**
- Las preguntas forman parte de un plan de diseño: límites entre componentes, propiedad de los datos, integraciones…

**Pasos:**
1. Carga el contexto.
2. Crea un plan de diseño con preguntas.
3. Recoge y analiza las respuestas.
4. Genera el catálogo de componentes. Si hay varias formas razonables de dividir, presenta las opciones.
5. Registra las decisiones de arquitectura (ADR).
6. Registra la trazabilidad.
7. Prepara el traspaso.
8. Presenta el resultado y pide aprobación.

---

### 2.7 Units Generation

*Generar las unidades.* Divide el sistema en **unidades construibles** y define en qué orden dependen unas de otras.

| Ficha | |
|---|---|
| Tipo | **ALWAYS** · Siempre que el scope la incluya. Viaja junto con 2.9: o se ejecutan las dos o ninguna. |
| Lidera | architect |
| Apoyan | delivery |
| Revisa | architecture-reviewer (consultiva) |
| Cómo trabaja | La conversación principal hace el trabajo |
| Sensores | `required-sections`, `upstream-coverage`, `traceability` |
| Scopes que la incluyen | `classic`, `mvp`, `workshop`, `feature`, `enterprise` (5) |
| Interacción contigo | Preguntas, confirmación del resumen, aprobación del plan, revisión de architecture-reviewer, gate |

**Entra:** Componentes, requisitos y, si existen, historias.

**Sale:** `unit-of-work.md` (cada unidad: identificador, responsabilidades, tipo y complejidad), `unit-of-work-dependency.md` (el grafo de dependencias, sin ciclos) y `unit-of-work-story-map.md` (qué requisito o historia va en cada unidad).

**Qué pregunta:**
- Las preguntas forman parte de un plan de división: tamaño de las unidades, límites, despliegue…

**Pasos:**
1. Carga el contexto.
2. Crea un plan de división con preguntas.
3. Recoge y analiza las respuestas.
4. **Pide aprobar el plan** antes de generar.
5. Genera las unidades, sus dependencias y el mapa con los requisitos.
6. Prepara el traspaso.
7. Presenta el resultado y pide aprobación.

---

### 2.8 Contract Design

*Diseño de contratos.* Fija **los contratos entre unidades y las APIs públicas**: qué se envía, qué se recibe y quién es dueño de cada uno.

| Ficha | |
|---|---|
| Tipo | **Condicional** · Cuando hay más de una unidad que se integran o una API usada desde fuera. Se salta solo con una unidad sin límites internos ni API externa. |
| Lidera | architect |
| Apoyan | aws-platform |
| Revisa | architecture-reviewer (consultiva) |
| Cómo trabaja | La conversación principal hace el trabajo |
| Sensores | `required-sections`, `upstream-coverage` |
| Scopes que la incluyen | `classic`, `mvp`, `workshop`, `feature`, `enterprise` (5) |
| Interacción contigo | Preguntas, confirmación del resumen, revisión de architecture-reviewer, gate |

**Entra:** Unidades, componentes y requisitos.

**Sale:** `contract-summary.md`: tabla de contratos, la especificación de cada uno, reglas de propiedad y cambios, y preguntas abiertas.

**Qué pregunta:**
- Las preguntas forman parte de un plan de contratos: formatos, versionado, quién consume qué…

**Pasos:**
1. Carga el contexto.
2. Crea un plan de contratos con preguntas.
3. Recoge y analiza las respuestas.
4. Genera el resumen de contratos.
5. Prepara el traspaso.
6. Presenta el resultado y pide aprobación.

---

### 2.9 Delivery Planning

*Plan de entregas.* Ordena la construcción en ***bolts***, que son ciclos cortos de construcción, cada uno con su definición de terminado, y señala los riesgos.

| Ficha | |
|---|---|
| Tipo | **ALWAYS** · Siempre que el scope la incluya: cierra Concepción. |
| Lidera | delivery |
| Apoyan | architect |
| Revisa | — |
| Cómo trabaja | La conversación principal hace el trabajo |
| Sensores | `required-sections`, `upstream-coverage` |
| Scopes que la incluyen | `classic`, `mvp`, `workshop`, `feature`, `enterprise` (5) |
| Interacción contigo | Preguntas, confirmación del resumen, gate |

**Entra:** Todo lo de Concepción.

**Sale:** `bolt-plan.md` (los bolts y su orden), `team-allocation.md`, `risk-and-sequencing-rationale.md` (riesgos y por qué ese orden) y `external-dependency-map.md`.

**Qué pregunta:**
- ¿Priorizar con un modelo formal (WSJF: valor y urgencia frente a tamaño)?
- ¿Qué tamaño tiene un bolt: una unidad, varias o cortes transversales?
- ¿Se pueden construir bolts en paralelo?
- ¿Qué es lo que más preocupa, para atacarlo primero?
- Por cada bolt: ¿qué unidades incluye, cuándo está terminado y qué aprenderemos al entregarlo?

**Pasos:**
1. Carga el contexto.
2. Genera las preguntas.
3. Recoge y analiza las respuestas. También define cómo será la Construcción: unidad por unidad o etapa por etapa, el comando para verificar que funciona y quién construye.
4. Genera los documentos.
5. Verifica el cierre de fase.
6. Prepara el traspaso.
7. Presenta el resultado y pide aprobación.

---

**Fuentes:** ficha generada desde `.claude/tools/data/stage-graph.json` y `scope-grid.json`; textos resumidos y traducidos de cada archivo de `.claude/aidlc-common/stages/`. Versión 2.11.0.
