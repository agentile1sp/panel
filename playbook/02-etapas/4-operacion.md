# Referencia de etapas · 4 · Operación

> ¿Corre bien en un entorno real? Despliega, observa, responde a incidentes y mejora. Todas sus etapas son condicionales.

**7 etapas:** 0 ALWAYS y 7 condicionales. [Volver al índice](00-indice.md)

| Etapa | Tipo | Lidera | En una frase |
|---|---|---|---|
| 4.1 Deployment Pipeline | Condicional | pipeline-deploy | Define **cómo se despliega**: estrategia, paso entre entornos, aprobaciones y cómo volver atrás. |
| 4.2 Environment Provisioning | Condicional | aws-platform | **Crea y valida los entornos** en AWS según el diseño de infraestructura. |
| 4.3 Deployment Execution | Condicional | pipeline-deploy | **Despliega** y comprueba que todo responde. |
| 4.4 Observability Setup | Condicional | operations | Configura **paneles, alarmas, objetivos de servicio, logs y trazas**. |
| 4.5 Incident Response | Condicional | operations | Prepara **cómo reaccionar cuando algo falla**: procedimientos, plan y escalamiento. |
| 4.6 Performance Validation | Condicional | quality | **Prueba el sistema bajo carga** y comprueba los objetivos de rendimiento. |
| 4.7 Feedback & Optimization | Condicional | operations | Revisa **cómo va el sistema en producción** y propone mejoras: objetivos, costos, desviaciones y automatización. |

---

### 4.1 Deployment Pipeline

*Pipeline de despliegue.* Define **cómo se despliega**: estrategia, paso entre entornos, aprobaciones y cómo volver atrás.

| Ficha | |
|---|---|
| Tipo | **Condicional** · Cuando hay que crear o cambiar mucho el pipeline de despliegue. |
| Lidera | pipeline-deploy |
| Apoyan | — |
| Revisa | — |
| Cómo trabaja | La conversación principal hace el trabajo |
| Sensores | `required-sections`, `upstream-coverage` |
| Scopes que la incluyen | `bugfix`, `express`, `refactor`, `security-patch`, `infra`, `workshop`, `feature`, `enterprise` (8) |
| Interacción contigo | Preguntas, confirmación del resumen, gate |

**Entra:** La infraestructura y el código.

**Sale:** `cd-config.md`, `deployment-strategy.md` y `rollback-runbook.md` (cómo deshacer un despliegue).

**Qué pregunta:**
- ¿Qué estrategia: blue/green, canary o rolling?
- ¿Qué controles entre desarrollo, pruebas y producción?
- ¿Quién aprueba producción?
- ¿Cómo se vuelve atrás?
- ¿Se usan feature flags?

**Pasos:**
1. Carga el contexto.
2. Genera las preguntas.
3. Genera los documentos.
4. Prepara el traspaso.
5. Presenta el resultado y pide aprobación.

---

### 4.2 Environment Provisioning

*Preparar los entornos.* **Crea y valida los entornos** en AWS según el diseño de infraestructura.

| Ficha | |
|---|---|
| Tipo | **Condicional** · Cuando hay que crear o validar entornos en AWS. |
| Lidera | aws-platform |
| Apoyan | devsecops, compliance |
| Revisa | — |
| Cómo trabaja | La conversación principal hace el trabajo |
| Sensores | `required-sections`, `upstream-coverage` |
| Scopes que la incluyen | `infra`, `workshop`, `feature`, `enterprise` (4) |
| Interacción contigo | Preguntas, confirmación del resumen, gate |

**Entra:** El diseño de infraestructura.

**Sale:** `environment-inventory.md` y `validation-report.md`.

**Qué pregunta:**
- ¿Están todos los entornos creados según el diseño?
- ¿Red y seguridad correctas?
- ¿Los secretos se inyectan bien?
- ¿Funciona la conectividad entre cuentas o redes?

**Pasos:**
1. Carga el contexto.
2. Genera las preguntas.
3. Prepara y valida los entornos.
4. Genera los documentos.
5. Prepara el traspaso.
6. Presenta el resultado y pide aprobación.

---

### 4.3 Deployment Execution

*Ejecutar el despliegue.* **Despliega** y comprueba que todo responde.

| Ficha | |
|---|---|
| Tipo | **Condicional** · Cuando el pipeline y el entorno están listos. |
| Lidera | pipeline-deploy |
| Apoyan | developer |
| Revisa | — |
| Cómo trabaja | La conversación principal hace el trabajo |
| Sensores | `required-sections`, `upstream-coverage` |
| Scopes que la incluyen | `bugfix`, `express`, `refactor`, `security-patch`, `infra`, `workshop`, `feature`, `enterprise` (8) |
| Interacción contigo | Preguntas, confirmación del resumen, gate |

**Entra:** El pipeline, el entorno y el código.

**Sale:** `deployment-log.md`, `smoke-test-results.md` (pruebas básicas tras desplegar) y `health-check-report.md`.

**Qué pregunta:**
- ¿Pasan todas las comprobaciones previas?
- ¿Hay migraciones de base de datos probadas?
- ¿Están disponibles los servicios de los que depende?
- ¿Cuál es la ventana de despliegue?

**Pasos:**
1. Carga el contexto.
2. Comprobaciones previas.
3. Ejecuta el despliegue.
4. Genera los documentos.
5. Prepara el traspaso.
6. Presenta el resultado y pide aprobación.

---

### 4.4 Observability Setup

*Configurar la observabilidad.* Configura **paneles, alarmas, objetivos de servicio, logs y trazas**.

