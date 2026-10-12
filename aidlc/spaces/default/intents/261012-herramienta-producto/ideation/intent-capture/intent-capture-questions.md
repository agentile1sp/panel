# Intent Capture & Framing: preguntas

## Sources

- [desc] Initial description: "Piloto de aprendizaje de AI-DLC: primera pasada por el flujo básico.\nObjetivo del recorrido: ejecutar solo las etapas ALWAYS y las imprescindibles por\ndependencias entre etapas. Las etapas condicionales se practicarán en un recorrido\nposterior, así que no hace falta incluirlas ahora salvo que el resultado salga mal sin ellas.\n\nQué quiero construir: la herramienta de producto del panel de conocimiento de productos\ntecnológicos. Documento principal: docs/proceso-producto/LEEME.md, que describe mi proceso\nde producto (etapa 3 · Producto, 10 pasos) y enlaza el proceso visual\n(docs/proceso-producto/proceso-producto.html) y una plantilla por artefacto\n(docs/proceso-producto/plantillas/). Contexto del panel completo: docs/vision-panel.md.\n\n- Un catálogo con todos mis productos. Al hacer clic en uno, entro a su recorrido por mi\n  proceso de producto y paso etapa por etapa viendo el estado de cada paso y lo que se\n  creó en cada uno.\n- Por ahora solo la etapa 3 · Producto. Entra la idea escogida; las etapas 1 · Problema y\n  2 · Solución quedan fuera.\n- Los datos los meto yo. Hipótesis, línea base y walking skeleton son documentos de texto\n  con estructura mínima. El mapa de piezas, las fichas (de capacidad y de instancia), el\n  story map y el cierre del alcance son estructurados, y de esos datos se extraen y\n  transforman los pasos siguientes: por ejemplo, de las fichas salen el mapa de piezas\n  ajustado, el user flow, el story map y la tabla CRUD. En cada paso los datos se completan\n  más y se siguen transformando. No es un PPT donde todo se pone a mano: hay una lógica\n  que conecta los pasos, y cada paso declara de qué pasos anteriores toma datos. Parte del\n  trabajo es definir cómo se modelan y transforman esos datos.\n- El proceso es solo mío, pero tiene que ser fácil de cambiar: mover, agregar o eliminar\n  etapas y pasos. Tiene que quedar bien hecho desde el principio.\n- Evolución futura, no para esta versión: conectar la herramienta con AI-DLC u otros\n  procesos para que lo que se genere se vea en tiempo real. El diseño no debe cerrarle la\n  puerta.\n\nRestricciones: proyecto nuevo, sin código previo. Aplicación web que se ejecuta en local,\ncon datos de ejemplo ficticios, sin despliegue, sin autenticación y sin integraciones externas.\n\nConfiguración: Guard Policy strict y confirmación de resumen encendida, para observar\ntodos los controles e interacciones durante el aprendizaje."
- [scope] Workflow-selected scope: `express`.

## Q1. ¿Qué problema principal resuelve la herramienta? (select all that apply)

Tu descripción explica qué quieres construir; esta pregunta busca el problema de fondo, para que el resto del trabajo se mida contra él.

A. Hoy recorro mi proceso de producto en documentos sueltos y no veo de un vistazo en qué paso está cada producto ni qué se produjo en cada paso
B. Los datos de un paso no se reutilizan en los siguientes: los copio y transformo a mano, y se desincronizan
C. El objetivo principal es aprender AI-DLC con un caso real; el problema del producto es secundario
D. Not yet defined
X. Other (please specify)

[Answer]: A, B

## Q2. ¿Quién va a usar la herramienta en esta primera versión?

Define para quién se diseña: un único usuario simplifica mucho, varios obligan a pensar en permisos y colaboración.

A. Solo yo
B. Solo yo ahora, pero más adelante también mi equipo
C. Mi equipo desde esta primera versión
D. Not identified
X. Other (please specify)

[Answer]: A

## Q3. ¿Cómo sabremos que esta primera versión funcionó? (select all that apply)

Las métricas tienen que poder comprobarse, así que elige las que puedas verificar al terminar.

A. Puedo llevar un producto ficticio por los 10 pasos de la etapa 3 · Producto dentro de la herramienta, de principio a fin
B. Los pasos estructurados toman datos de los anteriores sin copiarlos a mano (por ejemplo, el story map sale de las fichas)
C. Puedo mover, agregar o quitar un paso del proceso cambiando solo su definición, sin tocar el código
D. Completar la etapa 3 de un producto me lleva menos tiempo que hoy (medido antes y después)
E. Not yet defined
X. Other (please specify)

[Answer]: A, B, X. Other: Tener visibilidad del proceso del producto

## Q4. ¿Por qué ahora? ¿Qué disparó esta iniciativa? (select all that apply)

