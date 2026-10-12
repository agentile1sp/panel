# Capítulo 02 · Etapas · 3 · Construcción

> ¿Funciona? Diseña cada unidad en detalle, genera el código y lo prueba. Las etapas 3.1 a 3.5 se repiten por cada unidad.

**7 etapas:** 2 ALWAYS y 5 condicionales. [Volver al índice](00-indice.md)

| Etapa | Tipo | Lidera | En una frase |
|---|---|---|---|
| 3.1 Functional Design | Condicional | architect | Diseña **los datos, las reglas de negocio y el comportamiento** de cada unidad. |
| 3.2 NFR Requirements | Condicional | architect | Define **rendimiento, seguridad, escalabilidad, fiabilidad y observabilidad**, y elige las tecnologías. |
| 3.3 NFR Design | Condicional | architect | Diseña **cómo se cumplen** los requisitos no funcionales: caché, cifrado, escalado, reintentos, métricas… |
| 3.4 Infrastructure Design | Condicional | aws-platform | Diseña **dónde y cómo corre** cada unidad: cómputo, bases de datos, red, monitoreo y pipeline. |
| 3.5 Code Generation | ALWAYS | developer | **Escribe el código y sus pruebas**: primero un plan que tú apruebas y después el código. |
| 3.6 Build and Test | ALWAYS | quality | **Construye la aplicación, ejecuta las pruebas** y deja los resultados. |
| 3.7 CI Pipeline | Condicional | pipeline-deploy | Configura **la integración continua**: qué se comprueba automáticamente antes de unir cambios. |

---

### 3.1 Functional Design

*Diseño funcional.* Diseña **los datos, las reglas de negocio y el comportamiento** de cada unidad.

| Ficha | |
|---|---|
| Tipo | **Condicional** · Cuando hay modelos de datos nuevos, lógica compleja o reglas de negocio. Se salta en cambios simples. |
| Lidera | architect |
| Apoyan | developer |
| Revisa | architecture-reviewer (adversarial) |
| Cómo trabaja | La conversación principal hace el trabajo |
| Sensores | `required-sections`, `upstream-coverage`, `linter`, `type-check`, `traceability` |
| Scopes que la incluyen | `refactor`, `classic`, `mvp`, `workshop`, `feature`, `enterprise` (6) |
| Interacción contigo | Preguntas, confirmación del resumen, revisión de architecture-reviewer, gate |

**Entra:** Los documentos de la unidad.

**Sale:** Por unidad: `entities.md` (entidades y atributos), `rules.md` (reglas de negocio numeradas), `functional-spec.md` (flujos y estados) y, si hay interfaz, `frontend-components.md`.

**Qué pregunta:**
- Las preguntas forman parte de un plan de diseño de la unidad.

**Pasos:**
1. Lee el contexto de la unidad.
2. Crea un plan de diseño funcional con preguntas.
3. Recoge y analiza las respuestas.
4. Genera los documentos.
5. Prepara el traspaso.
6. Cierra la etapa.

> Se ejecuta por cada unidad.

---

### 3.2 NFR Requirements

*Requisitos no funcionales.* Define **rendimiento, seguridad, escalabilidad, fiabilidad y observabilidad**, y elige las tecnologías.

| Ficha | |
|---|---|
| Tipo | **Condicional** · Cuando hay requisitos de ese tipo o falta elegir tecnologías. Se salta si no hay y la tecnología ya está decidida. |
| Lidera | architect |
| Apoyan | devsecops, compliance, quality |
| Revisa | architecture-reviewer (adversarial) |
| Cómo trabaja | La conversación principal hace el trabajo |
| Sensores | `required-sections`, `upstream-coverage`, `linter`, `type-check`, `traceability` |
| Scopes que la incluyen | `security-patch`, `infra`, `classic`, `mvp`, `workshop`, `feature`, `enterprise` (7) |
| Interacción contigo | Preguntas, confirmación del resumen, revisión de architecture-reviewer, gate |

**Entra:** Los documentos de la unidad.

**Sale:** Por unidad: un documento por cada categoría (rendimiento, seguridad, escalabilidad, fiabilidad y observabilidad) y `tech-stack-decisions.md`.

**Qué pregunta:**
- Tiempos de respuesta y volumen
- Autenticación, permisos y protección de datos
- Crecimiento esperado
- Disponibilidad y recuperación
- Monitoreo y alertas

