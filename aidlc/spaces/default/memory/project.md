# Project-Level Rules

> Project-specific specialisation and corrections. Loaded after `org.md` and
> `team.md` as strict-additive guidance; contradictions with broader policy
> are rejected. Populated by practices-discovery and the self-learning loop.
>
> Use sparingly: most teams don't need a project layer. Reach for it
> only when this specific project needs stable, durable guidance beyond the
> team practice (for example, package-specific release checks or an additional
> regression suite for a legacy component).

## Way of Working

<!-- Project-specific specialisation. Example: -->
<!-- This monorepo requires package-scoped branch names and a package owner -->
<!-- review in addition to the team's normal merge policy. -->

## Walking Skeleton

<!-- Project-specific specialisation. Example: -->
<!-- The walking skeleton must exercise the legacy service adapter as well -->
<!-- as the new service boundary. -->

## Testing Posture

<!-- Project-specific specialisation. -->

## Guard Policy

<!-- Project-specific. Mode: strict, relaxed, or off. Strict here holds for every intent, whatever one person asks in chat; relaxed or off here applies to every intent whose policy came from its scope, unless the person sets another; changing this line changes it. A section under the retired Change Control heading, written by an earlier release, is still read. -->

## Deployment

<!-- Project-specific specialisation. -->

## Code Style

<!-- Project-specific specialisation. -->

## Tech Stack

<!-- Technology choices locked for this project. -->

## Decided

<!-- Decisions made in earlier stages that should not be re-asked. -->
<!-- Format: DECIDED: [decision] (Stage [slug], [date]) -->

## Scope Overrides

<!-- Custom scope rules for this project. -->

## Forbidden

<!-- Populated by practices-discovery affirmation gate. -->
<!-- Format: NEVER [behavior] (affirmed [date]) -->
<!-- Example: NEVER throw exceptions across service layer boundaries (affirmed 2026-05-17) -->

## Mandated

<!-- Populated by practices-discovery affirmation gate. -->
<!-- Format: ALWAYS [behavior] (affirmed [date]) -->
<!-- Example: ALWAYS use Result<T,E> for fallible operations in service layer (affirmed 2026-05-17) -->

## Corrections

<!-- Project-specific corrections from human feedback. -->
<!-- Format: NEVER/ALWAYS [behavior] (learned [date]) -->
- Si la persona responde "Not applicable" a si un requisito de la descripción es criterio de éxito, se interpreta como que no es criterio de éxito de esa versión (el requisito sigue en pie) y se deja como supuesto para que lo confirme. (learned 2026-10-12) <!-- cid:261012-herramienta-producto:intent-capture:4ec73b4d78cda9451c350fcae92f9667f879b78284b1c70a8c95f4ad31da6b3f -->
- El equipo al que se explica el piloto de AI-DLC figura en el mapa de interesados como interesado en el piloto, no como usuario de la herramienta. (learned 2026-10-12) <!-- cid:261012-herramienta-producto:intent-capture:79b6df1b18ec693af89b168a4c3bae141aebbf31f9adccc829c5f9cd31e8f017 -->
- Cuando una respuesta contradice algo ya aprobado en una etapa anterior, se trata como cambio de alcance: se confirma con una pregunta de seguimiento y el cambio se deja explícito en el documento de la etapa. (learned 2026-10-12) <!-- cid:261012-herramienta-producto:scope-definition:e4782cf3df499cc421d999ef0dbc4b4bc5891f891e0a258d13dfdc5e1753f646 -->
- Cuando la persona pide un cambio al resumen que expresa un principio (por ejemplo, "que todo se meta de forma manual para hacerlo más sencillo"), se registra como criterio rector explícito de la versión en el brief y en el registro de decisiones. (learned 2026-10-12) <!-- cid:261012-herramienta-producto:approval-handoff:73342456d9a8a1e8a5252efbc0e8afdc96144aecd65760ab73f8c5b1a6c3abe7 -->
