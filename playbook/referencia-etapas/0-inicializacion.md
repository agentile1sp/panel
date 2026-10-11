# Referencia de etapas · 0 · Inicialización

> Prepara el espacio de trabajo. Sus 3 etapas son automáticas: no hacen preguntas ni piden aprobación.

**3 etapas:** 3 ALWAYS y 0 condicionales. [Volver al índice](00-indice.md)

| Etapa | Tipo | Lidera | En una frase |
|---|---|---|---|
| 0.1 Workspace Scaffold | ALWAYS | el director | Crea la carpeta del trabajo y una subcarpeta por cada fase que se va a ejecutar. |
| 0.2 Workspace Detection | ALWAYS | el director | Revisa el repositorio y decide si el proyecto es **nuevo** (*greenfield*) o **existente** (*brownfield*), y qué tecnologías usa. |
| 0.3 State Initialization | ALWAYS | el director | Crea `aidlc-state.md` completo y decide por dónde empieza el recorrido. |

---

### 0.1 Workspace Scaffold

*Preparar la carpeta del trabajo.* Crea la carpeta del trabajo y una subcarpeta por cada fase que se va a ejecutar.

| Ficha | |
|---|---|
| Tipo | **ALWAYS** · Siempre, al empezar un trabajo. |
| Lidera | el director |
| Apoyan | — |
| Revisa | — |
| Cómo trabaja | Una tool la ejecuta de forma automática |
| Sensores | — |
| Scopes que la incluyen | todos (11) |
| Interacción contigo | Ninguna: es automática y continúa sola |

**Entra:** Nada: es la primera etapa.

**Sale:** La carpeta `aidlc/spaces/<espacio>/intents/AAMMDD-nombre/` con sus subcarpetas, y la carpeta `knowledge/` del espacio si no existía.

**Pasos:**
1. Marca la etapa como en curso.
2. Asegura que existan las carpetas compartidas del espacio.
3. Crea una carpeta por cada fase incluida en el plan.
4. Muestra la confirmación.
5. Actualiza el estado y la auditoría.
6. Continúa sola a la siguiente etapa.

---

### 0.2 Workspace Detection

*Detectar el proyecto.* Revisa el repositorio y decide si el proyecto es **nuevo** (*greenfield*) o **existente** (*brownfield*), y qué tecnologías usa.

| Ficha | |
|---|---|
| Tipo | **ALWAYS** · Siempre, después de crear la carpeta. |
| Lidera | el director |
| Apoyan | — |
| Revisa | — |
| Cómo trabaja | Una tool la ejecuta de forma automática |
| Sensores | — |
| Scopes que la incluyen | todos (11) |
| Interacción contigo | Ninguna: es automática y continúa sola |

**Entra:** Los archivos del repositorio, sin contar las carpetas de AI-DLC (`.claude/`, `aidlc/`).

**Sale:** La clasificación (nuevo o existente) y los lenguajes, frameworks y sistema de construcción detectados, guardados en el estado.

**Pasos:**
1. Marca la etapa como en curso.
2. Escanea el repositorio: carpetas como `src/` o `app/`, archivos de configuración, dependencias y pruebas.
3. Clasifica: es **existente** si hay código, configuración de framework, dependencias de aplicación o carpetas de código; si no hay nada de eso, es **nuevo**.
4. Verifica la clasificación. Tu palabra manda: puedes indicar el tipo con `/aidlc --project-type`.
5. Identifica lenguajes, frameworks, sistema de construcción y pruebas.
6. Actualiza el estado y la auditoría.
7. Continúa sola a la siguiente etapa.

---

### 0.3 State Initialization

*Crear la ficha del trabajo.* Crea `aidlc-state.md` completo y decide por dónde empieza el recorrido.

| Ficha | |
|---|---|
| Tipo | **ALWAYS** · Siempre, al final de la Inicialización. |
| Lidera | el director |
| Apoyan | — |
| Revisa | — |
| Cómo trabaja | Una tool la ejecuta de forma automática |
| Sensores | — |
| Scopes que la incluyen | todos (11) |
| Interacción contigo | Ninguna: es automática y continúa sola |

**Entra:** La clasificación del proyecto y el scope elegido.

**Sale:** `aidlc-state.md` completo y `project-description.json` con tu descripción palabra por palabra.

**Pasos:**
1. Marca la etapa como en curso.
2. Crea la ficha completa: descripción, tipo de proyecto, tecnologías, fecha, configuración del scope y una casilla por etapa.
3. Decide la ruta: si el proyecto es existente, empieza con 2.1 Reverse Engineering; si es nuevo, la salta.
4. Fija la fase y la etapa por las que empieza.
5. Actualiza el estado y la auditoría.
6. Continúa sola a la primera etapa del recorrido.

---

**Fuentes:** ficha generada desde `.claude/tools/data/stage-graph.json` y `scope-grid.json`; textos resumidos y traducidos de cada archivo de `.claude/aidlc-common/stages/`. Versión 2.11.0.
