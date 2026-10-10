# AI-DLC — Plan actualizado de aprendizaje y piloto
Versión 2 — 7 de octubre de 2026. Participante: Andrés Gentile. Zona horaria: Panamá.

## 1. Objetivo y cambio respecto al plan original
Aprender a ejecutar, explicar y adaptar AI-DLC; construir un piloto pequeño reproducible y probar dos integraciones antes de validar su adopción en Qik.

El plan original, Plan_AI_DLC_9_dias.md, asignaba 63 horas: E1 y las cinco profundizaciones de fase, 37 h; harness, 9 h; integraciones, 10 h; validación y transferencia, 7 h. Esta versión conserva ese presupuesto y cambia el orden y la profundidad de los recorridos según la solicitud de Andrés:
1. Preparación mínima.
2. Recorrido rápido con etapas ALWAYS.
3. Profundización por fase con etapas ALWAYS.
4. Recorrido end to end completo con condicionales pertinentes.
5. Profundización por fase hasta cubrir el mapa completo.
6. Harness y funcionamiento interno.
7. Integraciones de referencia.
8. Validación final y propuesta de aplicación en Qik.

Las ocho etapas de aprendizaje (A1–A8) no son las cinco fases oficiales (0–4) ni los pasos de instalación. Esta distinción se mantendrá en los documentos.

## 2. Presupuesto para comunicar a los jefes
Las horas son una redistribución estimada del plan original, no una medición ni una duración garantizada por AWS. Incluyen práctica, explicación, evidencia, bitácora y PPT/ensayo.

| Bloque solicitado | Contenido | Horas | Equivalencia a 7 h/día | Acumulado |
|---|---|---:|---:|---:|
| A1–A3 | Preparación, primer recorrido y profundidad de ALWAYS | 18 | 2,57 jornadas | 18 h |
| A4–A5 | Recorrido completo y profundidad de condicionales | 19 | 2,71 jornadas | 37 h |
| A6 | Harness y funcionamiento interno | 9 | 1,29 jornadas | 46 h |
| A7 | Dos integraciones de referencia | 10 | 1,43 jornadas | 56 h |
| A8 | Validación integral, transferencia y propuesta para Qik | 7 | 1 jornada | 63 h |
| Total | Aprendizaje y piloto de laboratorio | 63 | 9 jornadas | 63 h |

Mensaje ejecutivo: "El aprendizaje y piloto de AI-DLC tiene un presupuesto de 63 horas efectivas: 18 horas para preparación y flujo básico, 19 para el recorrido completo y sus etapas condicionales, 9 para el harness, 10 para integraciones y 7 para validación y propuesta de adopción en Qik. Equivale a nueve jornadas de siete horas."

### Estimación frente a compromiso
- Base: 63 horas, sin margen, igual que el plan original.
- Para un compromiso con margen: reservar opcionalmente 7 horas adicionales (70 h / 10 jornadas), sujetas a acuerdo con los jefes. Ese margen no forma parte de las actividades de 63 h ni está aprobado como ampliación.
- Dependencias principales: instalación en Windows corporativo, autorización de hooks/herramientas, disponibilidad de modelos/créditos y acceso a las dos cuentas de integración.
- Objetivo dentro de las 63 h: cubrir el mapa y practicar en escenarios pertinentes. No se garantiza dominio exhaustivo, 33 etapas verificadas o intervención de 14 agentes solo por agotar las horas.
- Las horas ya trabajadas forman parte del presupuesto, no se agregan otras 63 h desde el 7 de octubre. No existe un registro fiable de horas consumidas; el saldo pendiente se calculará como 63 menos horas efectivas confirmadas.
- El calendario original era 6–16 de octubre. Como cambió el orden y no se midió el tiempo consumido, esa fecha de cierre no se ratifica automáticamente. Se usará el calendario relativo siguiente hasta registrar disponibilidad y avance.

## 3. Calendario relativo
No incluye fines de semana. Cada jornada requiere siete horas efectivas; si se dispone de menos horas al día, cambia la duración calendario.