| Ficha | |
|---|---|
| Tipo | **Condicional** · Cuando hay que configurar monitoreo, paneles, alarmas o trazas. |
| Lidera | operations |
| Apoyan | — |
| Revisa | — |
| Cómo trabaja | La conversación principal hace el trabajo |
| Sensores | `required-sections`, `upstream-coverage` |
| Scopes que la incluyen | `express`, `infra`, `workshop`, `feature`, `enterprise` (5) |
| Interacción contigo | Preguntas, confirmación del resumen, gate |

**Entra:** El diseño de observabilidad y el sistema desplegado.

**Sale:** `dashboards.md`, `alarms.md`, `slo-config.md`, `log-queries.md`, `tracing-config.md` y `anomaly-config.md`.

**Qué pregunta:**
- ¿Qué señales clave seguir (latencia, tráfico, errores, saturación)?
- ¿Qué objetivos de servicio (SLO)?
- ¿Qué paneles necesita el equipo?
- ¿Cuánto tiempo se guardan los logs?
- ¿Qué trazas hacen falta?

**Pasos:**
1. Carga el contexto.
2. Genera las preguntas.
3. Genera los documentos.
4. Prepara el traspaso.
5. Presenta el resultado y pide aprobación.

---

### 4.5 Incident Response

*Respuesta a incidentes.* Prepara **cómo reaccionar cuando algo falla**: procedimientos, plan y escalamiento.

| Ficha | |
|---|---|
| Tipo | **Condicional** · Cuando hacen falta procedimientos operativos y de respuesta a incidentes. |
| Lidera | operations |
| Apoyan | — |
| Revisa | — |
| Cómo trabaja | La conversación principal hace el trabajo |
| Sensores | `required-sections`, `upstream-coverage` |
| Scopes que la incluyen | `workshop`, `feature`, `enterprise` (3) |
| Interacción contigo | Preguntas, confirmación del resumen, gate |

**Entra:** El sistema desplegado y su observabilidad.

**Sale:** `runbooks.md` (procedimientos), `incident-plan.md` y `escalation-matrix.md` (a quién avisar).

**Qué pregunta:**
- ¿Cuáles son los fallos más probables?
- ¿Quién está de guardia y a quién se escala?
- ¿Qué se puede corregir automáticamente?
- ¿Cómo se comunica durante un incidente?
- ¿Cuánto se puede tardar en recuperar y cuántos datos se pueden perder (RTO/RPO)?

**Pasos:**
1. Carga el contexto.
2. Genera las preguntas.
3. Genera los documentos.
4. Prepara el traspaso.
5. Presenta el resultado y pide aprobación.

---

### 4.6 Performance Validation

*Validar el rendimiento.* **Prueba el sistema bajo carga** y comprueba los objetivos de rendimiento.

| Ficha | |
|---|---|
| Tipo | **Condicional** · Cuando hay que validar objetivos de rendimiento bajo carga. |
| Lidera | quality |
| Apoyan | — |
| Revisa | — |
| Cómo trabaja | La conversación principal hace el trabajo |
| Sensores | `required-sections`, `upstream-coverage` |
| Scopes que la incluyen | `workshop`, `feature`, `enterprise` (3) |
| Interacción contigo | Preguntas, confirmación del resumen, gate |

**Entra:** Los requisitos no funcionales y el sistema desplegado.

**Sale:** `load-test-plan.md`, `test-results.md` y `nfr-validation-matrix.md` (qué requisito se cumplió).

**Qué pregunta:**
- ¿Qué patrón de tráfico se espera (normal, pico, ráfaga)?
- ¿Qué latencias objetivo (p50, p95, p99)?
- ¿Qué volumen debe aguantar?
- ¿Dónde están los cuellos de botella probables?

**Pasos:**
1. Carga el contexto.
2. Genera las preguntas.
3. Diseña y ejecuta las pruebas.
4. Genera los documentos.
5. Prepara el traspaso.
6. Presenta el resultado y pide aprobación.

---

### 4.7 Feedback & Optimization

*Retroalimentación y optimización.* Revisa **cómo va el sistema en producción** y propone mejoras: objetivos, costos, desviaciones y automatización.

| Ficha | |
|---|---|
| Tipo | **Condicional** · Cuando hace falta seguimiento operativo y optimización continuos. |
| Lidera | operations |
| Apoyan | aws-platform |
| Revisa | — |
| Cómo trabaja | La conversación principal hace el trabajo |
| Sensores | `required-sections`, `upstream-coverage` |
| Scopes que la incluyen | `workshop`, `feature`, `enterprise` (3) |
| Interacción contigo | Preguntas, confirmación del resumen, gate |

**Entra:** Los datos de operación.

**Sale:** `slo-report.md`, `cost-analysis.md`, `drift-report.md` (desviaciones de configuración) y `feedback-loop.md`.

**Qué pregunta:**
- ¿Se cumplen los objetivos de servicio?
- ¿Hay oportunidades de ahorro?
- ¿Hay desviaciones de configuración?
- ¿Qué comportamiento de los usuarios sugiere mejoras?
- ¿Qué trabajo manual se puede automatizar?

**Pasos:**
1. Carga el contexto.
2. Genera las preguntas.
3. Genera los documentos.
4. Prepara el traspaso.
5. Presenta el resultado y pide aprobación.

---

**Fuentes:** ficha generada desde `.claude/tools/data/stage-graph.json` y `scope-grid.json`; textos resumidos y traducidos de cada archivo de `.claude/aidlc-common/stages/`. Versión 2.11.0.