**Pasos:**
1. Lee los documentos anteriores.
2. Evalúa qué categorías aplican.
3. Genera las preguntas.
4. Recoge y analiza las respuestas.
5. Genera los documentos.
6. Prepara el traspaso.
7. Cierra la etapa.

> Se ejecuta por cada unidad.

---

### 3.3 NFR Design

*Diseño no funcional.* Diseña **cómo se cumplen** los requisitos no funcionales: caché, cifrado, escalado, reintentos, métricas…

| Ficha | |
|---|---|
| Tipo | **Condicional** · Cuando se ejecutó 3.2 y hay patrones que diseñar. Se salta si 3.2 se saltó. |
| Lidera | architect |
| Apoyan | aws-platform |
| Revisa | architecture-reviewer (adversarial) |
| Cómo trabaja | La conversación principal hace el trabajo |
| Sensores | `required-sections`, `upstream-coverage`, `linter`, `type-check`, `traceability` |
| Scopes que la incluyen | `infra`, `classic`, `mvp`, `workshop`, `feature`, `enterprise` (6) |
| Interacción contigo | Preguntas, confirmación del resumen, revisión de architecture-reviewer, gate |

**Entra:** Los requisitos no funcionales de la unidad.

**Sale:** Por unidad: un documento de diseño por categoría y `logical-components.md` (componentes lógicos, dominios de fallo y aislamiento).

**Qué pregunta:**
- Las preguntas se centran en las opciones de diseño de cada categoría.

**Pasos:**
1. Lee los documentos anteriores.
2. Genera preguntas de diseño.
3. Recoge y analiza las respuestas.
4. Diseña las soluciones.
5. Genera los documentos.
6. Prepara el traspaso.
7. Cierra la etapa.

> Se ejecuta por cada unidad.

---

### 3.4 Infrastructure Design

*Diseño de infraestructura.* Diseña **dónde y cómo corre** cada unidad: cómputo, bases de datos, red, monitoreo y pipeline.

| Ficha | |
|---|---|
| Tipo | **Condicional** · Cuando hay que definir servicios, arquitectura de despliegue o recursos en la nube. Se salta si no hay cambios de infraestructura. |
| Lidera | aws-platform |
| Apoyan | devsecops, compliance |
| Revisa | architecture-reviewer (adversarial) |
| Cómo trabaja | La conversación principal hace el trabajo |
| Sensores | `required-sections`, `upstream-coverage`, `linter`, `type-check`, `traceability` |
| Scopes que la incluyen | `infra`, `classic`, `mvp`, `workshop`, `feature`, `enterprise` (6) |
| Interacción contigo | Preguntas, confirmación del resumen, revisión de architecture-reviewer, gate |

**Entra:** El diseño no funcional y los documentos de la unidad.

**Sale:** Por unidad: `infrastructure-specification.md` (despliegue y servicios), `monitoring-design.md` (métricas y alertas) y `cicd-pipeline.md`.

**Qué pregunta:**
- ¿Contenedores, serverless o máquinas virtuales?
- ¿Qué bases de datos, cachés y colas?
- ¿Qué métricas y alertas?
- ¿Cómo se construye, prueba y despliega?

**Pasos:**
1. Lee los documentos anteriores.
2. Genera las preguntas de infraestructura.
3. Recoge y analiza las respuestas.
4. Diseña la infraestructura.
5. Genera los documentos.
6. Prepara el traspaso.
7. Cierra la etapa.

> Se ejecuta por cada unidad.

---

### 3.5 Code Generation

*Generación de código.* **Escribe el código y sus pruebas**: primero un plan que tú apruebas y después el código.

| Ficha | |
|---|---|
| Tipo | **ALWAYS** · Siempre, por cada unidad del plan. |
| Lidera | developer |
| Apoyan | — |
| Revisa | architecture-reviewer (adversarial) |
| Cómo trabaja | Se lanza un subagente que hace el trabajo |
| Sensores | `required-sections`, `traceability` |
| Scopes que la incluyen | `poc`, `bugfix`, `express`, `refactor`, `security-patch`, `classic`, `mvp`, `workshop`, `feature`, `enterprise` (10) |
| Interacción contigo | Preguntas, aprobación del plan, revisión de architecture-reviewer, gate |