| Jornada | Distribución | Hito |
|---|---|---|
| 1 | A1: 3 h + A2: 4 h | Entorno mínimo y primera aplicación verificada |
| 2 | A3: 7 h | Profundización del flujo básico |
| 3 | A3: 4 h + A4: 3 h | Cierre de ALWAYS e inicio del recorrido completo |
| 4 | A4: 2 h + A5: 5 h | Recorrido completo y condicionales de fases iniciales |
| 5 | A5: 7 h | Profundización de condicionales |
| 6 | A5: 2 h + A6: 5 h | Cierre de cobertura y estudio del harness |
| 7 | A6: 4 h + A7: 3 h | Harness explicado e inicio de integraciones |
| 8 | A7: 7 h | Dos conexiones de referencia y reproducción |
| 9 | A8: 7 h | Demostración final y propuesta para Qik |

## 4. ALWAYS, condicionales y límites del primer recorrido
Fuente: documentación oficial de Phases and Stages consultada el 7 de octubre de 2026. Al instalar se fija una versión y se contrasta la matriz; la rama main puede cambiar.

| Fase | Etapas marcadas ALWAYS en la documentación consultada |
|---|---|
| Inicialización | 0.1 Workspace Scaffold; 0.2 Workspace Detection; 0.3 State Initialization |
| Ideación | 1.1 Intent Capture & Framing; 1.4 Scope Definition; 1.7 Approval & Handoff |
| Concepción | 2.3 Requirements Analysis; 2.7 Units Generation; 2.9 Delivery Planning |
| Construcción | 3.5 Code Generation; 3.6 Build and Test |
| Operación | Ninguna: sus siete etapas son condicionales |

ALWAYS significa que la etapa se ejecuta cuando pertenece al alcance elegido. Condicional significa que se evalúa si corresponde al trabajo. No se inventan condiciones para contabilizar cobertura.

Corrección al índice previo: la primera pasada de solo ALWAYS no demuestra operación completa de las cinco fases. Produce una aplicación construida y probada, y explica la frontera con Operación. La práctica operativa se programa en A4–A5.

La ruta reducida debe ser soportada por la versión/harness, revisada y registrada antes de ejecutarla. No se da por hecho que un scope estándar permita omitir toda condicional. Si sus dependencias necesitan otra etapa, se añade explícitamente y se registra el motivo. No se alterará manualmente el estado ni se eliminarán controles para fingir la ruta mínima.

## 5. Caso, entorno y alcance
Caso del piloto: el **panel** de conocimiento, arquitectura y observabilidad de productos tecnológicos descrito en `docs/vision-panel.md` (reemplaza al caso didáctico anterior, el gestor de solicitudes internas). Se usan datos ficticios. El panel completo excede las 63 h: el primer recorrido construye solo un corte mínimo, cuyo alcance exacto se decide y registra en Ideación (1.1 Intent Capture y 1.4 Scope Definition). Los recorridos siguientes amplían ese corte.
- Mac (equipo principal): VS Code + Claude Code. Cambio del 10 de octubre de 2026: sustituye a Kiro porque la versión gratuita de Kiro limita los modelos disponibles y Claude Code permite usar modelos más avanzados. El framework instalado para Kiro (`.kiro/`) se elimina del repositorio y queda solo en el historial de Git.
- Windows corporativo: VS Code + Copilot, sin cambios.
- Seleccionar un equipo principal para las ejecuciones; comprobar el segundo con una prueba acotada. Ejecutar todos los recorridos dos veces no está incluido en las 63 h.
- Reutilizar aplicación, artefactos y puntos de recuperación. Trabajar cambios en ramas/copias adecuadas; conservar evidencia previa.
- Usar el código del primer recorrido como escenario existente para estudiar ingeniería inversa.
- Escoger repositorio/CI y gestor de trabajo según accesos disponibles. No se asume la herramienta usada por Qik.
- Registrar versión del framework, herramienta, modelo, scope, ruta, equipo y evidencia de cada recorrido.
- La ejecución central o una plataforma productiva en AWS no está incluida. A8 evalúa opciones y prepara un piloto propuesto; no despliega en producción ni certifica cumplimiento.

