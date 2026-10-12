# Declaración de intención: herramienta de producto del panel

Herramienta para recorrer la etapa 3 · Producto del proceso de producto, con un catálogo de productos y el recorrido de cada uno paso a paso. [desc]

## Problema que se resuelve (Problem Statement)

- Hoy el proceso de producto se recorre en documentos sueltos, y no se ve de un vistazo en qué paso está cada producto ni qué se produjo en cada paso. [Q1]
- Los datos de un paso no se reutilizan en los siguientes: se copian y transforman a mano, y terminan desincronizados. [Q1]
- El proceso no es un documento donde todo se pone a mano: hay una lógica que conecta los pasos, y cada paso declara de qué pasos anteriores toma datos. [desc]

## Para quién es (Target Customer)

- La única persona usuaria de esta primera versión es quien define y recorre el proceso de producto. [Q2]
- Los datos los introduce esa misma persona. [desc]
- Beneficio esperado: ver el estado de cada producto en el proceso y dejar de copiar a mano los datos entre pasos. [Q1]

## Criterios de éxito (Success Metrics)

Cada criterio se comprueba al terminar esta primera versión, con un resultado de sí o no. [Q3] [Q9]

| # | Criterio | Cómo se comprueba | Source |
|---|---|---|---|
| E1 | Recorrido completo | Un producto ficticio se lleva por los 10 pasos de la etapa 3 · Producto dentro de la herramienta, de principio a fin | [Q3] [desc] |
| E2 | Datos derivados | Los pasos estructurados toman los datos de los pasos anteriores sin copiarlos a mano; por ejemplo, el story map sale de las fichas | [Q3] [desc] |
| E3 | Visibilidad en el catálogo | Desde el catálogo se ve en qué paso va cada producto | [Q3] [Q9] |
| E4 | Visibilidad del recorrido | Al entrar en un producto se ve el estado de cada uno de los 10 pasos y lo que se creó en cada uno | [Q3] [Q9] [desc] |
| E5 | Origen de los datos | En cada paso se ve de qué pasos anteriores tomó sus datos | [Q3] [Q9] |

## Por qué ahora (Initiative Trigger)

- Es el caso real del piloto de aprendizaje de AI-DLC. [Q4] [desc]
- El proceso de producto se acaba de corregir y se quiere empezar a usar con una herramienta. [Q4]

## Señal inicial de alcance (Initial Scope Signal)

**Plan de trabajo (workflow-selected):** el recorrido corre sobre el scope `express`, ajustado para este piloto. [scope]

### Límites del producto confirmados

- Dentro: un catálogo con todos los productos; al elegir uno, se entra en su recorrido por el proceso y se avanza paso a paso viendo el estado de cada paso y lo que se creó en cada uno. [desc]
- Dentro: solo la etapa 3 · Producto, a partir de la idea escogida. [desc]
- Dentro: el proceso tiene que poder cambiarse con facilidad (mover, agregar o eliminar etapas y pasos), bien hecho desde el principio. [desc]
- Dentro: definir cómo se modelan y transforman los datos de cada paso. [desc]
- Fuera: las etapas 1 · Problema y 2 · Solución. [desc]
- Fuera: la conexión con AI-DLC u otros procesos para ver en tiempo real lo que se genera; el diseño no debe cerrarle la puerta. [desc]
- Fuera: despliegue, autenticación e integraciones externas; se usa en local con datos de ejemplo ficticios. [desc]
- Fuera: editar visualmente el user flow, los wireframes y los mockups; basta con su checklist y un enlace o archivo adjunto. [Q8]
- Fuera: las otras vistas del panel (arquitectura, flujo en vivo, analítica de uso y versiones). [Q8]
- Fuera: varios usuarios o edición compartida. [Q8]

## Assumptions & Open Questions

- [assumption] Que el proceso se pueda cambiar fácilmente sigue siendo un requisito, porque lo pide la descripción, pero no es un criterio de éxito que se mida en esta versión (en la pregunta Q10 se respondió Not applicable).
