# Piloto · Recorrido 1: cómo arrancar

Primer recorrido del piloto de AI-DLC: una pasada por el flujo básico construyendo la herramienta de producto del panel. Rama de trabajo: `piloto/recorrido-1`.

## 1. El comando

Copiar y pegar tal cual en el chat de Claude Code. Lo tiene que escribir la persona: AI-DLC no deja que la IA lo lance por su cuenta.

```
/aidlc compose Piloto de aprendizaje de AI-DLC: primera pasada por el flujo básico.
Objetivo del recorrido: ejecutar solo las etapas ALWAYS y las imprescindibles por
dependencias entre etapas. Las etapas condicionales se practicarán en un recorrido
posterior, así que no hace falta incluirlas ahora salvo que el resultado salga mal sin ellas.

Qué quiero construir: la herramienta de producto del panel de conocimiento de productos
tecnológicos. Documento principal: docs/proceso-producto/LEEME.md, que describe mi proceso
de producto (etapa 3 · Producto, 10 pasos) y enlaza el proceso visual
(docs/proceso-producto/proceso-producto.html) y una plantilla por artefacto
(docs/proceso-producto/plantillas/). Contexto del panel completo: docs/vision-panel.md.

- Un catálogo con todos mis productos. Al hacer clic en uno, entro a su recorrido por mi
  proceso de producto y paso etapa por etapa viendo el estado de cada paso y lo que se
  creó en cada uno.
- Por ahora solo la etapa 3 · Producto. Entra la idea escogida; las etapas 1 · Problema y
  2 · Solución quedan fuera.
- Los datos los meto yo. Hipótesis, línea base y walking skeleton son documentos de texto
  con estructura mínima. El mapa de piezas, las fichas (de capacidad y de instancia), el
  story map y el cierre del alcance son estructurados, y de esos datos se extraen y
  transforman los pasos siguientes: por ejemplo, de las fichas salen el mapa de piezas
  ajustado, el user flow, el story map y la tabla CRUD. En cada paso los datos se completan
  más y se siguen transformando. No es un PPT donde todo se pone a mano: hay una lógica
  que conecta los pasos, y cada paso declara de qué pasos anteriores toma datos. Parte del
  trabajo es definir cómo se modelan y transforman esos datos.
- El proceso es solo mío, pero tiene que ser fácil de cambiar: mover, agregar o eliminar
  etapas y pasos. Tiene que quedar bien hecho desde el principio.
- Evolución futura, no para esta versión: conectar la herramienta con AI-DLC u otros
  procesos para que lo que se genere se vea en tiempo real. El diseño no debe cerrarle la
  puerta.

Restricciones: proyecto nuevo, sin código previo. Aplicación web que se ejecuta en local,
con datos de ejemplo ficticios, sin despliegue, sin autenticación y sin integraciones externas.

Configuración: Guard Policy strict y confirmación de resumen encendida, para observar
todos los controles e interacciones durante el aprendizaje.
```

## 2. En el gate del plan de `compose`

- **Comprobar la configuración:** Guard Policy `strict` y confirmación de resumen encendida. Si el `composer` no las propone, pedirlas en el gate.
- **Comparar con la predicción** del capítulo 05 del playbook: 11 etapas ALWAYS más `2.6 Domain Design`, porque `2.7` y `2.9` necesitan sus `components`.
- **Si propone etapas extra**, leer su justificación. Lo importante es que el producto salga bien: si una etapa condicional es necesaria, se acepta.

## 3. Durante el recorrido

- **Capturas** de cada gate y de cada pregunta importante en `playbook/assets/`, con el nombre `cap07-<etapa>-<nn>.png`.
- La bitácora del capítulo 07 se escribe a partir de los registros de AI-DLC (`aidlc-state.md`, `memory.md` de cada etapa, auditoría) y de las capturas.
- Por cada etapa ejecutada, añadir a la referencia de etapas un enlace al documento real y un extracto corto (sin inventar ejemplos).
