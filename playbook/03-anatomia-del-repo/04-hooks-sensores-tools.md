# Capítulo 03 · Nivel 2 · Hooks, sensores y tools

> **En una frase:** son las tres piezas que trabajan **en segundo plano**. Los **hooks** vigilan cada acción de la IA, los **sensores** revisan lo que se produce y las **tools** llevan la cuenta del recorrido.

## 1 · Hooks (`.claude/hooks/`): 19 archivos

Claude Code los ejecuta solos en momentos fijos, y la IA no decide si se ejecutan. En `.claude/settings.json` se registra en qué momento se dispara cada uno.

Tipos de hook:
- 🚫 **Bloquea:** impide una acción que no está permitida.
- 👁️ **Observa:** registra lo que pasó y nunca bloquea.
- ✏️ **Entrega:** añade información a la acción, por ejemplo las reglas de la etapa.
- ↪️ **Reconduce:** obliga a la IA a seguir cuando quiere detenerse a medias.

### Por momento

| Momento | Hook | Tipo | Qué hace |
|---|---|---|---|
| **Al abrir la conversación** | `session-start` | 👁️ | Registra el inicio y, si hay trabajo en curso, le recuerda a la IA dónde se quedó |
| **Cuando escribes** | `record-human-turn` | 👁️ | Deja constancia de que escribió una persona. Sin ese registro, AI-DLC no acepta una aprobación |
| **Antes de cada acción de la IA** | `state-transition-guard` | 🚫 | Impide que la IA avance o cambie el estado del recorrido por su cuenta. Solo puede hacerlo a través del motor |
| | `plan-approval-guard` | 🚫 | Impide escribir código si el plan de código no está aprobado |
| | `review-freeze` | 🚫 | Después de una revisión, impide modificar el documento revisado hasta que lo apruebes. Si cambiara, la revisión ya no valdría |
| | `reviewer-scope` | 🚫 | Impide que el revisor de una unidad de código lea las demás unidades, para que revise solo lo que le toca |
| | `deliver-stage-rules` | ✏️ | Cuando se lanza un subagente, le entrega las reglas de la etapa |
| | `fold-usage` | 👁️ | Anota el uso del modelo en cada llamada |
| **Después de cada acción** | `write-audit-log` | 👁️ | Anota en la auditoría cada documento creado o modificado |
| | `run-sensors` | 👁️ | Lanza los sensores que correspondan al archivo escrito |
| | `sync-workflow-state` | 👁️ | Actualiza en el estado del trabajo la etapa en curso |
| | `rebuild-stage-graph` | 👁️ | Cuando cambia de etapa, recalcula el mapa del recorrido |
| | `record-human-turn` | 👁️ | Registra también tus respuestas a preguntas con opciones |
| **Cuando termina un subagente** | `log-subagent` | 👁️ | Registra que el subagente terminó |
| **Antes de resumir la conversación** | `validate-state` | 👁️ | Cuando la conversación se hace muy larga, Claude Code la resume. Antes, este hook valida el estado y lo registra |
| **Al terminar cada respuesta** | `continue-workflow` | ↪️ | Si al recorrido le queda trabajo por hacer en ese turno, obliga a la IA a continuar en lugar de detenerse |
| **Al cerrar la conversación** | `session-end` | 👁️ | Registra el cierre. Cerrar la conversación no cierra el trabajo |

Los 2 archivos restantes no son hooks por sí mismos:
- `statusline`: muestra en la barra de Claude Code en qué fase y etapa vamos.
- `review-freeze-command.ts` y `runtime-integrity.ts`: código compartido. `runtime-integrity` protege los archivos de control y los registros para que la IA no pueda modificarlos ni borrarlos.

### Hasta dónde protegen

El propio código de `runtime-integrity.ts` lo explica con honestidad: es **"defensa en profundidad, no un sandbox"**. Los hooks y la IA se ejecutan con el mismo usuario del sistema, así que una IA con permisos ilimitados podría encontrar un camino alrededor de un control. **La protección exterior son los permisos de Claude Code y la revisión de una persona.** Los hooks son una capa muy fuerte, pero no la única.