**Entra:** Todo el diseño de la unidad: requisitos, componentes, unidades y, si se hicieron, diseño funcional, no funcional e infraestructura.

**Sale:** El código en la raíz del repositorio y, por unidad: `code-generation-plan.md`, `code-summary.md`, `unit-test-instructions.md` y la trazabilidad de cada requisito con su código.

**Qué pregunta:**
- Las preguntas forman parte del plan de código, por ejemplo cómo estructurar o probar algo.

**Pasos:**
1. Lee todos los documentos de la unidad.
2. Parte 1: escribe el **plan de código**, con las pruebas obligatorias según la estrategia (Minimal: una por requisito; Standard: 5 a 8 por componente; Comprehensive: 10 a 15).
3. **Aprobación del plan** ("Approve Plan"). El hook `plan-approval-guard` impide escribir código antes.
4. Parte 2: un subagente developer genera el código siguiendo el plan y el orden de pruebas del equipo (TDD, BDD, después…).
5. Escribe el resumen del código.
6. Prepara el traspaso.
7. Cierra la etapa con revisión y aprobación.

> El código va siempre en la raíz del repositorio, nunca en `aidlc/`.

---

### 3.6 Build and Test

*Construir y probar.* **Construye la aplicación, ejecuta las pruebas** y deja los resultados.

| Ficha | |
|---|---|
| Tipo | **ALWAYS** · Siempre, una vez, cuando terminan todas las unidades. |
| Lidera | quality |
| Apoyan | devsecops |
| Revisa | — |
| Cómo trabaja | La conversación principal hace el trabajo |
| Sensores | `required-sections`, `upstream-coverage`, `type-check` |
| Scopes que la incluyen | `poc`, `bugfix`, `express`, `refactor`, `security-patch`, `classic`, `mvp`, `workshop`, `feature`, `enterprise` (10) |
| Interacción contigo | Gate |

**Entra:** Todo el código generado y sus instrucciones de prueba.

**Sale:** `build-instructions.md`, instrucciones de pruebas de integración, rendimiento y seguridad (según la estrategia), `build-and-test-summary.md`, los resultados y la trazabilidad entre unidades.

**Pasos:**
1. Analiza qué pruebas hacen falta.
2. Escribe las instrucciones de construcción.
3. Escribe las instrucciones de pruebas según la estrategia.
4. Escribe el resumen.
5. **Ejecuta** la construcción y las pruebas y guarda los resultados.
6. Comprueba la cobertura final entre unidades.
7. Prepara el traspaso.
8. Cierra la etapa.

> Si algo falla: intenta corregirlo hasta 2 veces; si no, clasifica el problema y, según lo que hayas elegido, vuelve atrás de forma acotada o se detiene a preguntarte.

---

### 3.7 CI Pipeline

*Pipeline de integración continua.* Configura **la integración continua**: qué se comprueba automáticamente antes de unir cambios.

| Ficha | |
|---|---|
| Tipo | **Condicional** · Cuando hay que crear o cambiar mucho la integración continua. Se salta si ya existe y es adecuada. |
| Lidera | pipeline-deploy |
| Apoyan | — |
| Revisa | — |
| Cómo trabaja | La conversación principal hace el trabajo |
| Sensores | `required-sections`, `upstream-coverage`, `linter`, `type-check` |
| Scopes que la incluyen | `infra`, `mvp`, `workshop`, `feature`, `enterprise` (5) |
| Interacción contigo | Preguntas, confirmación del resumen, gate |

**Entra:** Las prácticas del equipo y el código.

**Sale:** `ci-config.md` y `quality-gates.md` (controles de calidad antes de unir).

**Qué pregunta:**
- ¿Qué herramienta de CI se usa?
- ¿Qué estrategia de ramas?
- ¿Qué controles de calidad antes de unir?
- ¿Dónde se guardan los artefactos?

**Pasos:**
1. Carga el contexto.
2. Genera las preguntas.
3. Recoge y analiza las respuestas.
4. Genera los documentos.
5. Verifica el cierre de fase.
6. Prepara el traspaso.
7. Presenta el resultado y pide aprobación.

---

**Fuentes:** ficha generada desde `.claude/tools/data/stage-graph.json` y `scope-grid.json`; textos resumidos y traducidos de cada archivo de `.claude/aidlc-common/stages/`. Versión 2.11.0.
