# Capítulo 07 · Esperado contra real

> **En una frase:** la predicción de los capítulos 05 y 06 acertó en lo grande (las mismas 12 etapas, los mismos agentes y documentos), pero se quedó corta en la interacción: hubo bastantes más decisiones nuestras de las previstas. La sorpresa que más costó no vino de AI-DLC, sino de tener el playbook abierto en Obsidian dentro del mismo repositorio.

[← 3.6 Build and Test](13-3.6-build-and-test.md) · [Resumen](00-resumen.md)

Esta página responde una por una las preguntas del [capítulo 05, §9](../06-mapa-del-piloto/00-mapa-del-piloto.md) y compara los números del [capítulo 06, §7](../07-flujo-conceptual/00-flujo-conceptual.md).

## 1 · ¿Propuso el `composer` las mismas 12 etapas?

**Sí, exactamente las mismas**: las 3 de Inicialización, las 8 ALWAYS de trabajo y `2.6 Domain Design`. Su justificación para 2.6 fue la misma que la nuestra: es la única etapa que produce `components`, y 2.7 y 2.9 lo necesitan. No añadió ni quitó nada más. Señaló `3.1 Functional Design` como la primera candidata a reactivar si el modelo de datos se quedaba corto, y no hizo falta.

## 2 · ¿Qué configuración propuso y cuál quedó?

Quedó la que propuso, sin cambios.

| Ajuste | Esperado (cap. 05) | Real |
|---|---|---|
| Scope de partida | `classic` | `express` |
| Guard Policy | `strict` | `strict` y, al final, `relaxed` por decisión nuestra para cerrar 3.5 |
| Confirmar resumen | Encendido | Encendido |
| Sensores, aprendizajes y aprobación del plan | Encendidos | Encendidos |
| Agentes de apoyo | Apagados | Apagados |
| Revisiones | Consultivas en todas | Máximo `adversarial`: una pasada en Ideación y Concepción, y modo adversarial en 3.5 |

## 3 · ¿Coincidieron agentes, documentos, sensores y hooks?

**Agentes:** sí. Todos los líderes y revisores fueron los de la tabla del capítulo 05. Los agentes de apoyo no participaron en ninguna etapa, como se esperaba con `collaborators` apagado. El `composer` (en el arranque) y el `developer` (en 3.5) fueron los únicos que trabajaron como subagentes además de los revisores.

**Documentos:** sí, y algunos más de los que listaba la tabla:
- `reviews/review-01.md` en cada etapa con revisor;
- `verification/phase-check-*.md` en cada cambio de fase;
- `source-manifest.json` en cada unidad;
- en 3.6, las instrucciones de integración, rendimiento y seguridad, y la trazabilidad entre unidades.

**Sensores:** se dispararon todos los previstos salvo `type-check`, porque no hay TypeScript. Fallaron tres tipos, todos como aviso y sin bloquear nada:

| Sensor | Dónde | Por qué falló |
|---|---|---|
| `claim-sources` | 1.1 (3 archivos) | Un encabezado obligatorio estaba traducido al español |
| `upstream-coverage` | 2.9 (5 archivos) | Ningún documento cita `components` por su nombre |
| `traceability` | 3.5 (4 unidades) | Cada unidad solo lista sus propios requisitos |

**Hooks:**

| Hook | Esperado | Visto |
|---|---|---|
| `session-start` | Al abrir | 3 sesiones |
| `record-human-turn` | En cada mensaje | 82 mensajes nuestros registrados |
| `write-audit-log` | En cada documento | 786 eventos en la auditoría |
| `run-sensors` | En cada documento | 85 disparos de sensores |
| `sync-workflow-state` | En cada cambio de etapa | `aidlc-state.md` al día en todo momento |
| `log-subagent` | Al cerrar un subagente | 13 cierres: 2 `product-lead`, 7 `architecture-reviewer` y 4 `developer`. No se registraron el `composer`, porque el trabajo aún no existía, ni el `developer` de U4 que se cortó |
| `plan-approval-guard` | Impide código sin plan | **11 bloqueos**, 3 de ellos por error de clasificación (ver [3.5](12-3.5-code-generation/00-vision-general.md)) |
| `review-freeze` | Si se piden cambios a un documento revisado | **No se disparó**: nunca pedimos cambios en un gate |
| `reviewer-scope` | No estaba en la tabla | 1 bloqueo al revisor de U2 |
| `continue-workflow` | No estaba en la tabla | Al terminar un turno con trabajo pendiente, recuerda a la IA que siga ("AI-DLC is carrying on…") |

## 4 · Gates, cambios pedidos y hallazgos de los revisores

| Qué | Esperado | Real |
|---|---:|---:|
| Gates de etapa | 9 | 9: **7 aprobados por nosotros** y 2 automáticos (3.5 y 3.6, por el modo automático) |
| Aprobaciones de unidad | — | 4, automáticas tras verificar |
| "Request Changes" en un gate | — | **0** |
| "Request changes" en un resumen | — | 1, en 1.7 |
| Revisiones | 5 etapas | 9 revisiones: 4 de etapa y 5 de unidad, todas READY |

**Hallazgos:** 7 importantes y 27 menores, sin contar los repetidos.
- Los importantes se concentraron en Concepción: 2 en cada una de 2.3, 2.6 y 2.7. Hubo 1 más en U1.
- Ninguno bloqueó una aprobación.
- Los de Concepción los resolvió **la etapa siguiente**, con preguntas nuevas. Es el patrón más claro del recorrido.

## 5 · Tiempo y uso del modelo