## 6. Etapas de aprendizaje detalladas
### A1. Terminar preparación — 3 horas
Presupuesto total, incluyendo lo ya realizado, sujeto a medir consumo.
- Confirmar inventario y acceso básico de ambos equipos sin repetir comprobaciones válidas.
- Verificar carpeta, Git y confianza en Windows. Mac ya está preparado.
- Registrar versión de VS Code y Claude Code y fijar versión de AI-DLC (2.11.0 instalada en Mac).
- Instalar/configurar para Claude Code (Mac) y Copilot (Windows) y comprobar diagnóstico, herramientas y hooks.
- Confirmar modelo, consumo disponible, equipo principal y caso mínimo.
Cierre: instalación y prueba real verificadas; registrar diferencias por equipo y restricciones.
Evidencia: ficha del entorno, resultados de diagnóstico y carpeta del proyecto.

### A2. Primera pasada rápida de ALWAYS — 4 horas
Distribución: 3 h práctica + 1 h PPT/ensayo.
- Revisar y aprobar la ruta mínima soportada.
- Recorrer intención, alcance, requisitos, unidades, entrega, código y pruebas.
- Explicar brevemente entrada, salida y aprobación, sin profundizar aún en todos los archivos.
- Ejecutar el camino principal de la aplicación y conservar un punto recuperable.
- Explicar qué falta para operar y qué condicionales quedaron fuera.
Cierre: aplicación mínima funcional y mapa de la ruta realmente ejecutada.
PPT 1: proceso básico, resultado, controles y omisiones.

### A3. Profundización de fases con ALWAYS — 11 horas
Distribución: 9 h práctica/estudio + 2 h de preparación inicial de PPT 2–6.
| Fase | Horas | Ejercicio |
|---|---:|---|
| Inicialización | 2 | Inspeccionar estructura, detección y estado; comparar carpeta nueva y existente |
| Ideación | 2 | Aclarar petición, revisar alcance y justificar un cambio/aprobación |
| Concepción | 3 | Seguir requisitos hasta unidades/dependencias y plan; resolver una contradicción |
| Construcción | 3,5 | Seguir una unidad, revisar código, demostrar fallo y corrección de una prueba |
| Operación | 0,5 | Explicar su propósito y por qué no tiene etapas ALWAYS; registrar práctica pendiente |
| Total | 11 | |
Usar resultados de A2. Repetir únicamente un ejercicio necesario para comprender o comparar comportamiento.
Cierre: explicar propósito, entradas, salidas, agentes, decisiones y evidencias del recorrido básico.
PPT 2–6: primera versión por fase; Operación será introductoria y estará marcada como pendiente de práctica.

### A4. Recorrido end to end completo — 5 horas
Distribución: 4,5 h práctica + 0,5 h documentación y ensayo integrado.
- Introducir una mejora pequeña sobre la aplicación existente.
- Seleccionar un flujo que incluya las cinco fases y justificar condicionales aplicables.
- Usar interfaz, código existente, requisitos no funcionales y entorno de laboratorio para ampliar cobertura.
- Recorrer hasta operación en pruebas, con alcance acotado y entradas existentes.
- Registrar condicionales ejecutadas, omitidas y pendientes para A5.
Cierre: cadena coherente de solicitud → decisión → código → pruebas → resultado operativo.
No se promete que un único recorrido active todas las etapas. Las variantes necesarias se trabajan en A5.