## 2 · Sensores (`.claude/sensors/`): 6

Revisan automáticamente lo que se produce. Si encuentran un problema, lo registran en la auditoría y dejan un archivo con los hallazgos para que la IA lo corrija.

| Sensor | Qué revisa | Cuándo | En cuántas etapas |
|---|---|---|---:|
| `required-sections` | Que el documento tenga sus secciones obligatorias | Al pedir aprobación | 30 |
| `upstream-coverage` | Que el documento use los documentos de etapas anteriores que dice usar | Al pedir aprobación | 29 |
| `claim-sources` | Que cada afirmación de la intención indique de dónde sale: tu descripción, una respuesta tuya o una suposición | Al pedir aprobación | 1 (1.1 Intent Capture) |
| `traceability` | Que cada requisito esté conectado con el código que lo implementa y que no haya piezas huérfanas | Al escribir | 8 |
| `type-check` | Que el código no tenga errores de tipos (`tsc` en TypeScript) | Al escribir | 6 |
| `linter` | Que el código cumpla las reglas de estilo del proyecto (`eslint`) | Al escribir | 5 |

**¿Bloquean?** Los 6 vienen configurados como **advisory**: avisan, pero no impiden aprobar. Un equipo puede crear sensores propios configurados como **bloqueantes**. En ese caso, si fallan en la aprobación, la etapa no se puede aprobar hasta corregir el problema o hasta que una persona autorice una excepción, que queda registrada. Si la IA trabaja en modo automático, no puede autorizar esa excepción por su cuenta.

## 3 · Tools (`.claude/tools/`): 88 programas y 25 archivos de datos

Hacen lo que debe ser **exacto** y no depender del criterio de la IA: llevar el estado, decidir la siguiente etapa, escribir el registro. Se ejecutan con el comando `aidlc engine …`.

| Grupo | Cuántas | Qué hacen | Ejemplos |
|---|---:|---|---|
| **Motor del recorrido** | 28 | Saber dónde vamos, decidir la siguiente etapa, guardar preguntas y respuestas, coordinar la construcción por unidades | `aidlc-orchestrate` decide la siguiente etapa · `aidlc-state` lleva el estado |
| **Instalación y configuración** | 24 | Instalar, actualizar, diagnosticar y configurar | `aidlc-doctor` comprueba la instalación · `aidlc-model-policy` decide el modelo de cada agente |
| **Revisiones automáticas** | 9 | Ejecutar los sensores y preparar el encargo de los revisores | `aidlc-sensor` · un archivo por sensor |
| **Memoria y conocimiento** | 8 | Reglas por capas, aprendizajes y documentos del equipo | `aidlc-learnings` · `aidlc-knowledge` |
| **Registro y auditoría** | 7 | Escribir y consultar el registro de lo que pasó | `aidlc-audit` · `aidlc-log` · `aidlc-metrics` |
| **Plugins** | 7 | Crear y probar extensiones de AI-DLC | `aidlc-plugin-create` |
| **Controles** | 5 | Encender y apagar controles y avisar mientras estén apagados | `aidlc-guard-switch` |

**`tools/data/`** guarda los mapas ya calculados que usa el motor. Los dos más útiles para entender AI-DLC son:
- `stage-graph.json`: las 33 etapas con su ficha completa.
- `scope-grid.json`: qué etapas ejecuta cada scope.

De ahí salen los números de este playbook.

---

**Fuentes:** comentarios de cabecera de `.claude/hooks/`; momentos en `.claude/settings.json`; ficha de cada sensor en `.claude/sensors/`; regla de bloqueo en `.claude/aidlc-common/protocols/stage-protocol.md`; sensores por etapa en `stage-graph.json`; clasificación de `.claude/tools/` por nombre y cabecera. Versión 2.11.0.
