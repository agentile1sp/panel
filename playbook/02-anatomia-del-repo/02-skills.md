# Capítulo 02 · Nivel 2 · Los skills (`.claude/skills/`)

> **En una frase:** los skills son **los comandos que escribes en el chat con `/`**. Hay 42, pero en el día a día se usa uno: **`/aidlc`**.

## Skill no es lo mismo que hook

| | Skill | Hook |
|---|---|---|
| Qué es | Un **pedido** escrito: instrucciones que la IA lee y sigue | Un **programa** que Claude Code ejecuta solo |
| Quién lo activa | Tú, al escribir `/nombre` | Claude Code, en momentos fijos |
| ¿La IA puede desviarse? | Puede equivocarse al seguirlo | No: el programa se ejecuta igual siempre |

Cada skill es una carpeta con un archivo `SKILL.md`, que contiene las instrucciones para la IA.

## Los 42, agrupados

```mermaid
mindmap
  root((42 skills))
    El principal · 1
      /aidlc
    Arrancar · 7
      /aidlc-init
      5 atajos de scope
      /aidlc-compose
    Una sola etapa · 30
      /aidlc-requirements-analysis
      /aidlc-code-generation
      … una por etapa
    Consultar · 3
      /aidlc-session-cost
      /aidlc-replay
      /aidlc-outcomes-pack
    Documentos · 1
      /aidlc-knowledge
```

Texto: 1 principal (`/aidlc`), 7 para arrancar un trabajo, 30 para ejecutar una sola etapa, 3 para consultar y 1 para los documentos del equipo.

## 1 · El principal: `/aidlc`

Es **el director**. Arranca un trabajo nuevo, continúa donde te quedaste y lleva el recorrido de etapa en etapa. Si lo escribes con una descripción, AI-DLC detecta el scope adecuado y te propone el plan:

```
/aidlc Quiero un sistema para pedir vacaciones con aprobación del jefe
```

También acepta opciones para consultar o ajustar el recorrido. Las más útiles:

| Opción | Para qué sirve |
|---|---|
| `/aidlc --status` | Ver en qué fase y etapa estamos y cómo están los controles |
| `/aidlc --doctor` | Comprobar que la instalación funciona |
| `/aidlc --scope <nombre>` | Elegir el scope en lugar de dejar que lo detecte |
| `/aidlc --stage <etapa>` | Saltar a una etapa concreta |
| `/aidlc --depth <nivel>` | Cambiar el nivel de detalle del trabajo |
| `/aidlc --test-strategy <nivel>` | Cambiar cuántas pruebas se escriben |
| `/aidlc --review <tipo>` | Ajustar la intensidad de las revisiones |
| `/aidlc --version` | Ver la versión instalada |

## 2 · Arrancar: 7 skills

| Skill | Qué hace |
|---|---|
| `/aidlc-init` | Ejecuta de una vez la fase de Inicialización (0.1 a 0.3): crea la carpeta del trabajo y su registro. Es opcional, porque `/aidlc` lo hace solo |
| `/aidlc-mvp` | Arranca con el scope **mvp**: construir lo esencial, sin operación |
| `/aidlc-express` | Arranca con el scope **express**: el recorrido más ligero, sin diseño ni revisores |
| `/aidlc-feature` | Arranca con el scope **feature**: ciclo completo para una funcionalidad nueva |
| `/aidlc-bugfix` | Arranca con el scope **bugfix**: corregir un bug concreto |
| `/aidlc-security-patch` | Arranca con el scope **security-patch**: responder a una vulnerabilidad |
| `/aidlc-compose` | Pide al agente `composer` un recorrido **a medida** de la tarea. Lo apruebas antes de ejecutarlo |

Los 5 atajos de scope son lo mismo que `/aidlc --scope <nombre>`, solo que más cortos de escribir. Los otros 6 scopes (`poc`, `classic`, `enterprise`, `infra`, `refactor`, `workshop`) no tienen atajo: se eligen con `--scope`.

## 3 · Una sola etapa: 30 skills

Hay uno por etapa, con el nombre `/aidlc-<etapa>`. Por ejemplo, `/aidlc-requirements-analysis` o `/aidlc-code-generation`.

- **Para qué sirven:** ejecutan **una etapa aislada sin mover el recorrido principal**. Sirven para practicar una etapa, repetirla o probarla por separado.
- **Por qué son 30 y no 33:** las 3 etapas de Inicialización no tienen sentido por separado, así que se ejecutan juntas con `/aidlc-init`.