### A5. Profundización de fases con el mapa completo — 14 horas
Distribución: 11,5 h práctica/estudio + 2,5 h para completar PPT 2–6 y ensayarlas.
| Fase | Horas | Profundización |
|---|---:|---|
| Inicialización | 0,5 | Revisar efectos de nuevo/existente y continuidad; reutilizar evidencia |
| Ideación | 2 | Investigación, viabilidad, equipo y bocetos; documentar supuestos del ejercicio |
| Concepción | 4 | Ingeniería inversa, prácticas, historias, mockups, dominio y contratos |
| Construcción | 3,5 | Diseño funcional, NFR, infraestructura y CI mínimo; revisar ALWAYS cuando conecten |
| Operación | 4 | Despliegue, entorno, señales, incidente reversible, recuperación, rendimiento y feedback |
| Total | 14 | |
Priorizar condicionales, conexiones y brechas. No reconstruir la aplicación ni repetir toda explicación de A3.
Cierre: matriz de cobertura de etapas y agentes, evidencia de ejercicios y pendientes explícitos.
PPT 2–6: versión completa, con comparación ALWAYS/condicionales por fase.

### A6. Harness y funcionamiento interno — 9 horas
Distribución original conservada: 8 h práctica/estudio + 1 h PPT/ensayo.
- Distinguir metodología, implementación, modelo, harness y producto.
- Leer una definición de etapa y agente y seguir una transición real conductor → motor → estado/auditoría.
- Estudiar skills, hooks, herramientas, contexto, reglas, memoria y permisos.
- Incorporar una regla y conocimiento propio en las ubicaciones soportadas; comprobar su efecto.
- Reanudar una tarea y revisar el mantenimiento de personalizaciones durante upgrades.
- Comparar un comportamiento concreto Claude Code/Copilot, sin duplicar todos los recorridos.
Cierre: explicación técnica basada en archivos y evidencia.
PPT 7: componentes, personalización, continuidad y mantenimiento.
No incluye crear un nuevo harness ni un plugin complejo.

### A7. Piloto e integraciones — 10 horas
Distribución original conservada: 9 h práctica + 1 h PPT/ensayo.
| Actividad | Horas |
|---|---:|
| Elegir operaciones, acceso y criterios de prueba | 1 |
| Conexión A: repositorio/CI, enlazar cambio y consultar prueba | 3 |
| Conexión B: gestor de trabajo, leer solicitud y asociar resultado; escritura acotada si autorizada | 3 |
| Reproducción, configuración de ejemplo y límites | 2 |
| PPT 8 y ensayo | 1 |
| Total | 10 |
Aprovechar CI mínimo de A5: aquí se demuestra su conexión con el flujo, no se rehace.
Comparar API, CLI o MCP según soporte real. Probar una condición de error y registrar autenticación/mapeos.
Cierre objetivo: dos conexiones reales de laboratorio, instrucciones y evidencia. Si falta acceso, marcar el bloqueo; una simulación no cuenta como conexión real.

### A8. Validación final, transferencia y Qik — 7 horas
Distribución: 6 h práctica/análisis + 1 h PPT/ensayo.
| Actividad | Horas |
|---|---:|
| Conducir y verificar un cambio pequeño desde la solicitud conectada | 3 |
| Revisar reproducción, cobertura, decisiones y paquete de transferencia | 1 |
| Evaluar opciones para Qik y redactar propuesta de piloto y validaciones pendientes | 2 |
| PPT 9 y ensayo | 1 |
| Total | 7 |
Comparar ejecución local con configuración compartida, entornos remotos, servicio administrado, plataforma propia y modelo híbrido. Proponer control de versiones, contexto por equipo/tarea y revisión de aprendizajes.
Cierre: demostración final, dos decisiones defendidas, paquete de continuidad y propuesta acotada.
No incluye construir la plataforma Qik ni validar su red, SSO, producción, escala o cumplimiento.

