# Referencia de etapas

> **Para consultar, no para leer de corrido.** Las 33 etapas de AI-DLC, con su ficha, qué entra, qué sale, qué pregunta y todos sus pasos. Los capítulos del piloto cuentan solo las etapas que usamos; aquí están todas.

## Cómo leer cada etapa

| Parte | Qué dice |
|---|---|
| **Ficha** | Si es ALWAYS o condicional y cuándo se ejecuta, quién lidera, apoya y revisa, cómo trabaja, sensores, scopes que la incluyen e interacción contigo |
| **Entra / Sale** | Qué documentos usa y cuáles produce |
| **Qué pregunta** | Los temas de sus preguntas. La IA adapta las preguntas concretas al trabajo y al nivel de detalle |
| **Pasos** | Todo lo que hace la etapa por dentro, en orden |

Notas:
- **"Apoyan"** solo participan si el scope activa los agentes de apoyo (por defecto, solo `enterprise`).
- **"Cómo trabaja"**: en la mayoría de etapas la conversación principal asume el rol; en 4 se lanza uno o varios agentes aparte.
- **"Revisa"** indica la intensidad de revisión que define la etapa. El scope puede bajarla (por ejemplo, a consultiva).
- Los nombres de las etapas están en inglés, como los muestra AI-DLC.

## Las 33 etapas

| # | Etapa | Fase | Tipo | Lidera | Revisa |
|---|---|---|---|---|---|
| 0.1 | [Workspace Scaffold](0-inicializacion.md) | Inicialización | ALWAYS | el director | — |
| 0.2 | [Workspace Detection](0-inicializacion.md) | Inicialización | ALWAYS | el director | — |
| 0.3 | [State Initialization](0-inicializacion.md) | Inicialización | ALWAYS | el director | — |
| 1.1 | [Intent Capture & Framing](1-ideacion.md) | Ideación | ALWAYS | product | product-lead |
| 1.2 | [Market Research](1-ideacion.md) | Ideación | Condicional | product | — |
| 1.3 | [Feasibility & Constraints](1-ideacion.md) | Ideación | Condicional | architect | — |
| 1.4 | [Scope Definition](1-ideacion.md) | Ideación | ALWAYS | product | — |
| 1.5 | [Team Formation](1-ideacion.md) | Ideación | Condicional | delivery | — |
| 1.6 | [Rough Mockups](1-ideacion.md) | Ideación | Condicional | design | product-lead |
| 1.7 | [Approval & Handoff](1-ideacion.md) | Ideación | ALWAYS | delivery | — |
| 2.1 | [Reverse Engineering](2-concepcion.md) | Concepción | Condicional | developer | — |
| 2.2 | [Practices Discovery](2-concepcion.md) | Concepción | Condicional | pipeline-deploy | — |
| 2.3 | [Requirements Analysis](2-concepcion.md) | Concepción | ALWAYS | product | product-lead |
| 2.4 | [User Stories](2-concepcion.md) | Concepción | Condicional | product | product-lead |
| 2.5 | [Refined Mockups](2-concepcion.md) | Concepción | Condicional | design | product-lead |
| 2.6 | [Domain Design](2-concepcion.md) | Concepción | Condicional | architect | architecture-reviewer |
| 2.7 | [Units Generation](2-concepcion.md) | Concepción | ALWAYS | architect | architecture-reviewer |
| 2.8 | [Contract Design](2-concepcion.md) | Concepción | Condicional | architect | architecture-reviewer |
| 2.9 | [Delivery Planning](2-concepcion.md) | Concepción | ALWAYS | delivery | — |
| 3.1 | [Functional Design](3-construccion.md) | Construcción | Condicional | architect | architecture-reviewer |
| 3.2 | [NFR Requirements](3-construccion.md) | Construcción | Condicional | architect | architecture-reviewer |
| 3.3 | [NFR Design](3-construccion.md) | Construcción | Condicional | architect | architecture-reviewer |
| 3.4 | [Infrastructure Design](3-construccion.md) | Construcción | Condicional | aws-platform | architecture-reviewer |
| 3.5 | [Code Generation](3-construccion.md) | Construcción | ALWAYS | developer | architecture-reviewer |
| 3.6 | [Build and Test](3-construccion.md) | Construcción | ALWAYS | quality | — |
| 3.7 | [CI Pipeline](3-construccion.md) | Construcción | Condicional | pipeline-deploy | — |
| 4.1 | [Deployment Pipeline](4-operacion.md) | Operación | Condicional | pipeline-deploy | — |
| 4.2 | [Environment Provisioning](4-operacion.md) | Operación | Condicional | aws-platform | — |
| 4.3 | [Deployment Execution](4-operacion.md) | Operación | Condicional | pipeline-deploy | — |
| 4.4 | [Observability Setup](4-operacion.md) | Operación | Condicional | operations | — |
| 4.5 | [Incident Response](4-operacion.md) | Operación | Condicional | operations | — |
| 4.6 | [Performance Validation](4-operacion.md) | Operación | Condicional | quality | — |
| 4.7 | [Feedback & Optimization](4-operacion.md) | Operación | Condicional | operations | — |

## Por fase

- [0 · Inicialización](0-inicializacion.md): Prepara el espacio de trabajo. Sus 3 etapas son automáticas: no hacen preguntas ni piden aprobación.
- [1 · Ideación](1-ideacion.md): ¿Qué queremos y por qué? Define la intención, el alcance y, si aplica, el mercado, la viabilidad, el equipo y los primeros bocetos.
- [2 · Concepción](2-concepcion.md): ¿Qué exactamente, en qué partes y en qué orden? Convierte lo acordado en requisitos, diseño, unidades y un plan de construcción.
- [3 · Construcción](3-construccion.md): ¿Funciona? Diseña cada unidad en detalle, genera el código y lo prueba. Las etapas 3.1 a 3.5 se repiten por cada unidad.
- [4 · Operación](4-operacion.md): ¿Corre bien en un entorno real? Despliega, observa, responde a incidentes y mejora. Todas sus etapas son condicionales.

---

**Fuentes:** ficha generada desde `.claude/tools/data/stage-graph.json` y `scope-grid.json`; textos resumidos y traducidos de cada archivo de `.claude/aidlc-common/stages/`. Versión 2.11.0.