Ayuda a entender la urgencia y qué pesa más si hay que recortar.

A. El piloto de aprendizaje de AI-DLC: necesito un caso real para recorrer el flujo
B. Acabo de corregir mi proceso de producto y quiero empezar a usarlo con una herramienta
C. Es el primer módulo del panel de conocimiento completo
D. Not applicable
X. Other (please specify)

[Answer]: A, B

## Q5. Además de ti, ¿quién tiene interés en el resultado y qué le importa?

Sirve para el mapa de interesados; si no hay nadie más, se deja así y no se inventa ninguno.

A. Nadie más: es una herramienta personal
B. Compañeros que seguirán el piloto de AI-DLC (les importa ver cómo funciona el método con un caso real)
C. Un equipo de producto que usaría el mismo proceso (les importa que el proceso sea reutilizable)
D. Not identified
X. Other (please specify)

[Answer]: A

## Q6. ¿Quién decide el alcance y las prioridades?

Cuando haya que recortar o elegir entre opciones, conviene saber quién tiene la última palabra y quién influye.

A. Yo decido todo
B. Yo decido, pero alguien influye (indica quién)
C. Decide otra persona (indica quién)
D. Not yet defined
X. Other (please specify)

[Answer]: A

## Q7. ¿Hace falta informar del avance a alguien, y con qué frecuencia?

Define si hay que preparar resúmenes o presentaciones durante el trabajo.

A. None: no hay que informar a nadie
B. Mostrar el avance al equipo cuando se presente el piloto
C. Revisiones periódicas con alguien (indica con quién y cada cuánto)
D. Not yet defined
X. Other (please specify)

[Answer]: X. Other: Tengo que terminarl el piloto para poder documentar todo lo que hicimos y explicarle a mi equipo como funciona el AI DLC con un caso real como este

## Q8. Además de lo que ya dejaste fuera, ¿qué más NO debe hacer esta primera versión? (select all that apply)

Ya quedaron fuera las etapas 1 · Problema y 2 · Solución, la conexión en tiempo real con AI-DLC, el despliegue, la autenticación y las integraciones externas. El plan de trabajo ya está elegido; esto es solo sobre el producto.

A. Editar visualmente los pasos visuales (user flow, wireframes, mockups): basta con su checklist y un enlace o archivo adjunto
B. Las otras vistas del panel (arquitectura, flujo en vivo, analítica de uso, versiones)
C. Varios usuarios o edición compartida
D. Exportar o importar los datos
E. None: nada más queda fuera
X. Other (please specify)

[Answer]: A, B, C (parte 2: E. None)

## Q9. ¿Cómo comprobarías que tienes "visibilidad del proceso del producto"? (select all that apply)

Seguimiento de Q3: los criterios de éxito tienen que poder verificarse, y "visibilidad" admite varias lecturas.

A. Desde el catálogo veo en qué paso va cada producto
B. Al entrar en un producto veo el estado de cada uno de los 10 pasos y lo que se creó en cada uno
C. En cada paso veo de qué pasos anteriores tomó sus datos
D. Not yet defined
X. Other (please specify)

[Answer]: A, B, C

## Q10. ¿Que el proceso se pueda cambiar fácilmente es también un criterio de éxito de esta versión?

Seguimiento de Q3: tu descripción pide poder mover, agregar o eliminar etapas y pasos y que quede bien hecho desde el principio, pero no lo marcaste como criterio de éxito.

A. Sí: añadirlo como criterio de éxito (cambio un paso tocando solo su definición, sin tocar el código)
B. Es un requisito del diseño, pero no hace falta medirlo como criterio de éxito en esta versión
C. Not applicable
X. Other (please specify)

[Answer]: C

## Q11. ¿Tu equipo aparece en el mapa de interesados?

Seguimiento de Q5 y Q7: en Q5 dijiste que nadie más tiene interés en la herramienta, y en Q7 que vas a explicarle a tu equipo cómo funciona AI-DLC con este caso real.

A. Sí, como interesado en el piloto de AI-DLC (no como usuario de la herramienta)
B. No: el mapa trata solo de la herramienta, y el equipo queda fuera
C. Not applicable
X. Other (please specify)

[Answer]: A

## Consolidated Summary Confirmation

Does this all look correct before I generate the artifact?

- Looks correct
- Request changes

[Answer]: Looks correct

## Assumption Confirmation

Los documentos generados contienen este supuesto:

- [assumption] Que el proceso se pueda cambiar fácilmente sigue siendo un requisito, porque lo pide la descripción, pero no es un criterio de éxito que se mida en esta versión (en la pregunta Q10 se respondió Not applicable).

A. Accept assumptions
B. Convert to follow-up questions

[Answer]: A. Accept assumptions
