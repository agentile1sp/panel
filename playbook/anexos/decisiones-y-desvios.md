# Anexo · Decisiones y desvíos del piloto

> **En una frase:** qué decidimos durante el piloto y dónde nos apartamos de lo previsto, con el enlace a la página de la bitácora donde se cuenta.

Las decisiones de cómo se organiza el playbook están en la [guía](../00-guia-del-playbook.md), §11. Aquí van las del **recorrido**.

## Recorrido 1 · 12/10/2026

### Decisiones sobre el producto

| Cuándo | Decisión | Dónde se cuenta |
|---|---|---|
| 1.1 | Una sola persona usuaria; fuera los varios usuarios, la edición visual y las otras vistas del panel | [1.1](../08-bitacora-piloto/05-1.1-intent-capture.md) |
| 1.4 | El proceso queda **fijo** en esta versión, descrito en una definición separada (DL-06) | [1.4](../08-bitacora-piloto/06-1.4-scope-definition.md) |
| 1.7 | **Todo se introduce a mano**: sin transformaciones automáticas entre pasos. Salen los criterios E2 y E5 (DL-09 y DL-10) | [1.7](../08-bitacora-piloto/07-1.7-approval-handoff.md) |
| 2.3 | Estados Pendiente, En curso y Completo; orden obligatorio; un producto solo tiene nombre | [2.3](../08-bitacora-piloto/08-2.3-requirements-analysis.md) |
| 2.6 | Tres componentes; datos en archivos legibles con un servidor local; ejemplos solo en la primera apertura | [2.6](../08-bitacora-piloto/09-2.6-domain-design.md) |
| 2.7 | Cuatro unidades; si falla una operación a medias, se **deshace** la primera escritura (no la opción recomendada) | [2.7](../08-bitacora-piloto/10-2.7-units-generation.md) |
| 2.9 | Un bolt por unidad; el comando de comprobación se decide al terminar la primera | [2.9](../08-bitacora-piloto/11-2.9-delivery-planning.md) |
| 3.5 | Tecnología: Node.js sin dependencias. Comando de comprobación: `npm --prefix herramienta test` | [U1](../08-bitacora-piloto/12-3.5-code-generation/01-u1-base.md) |

### Decisiones sobre cómo se ejecuta AI-DLC

| Cuándo | Decisión | Dónde se cuenta |
|---|---|---|
| Arranque | Aprobar el plan del `composer` sin cambios y guardarlo como `piloto-flujo-basico` | [Arranque](../08-bitacora-piloto/01-arranque-plan-a-medida.md) |
| 1.1 | Responder en modo guiado (**Guide me**), reutilizado en todas las etapas | [1.1](../08-bitacora-piloto/05-1.1-intent-capture.md) |
| 2.7 | Pausar con el gate abierto y retomar en otra sesión | [2.7](../08-bitacora-piloto/10-2.7-units-generation.md) |
| 3.5 | Construir en **modo automático** (Continue automatically) | [3.5](../08-bitacora-piloto/12-3.5-code-generation/00-vision-general.md) |
| 3.5 | Cambiar la Guard Policy de `strict` a `relaxed` para cerrar la etapa sin repetir las 4 unidades | [Cierre de 3.5](../08-bitacora-piloto/12-3.5-code-generation/05-cierre-de-la-etapa.md) |
| Después | Recuperar los cambios del playbook (`2-concepcion.md`) que se deshicieron durante el bloqueo | [Cierre de 3.5](../08-bitacora-piloto/12-3.5-code-generation/05-cierre-de-la-etapa.md) |

### Desvíos respecto a lo previsto

| Previsto | Real | Dónde se cuenta |
|---|---|---|
| El plan a medida parte de `classic` | Partió de `express` | [Arranque](../08-bitacora-piloto/01-arranque-plan-a-medida.md) |
| Revisiones consultivas | Máximo `adversarial` | [Arranque](../08-bitacora-piloto/01-arranque-plan-a-medida.md) |
| 1 aprobación del plan de código | 5 | [3.5](../08-bitacora-piloto/12-3.5-code-generation/00-vision-general.md) |
| 9 gates aprobados por nosotros | 7 nuestros y 2 automáticos | [Esperado contra real](../08-bitacora-piloto/14-esperado-vs-real.md) |
| Guard Policy `strict` hasta el final | `relaxed` desde el cierre de 3.5 | [Cierre de 3.5](../08-bitacora-piloto/12-3.5-code-generation/05-cierre-de-la-etapa.md) |
| Una sesión de trabajo | 3 sesiones y una pausa de casi 7 horas por el límite de uso | [U4](../08-bitacora-piloto/12-3.5-code-generation/04-u4-catalogo.md) |

### Reglas que aprendió AI-DLC

Guardadas en `aidlc/spaces/default/memory/project.md`, en la sección Corrections:
1. "Not applicable" a si un requisito es criterio de éxito se lee como "no es criterio de éxito en esta versión" (1.1).
2. El equipo al que se explica el piloto es interesado en el piloto, no usuario de la herramienta (1.1).
3. Una respuesta que contradice algo ya aprobado es un cambio de alcance: se confirma y se deja explícito (1.4).
4. Un cambio al resumen que expresa un principio se registra como criterio rector de la versión (1.7).