## 7. Entregables y presupuesto documental
63 h = 54 h de práctica/estudio + 9 h de PPT/ensayo. La bitácora y captura de evidencia se recogen dentro de cada actividad; no se añaden como otro bloque.
- PPT 1: recorrido básico (1 h en A2).
- PPT 2–6: cinco fases (2 h iniciales en A3 + 2,5 h de cierre en A5).
- Ensayo/documentación del recorrido completo: 0,5 h en A4.
- PPT 7, 8 y 9: 1 h cada una en A6–A8.
Plantilla breve: objetivo; funcionamiento; etapas/agentes; decisiones/controles; evidencia; aprendizajes/pendientes.
Las nueve presentaciones son entregables planificados, no archivos ya creados.
Si las reuniones con jefes ocurren dentro de estas horas, su tiempo se descuenta y se ajustan actividades.

## 8. Cobertura y criterios de evidencia
Una fila por etapa, contrastada con la versión instalada: ID, fase, condición, cuándo aplica, entrada/salida, líder/apoyos/revisor, aprobación, escenario, resultado y evidencia.
Estados: pendiente; leído; simulado; ejecutado; verificado; no aplica con motivo.
Un agente se considera observado por su intervención respaldada, no por aparecer en un archivo.
Distinguir: documentación oficial; decisión del plan; observado en laboratorio; pendiente de validar con Qik.
No confundir "estudiar todas las etapas" con "verificar todas en una única ejecución". El mapa completo puede requerir varios escenarios.

## 9. Estado para continuar
Al 7 de octubre de 2026:
- Inventario y conversación básica: completados en Mac y Windows.
- Carpeta/Git/confianza en Kiro: completados en Mac.
- Mac: /Users/andresgentile/Downloads/AWS/piloto-ai-dlc; rama main; sin commits en la última comprobación.
- Windows: carpeta, Git del proyecto y confianza pendientes de verificar; no asumir ruta creada.
- AI-DLC: instalación y configuración no comprobadas.
- Versiones de AI-DLC/Kiro, modelo definitivo, scope y equipo principal: pendientes.
- Horas efectivas consumidas: no registradas.
Siguiente acción: retomar el paso 3 en Windows; luego fijar versión e instalar/configurar el framework en ambos equipos.

Actualización al 10 de octubre de 2026:
- Mac: AI-DLC 2.11.0 instalado para Kiro (commit `chore: configurar AI-DLC 2.11.0 para Kiro`). Se decide ejecutar con VS Code + Claude Code: AI-DLC 2.11.0 instalado para el harness `claude` (`.claude/`) y eliminada la instalación de Kiro.
- Caso del piloto: el panel (`docs/vision-panel.md`), en lugar del gestor de solicitudes.
- Se inicia el playbook para el equipo en `playbook/`, que se construye a medida que avanza el piloto.

## 10. Fuentes y vigencia
Base de horas: Plan_AI_DLC_9_dias.md, vista ejecutiva y presupuestos E1–E9, leído íntegramente para esta actualización.
Base de avances: Bitacora_AI_DLC.md y resultados/capturas reportados en la conversación.
Material de estudio conservado: AI DLC L100.md, AI DLC 200.md, AI DLC L300.md y AI DLC L400.md.
Documentación técnica:
- [Fases y etapas](https://github.com/awslabs/aidlc-workflows/blob/main/docs/guide/04-phases-and-stages.md)
- [Scopes y profundidad](https://github.com/awslabs/aidlc-workflows/blob/main/docs/guide/05-scopes-and-depth.md)
- [Primer recorrido](https://github.com/awslabs/aidlc-workflows/blob/main/docs/guide/02-your-first-workflow.md)
- [Instalación](https://github.com/awslabs/aidlc-workflows/blob/main/docs/guide/01-getting-started.md)
- [Kiro IDE](https://github.com/awslabs/aidlc-workflows/blob/main/docs/guide/harnesses/kiro-ide.md)
- [Copilot](https://github.com/awslabs/aidlc-workflows/blob/main/docs/guide/harnesses/copilot.md)
La matriz de fases se consultó el 7 de octubre; el resto son referencias a verificar contra la versión seleccionada antes de usar comandos. Los resúmenes del curso pueden reflejar otra distribución; no asumir Bun universal ni copiar comandos sin contrastar.

