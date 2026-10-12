# Anexo · Glosario

> **En una frase:** los términos de AI-DLC que usa el playbook, en una línea cada uno y en orden alfabético.

| Término | Qué es |
|---|---|
| **Agente** | Un rol experto (product, architect, developer…) con su perfil y su conocimiento. Lidera, apoya o revisa etapas |
| **Agentes de apoyo** (`collaborators`) | Los agentes que acompañan al líder de una etapa. En el piloto estaban apagados |
| **ALWAYS / condicional** | Una etapa ALWAYS se ejecuta en cualquier plan; una condicional, solo si el plan la incluye |
| **Aprendizaje** | Una corrección nuestra que se guarda como regla en la memoria (`project.md` o `team.md`) para aplicarla en adelante |
| **Auditoría** | El registro de todos los eventos del trabajo, en `<trabajo>/audit/`. Solo lo escriben las herramientas de AI-DLC |
| **Bolt** | Una pasada corta de construcción sobre una parte del trabajo, que termina en algo que funciona y se puede probar |
| **Comando de comprobación** | El comando que se ejecuta al terminar cada unidad para verificar que funciona. Lo aprueba la persona |
| **`compose`** | El paso que arma un plan a medida antes de empezar. Lo hace el agente `composer` |
| **Conductor** | La IA de la conversación principal: sigue el flujo, adopta el papel de cada agente y lanza los subagentes |
| **Confirmación de resumen** | Antes de escribir un documento, la IA resume lo que entendió y pide "Looks correct" o "Request changes" |
| **Diario de etapa** (`memory.md`) | Las interpretaciones, desvíos y dudas que la IA anota mientras trabaja en una etapa |
| **Gate** | El punto de aprobación al final de una etapa: Approve o Request Changes |
| **Guard Policy** | Cuánto se aplican los controles. `strict`: ninguno se aparta. `relaxed`: algunos cambios se aceptan con un aviso. `off`: los controles se apartan |
| **Hook** | Un programa que Claude Code ejecuta en momentos fijos (al abrir, en cada mensaje, antes de un comando…) para registrar o impedir algo |
| **Intent (trabajo)** | Una pieza de trabajo con su carpeta, su estado y su auditoría, en `aidlc/spaces/<espacio>/intents/` |
| **Modo automático** | En Construcción, aprobar solo las comprobaciones rutinarias de cada unidad; sigue preguntando planes, resúmenes y fallos |
| **Plan de código** | Lo que se va a construir en una unidad: pasos, archivos y pruebas. Se aprueba antes de escribir código |
| **Revisión** | La revisión de un documento o del código por un agente revisor, con veredicto READY o NOT-READY y una tabla de hallazgos |
| **Revisión de recuperación** | Una revisión extra que AI-DLC exige si algo cambió después de una revisión. Solo se permite una por unidad |
| **Scope** | Un plan predefinido de etapas (por ejemplo `express`, `mvp` o `feature`), o uno a medida guardado con `compose` |
| **Sensor** | Una comprobación automática de un documento: secciones, fuentes, cobertura, trazabilidad. Avisa; en el piloto ninguno bloqueó |
| **`source-manifest.json`** | La lista de archivos de código que tocó una unidad. AI-DLC la usa para saber qué revisar y para detectar cambios sin dueño |
| **Subagente** | Un agente que trabaja en una conversación aparte y devuelve un resumen. En el piloto: `composer`, `developer` y los revisores |
| **Supuesto** | Algo que la IA deduce sin que se lo hayas dicho. Lo marca como supuesto y te pide confirmarlo |
| **Trazabilidad** | La relación entre cada requisito y lo que lo cubre (componente, unidad, archivo o prueba), en `traceability.json` |
| **Unidad de trabajo** | Una parte del sistema que se construye y se prueba por separado (en el piloto, U1 a U4) |
| **Walking skeleton** | Una primera porción mínima de punta a punta que demuestra que todo encaja. En el piloto no se usó |