| Etapa | Tiempo | Llamadas al modelo | Mensajes nuestros |
|---|---:|---:|---:|
| Arranque (`compose`) | 4 min | 41 | — |
| 0.1 a 0.3 Inicialización | < 1 s | — | — |
| 1.1 Intent Capture | 19 min | 55 | 10 |
| 1.4 Scope Definition | 25 min | 22 | 6 |
| 1.7 Approval & Handoff | 15 min | 27 | 8 |
| 2.3 Requirements Analysis | 19 min | 31 | 7 |
| 2.6 Domain Design | 14 min | 28 | 6 |
| 2.7 Units Generation | 13 min | 40 | 8 |
| 2.9 Delivery Planning | 11 min | 24 | 4 |
| 3.5 Code Generation | 2 h 23 min de trabajo | 416 | 29 |
| 3.6 Build and Test | 3 min | 13 | 4 |
| **Total** | **≈ 4 h 26 min de trabajo** | **≈ 697** | **82** |

- **Duración total:** de las 03:24 a las 14:42 UTC, 11 h 18 min. De ellas, 6 h 53 min fueron de espera por el límite de uso del plan Pro.
- **Modelos:** Opus para el conductor, el `composer` y el `developer`; Sonnet para los dos revisores.
- **Fuente de las cifras:** las llamadas se contaron en los registros de las conversaciones de Claude Code, un mensaje del modelo por llamada. AI-DLC no guarda el uso por etapa, y los recuentos de tokens de esos registros no son fiables para los subagentes, así que no se dan aquí.

## 6 · Cuántas veces intervinimos (capítulo 06, §7)

| Momento | Esperado | Real |
|---|---|---|
| Aprobar el plan de `compose` | 1 | 1, más elegir el nombre con que se guarda |
| Responder preguntas | 8 etapas | 7 etapas y 48 preguntas. 3.5 no tuvo preguntas de producto |
| Confirmar un resumen | 7 | 8: en 1.7 se confirmó dos veces |
| Decidir si se guarda un aprendizaje | Solo si hay correcciones | En los 7 gates humanos. Se guardaron 4 reglas |
| Aprobar el plan de código | 1 | **5**: uno por unidad, y U1 dos veces |
| Gates de etapa | 9 | 7 nuestros y 2 automáticos |

**Decisiones que no estaban previstas:**
- cómo responder a las preguntas (una vez, se reutilizó);
- confirmar un supuesto (1.1);
- aprobar el plan de división en unidades (2.7);
- el modo de construcción, automático o revisando cada unidad;
- el comando de comprobación;
- ejecutar un comando a mano en nuestra terminal;
- las 4 preguntas del bloqueo al cerrar 3.5.

## 7 · Documentado contra observado

| La documentación dice | Lo que vimos |
|---|---|
| Un plan a medida parte de `classic` (cap. 05) | Partió de `express` |
| El plan guardado es el plan aprobado | El guardado tiene 13 etapas: conserva `reverse-engineering` de `express` |
| `plan-approval-guard` solo frena el código antes de aprobar el plan | También frenó un registro que no era código, por tratar el trabajo como si no tuviera unidades |
| Las casillas del plan se marcan al avanzar | En U1 quedaron sin marcar; en U2 a U4, todas marcadas |
| Con `strict`, ningún control se aparta | Correcto, y por eso un archivo de Obsidian bloqueó el cierre de 3.5 |

## 8 · Las lecciones del recorrido

1. **La predicción hecha leyendo la documentación funcionó.** El plan, los agentes y los documentos coincidieron con los capítulos 05 y 06.
2. **AI-DLC no inventa:** pregunta, resume, marca los supuestos y pide confirmarlos. El precio son unos 7 mensajes nuestros por etapa.
3. **Cambiar de opinión entre etapas no rompe nada.** Se convierte en un cambio de alcance explícito, y el documento posterior manda sobre el anterior.
4. **Lo que un revisor deja abierto lo recoge la etapa siguiente.** Conviene saber dónde se va a resolver antes de aprobar.
5. **Las decisiones de diseño se notan al final.** Elegir deshacer en vez de limpieza al arrancar (2.7) dejó un caso sin cubrir que los revisores señalaron hasta U4.
6. **Con `strict`, el repositorio tiene que estar quieto durante Construcción.** El playbook en Obsidian dentro del mismo repositorio fue el mayor problema del recorrido.
7. **Los controles vigilan a la IA, no a la persona.** Cuando un control se equivoca, el camino es ejecutar el paso tú mismo.
8. **El plan Pro no da para una construcción larga de un tirón.** Que todo quede guardado hace que la pausa no cueste nada más que el tiempo.
9. **Nadie abrió las pantallas durante el recorrido.** Las pruebas cubren la lógica y el HTML, pero no la interacción. Hace falta una pasada a mano o pruebas de extremo a extremo con un navegador.
10. **Los sensores avisan, no bloquean.** De los tres fallos, uno enseñó algo útil: los encabezados de las plantillas no se traducen.

## 9 · Pendientes que deja el recorrido

- NFR5 sin entrada en la trazabilidad (ver [3.6](13-3.6-build-and-test.md)).
- Las observaciones menores abiertas de U4: carpetas huérfanas si el proceso se corta, y el catálogo vacío sin explicación si fallan los ejemplos.
- La observación importante de U1, sin resolver: un archivo JSON dañado bloquea el guardado.
- Probar a mano la interacción de las pantallas de U3: añadir y quitar elementos, el modo de solo lectura y subir adjuntos.

---

**Fuentes:** auditoría del trabajo (786 eventos); conversaciones de Claude Code del 12/10/2026; artefactos de `aidlc/spaces/default/intents/261012-herramienta-producto/`; capítulos 05 y 06.