## 4 · Consultar: 3 skills

Ninguno cambia el trabajo ni avanza etapas: solo leen el registro.

| Skill | Qué muestra | ¿Crea archivo? |
|---|---|---|
| `/aidlc-session-cost` | Números del trabajo: duración, etapas completadas, revisiones de sensores y aprendizajes. **No muestra dinero ni tokens** | No, solo en pantalla |
| `/aidlc-replay` | Un **relato de lo que pasó**, pensado para quien no estuvo presente | No, solo en pantalla |
| `/aidlc-outcomes-pack` | Un **documento de traspaso** al cerrar el trabajo, para que otro equipo pueda mantener y continuar el sistema | Sí, `OUTCOMES.md` |

`/aidlc-replay` y `/aidlc-outcomes-pack` nos van a servir para la bitácora del piloto: dan la versión oficial de lo que pasó, sacada del registro de auditoría.

## 5 · Documentos: 1 skill

**`/aidlc-knowledge`** registra **documentos propios del equipo** (PDF, Word, Markdown, texto) en un catálogo para que los agentes los consulten y los citen. Por ejemplo, un manual interno de arquitectura o una normativa. Nunca avanza etapas ni aprueba nada. Se explica en el capítulo 03.

## Skill, jefe, etapa, agente y hook: cómo se relacionan

Son las piezas que más se confunden. Con el ejemplo de un restaurante:

| Pieza | En el restaurante | En AI-DLC | ¿Quién lo activa? |
|---|---|---|---|
| **Skill** | El **pedido** que haces | El comando que escribes: `/aidlc`, `/aidlc-mvp`… | Tú |
| **Jefe** | El **jefe de cocina**, que organiza | `/aidlc`: decide qué etapa toca y quién la hace | Cualquier skill de AI-DLC |
| **Etapa** | La **receta** | La definición en `aidlc-common/stages/`: qué hacer, qué entra y qué sale | El jefe |
| **Agente** | El **cocinero especialista** | El rol en `agents/`, con su conocimiento en `knowledge/` | El jefe, según la etapa |
| **Hook** | El **inspector**, que vigila siempre | El programa en `hooks/` | Claude Code, solo |

```mermaid
flowchart TD
    T["Tú escribes un skill<br/>/aidlc o un atajo"] --> J["El jefe /aidlc<br/>decide qué etapa toca"]
    J --> E["La etapa dice<br/>qué hacer y quién lo lidera"]
    E --> A["El agente especialista<br/>hace el trabajo"]
    A --> R["El agente revisor<br/>revisa, si la etapa lo pide"]
    R --> P(["Tú apruebas"])
    P --> J

    classDef persona fill:#fde68a,stroke:#b45309,color:#1f2937
    classDef motor fill:#dbeafe,stroke:#1d4ed8,color:#1f2937
    class T,P persona
    class J,E,A,R motor
```

Texto: tú escribes un skill → el jefe decide la etapa → la etapa dice qué hacer y quién la lidera → el agente trabaja → el revisor revisa → tú apruebas → vuelta al jefe. Los hooks vigilan todo el recorrido.

**Lo que hay que recordar:**
- **Nunca llamas a un agente directamente.** Escribas el skill que escribas, el que elige al agente es siempre el jefe, según la etapa.
- **Los atajos no se saltan al jefe:** solo le dan una orden más concreta. `/aidlc-requirements-analysis` le dice "haz solo la etapa 2.3".
- **Los agentes no "tienen skills".** Lo que los hace especialistas es su archivo en `agents/`, sus guías en `knowledge/` y las herramientas que tienen permitidas.

**Cómo se activa un agente**, de dos formas:
1. **Ponerse el sombrero** (la mayoría de las etapas): la misma conversación carga el archivo del agente y trabaja como ese rol. No arranca otra IA.
2. **Lanzar un subagente** (4 etapas, las revisiones y el `composer`): el jefe abre una IA aparte, con su propio contexto. El hook `deliver-stage-rules` le entrega las reglas de la etapa y el hook `log-subagent` registra cuando termina.

---

**Fuentes:** carpetas y descripciones (`description`) de cada `SKILL.md` en `.claude/skills/`; opciones de `/aidlc` según `.claude/CLAUDE.md`. Versión 2.11.0.
