# Plan de código: U4 · Catálogo (`u4-catalogo`)

## Summary

- Builds: los productos y el catálogo con su paso actual, crear, renombrar y borrar con deshacer si algo falla a medias, los tres productos ficticios de la primera apertura y la pantalla del catálogo
- Touches: `herramienta/src/catalogo/`, `herramienta/proceso/ejemplos.json`, `herramienta/src/main.js`, `herramienta/public/index.html` (pasa a ser el catálogo) con su JS, `herramienta/docs/formato-datos.md`, `herramienta/README.md` y `herramienta/tests/u4-catalogo/`
- Tests: unas 33 pruebas con `node --test` (nombre, servicio con fallos a medias, ejemplos, rutas, lógica de pantalla e integración de punta a punta)

## Contexto

Unidad U4 de `inception/units-generation/unit-of-work.md` (Bolt B4 de `inception/delivery-planning/bolt-plan.md`). Cubre FR1 (salvo el cálculo de FR1.2, que es de U3), FR6.2, FR6.3 y NFR3. Sigue ADR-006 (los ejemplos solo en la primera apertura) y la respuesta Q4 de Units Generation: si falla la segunda escritura de una operación compuesta, se deshace la primera y todo queda como estaba (resuelve R-01 del diseño). Usa lo que dejaron U1 (almacén, registro de rutas, CSP), U2 (definición) y U3 (el servicio `recorridos` y el proveedor `nombreDe`). Tecnología: Node.js 20 o superior, JavaScript con módulos ES, sin dependencias; pantalla en HTML, CSS y JavaScript del navegador sin framework.

## Decisiones

- **Un archivo para el catálogo.** `datos/catalogo/productos.json` guarda `{ version: 1, productos: [ { idProducto, nombre, creadoEn, actualizadoEn } ] }`. No guarda el paso actual: se pide a U3 cada vez (`unit-of-work.md`).
- **Marca de primera apertura.** `datos/catalogo/primera-apertura.json` (`{ version: 1, ejemplosCargadosEn }`) se escribe al terminar la carga de los ejemplos (ADR-006). Se cargan solo si no existe ni la marca ni `productos.json`. Si existe el catálogo pero no la marca (por ejemplo, tras una caída), no se cargan y solo se escribe la marca. Un catálogo vaciado a propósito no vuelve a cargarlos (FR6.3).
- **Ids de producto.** `p-` seguido de 12 caracteres hexadecimales aleatorios, que cumple la regla de U3 (letras, números, `-` y `_`, hasta 64).
- **Nombre.** Obligatorio, sin espacios a los lados, no vacío ni solo espacios, de hasta 100 caracteres, al crear y al renombrar (FR1.3, FR1.4). Dos productos pueden llamarse igual, porque los requisitos no lo prohíben.
- **Operaciones compuestas con deshacer (Q4).**
  - **Crear:** `recorridos.crear(id)` y después guardar `productos.json`. Si falla lo segundo, `recorridos.deshacerCreacion(...)`.
  - **Borrar:** `recorridos.borrar(id)` (aparta) y después guardar `productos.json`. Si falla lo segundo, `recorridos.recuperarBorrado(marca)`; si va bien, `recorridos.confirmarBorrado(marca)`.
  - **Cargar ejemplos:** sembrar los tres recorridos, guardar `productos.json` y por último la marca. Si algo falla, se deshacen los recorridos ya sembrados y se restaura `productos.json` con el contenido anterior que devuelve `guardar`.
  - Si el propio deshacer falla, el error se registra en la consola junto al original y se devuelve el original. Es el riesgo aceptado de R-02: lo apartado sigue en `.apartado/` y U1 avisa al arrancar.
  - Las operaciones del catálogo se hacen de una en una, para que dos peticiones seguidas no se pisen.
- **Ejemplos.** `herramienta/proceso/ejemplos.json` tiene los tres productos ficticios en el formato de `recorridos.sembrar`, con los ids reales de campos y elementos de la definición de U2:
  - uno sin empezar;
  - uno a medias: pasos 1 a 3 en Completo con contenido y el 4 en En curso;
  - uno con los 10 pasos en Completo y contenido en cada uno, con enlaces en los pasos visuales, porque la siembra no admite adjuntos.

  Respetan la habilitación en cadena (hallazgo R-04 del diseño).
- **API local.**
  - `GET /api/productos`: lista con nombre y paso actual, en orden de creación.
  - `POST /api/productos` con `{ nombre }`: responde 201.
  - `GET /api/productos/:id`.
  - `PUT /api/productos/:id` con `{ nombre }`.
  - `DELETE /api/productos/:id`.

  Un nombre no válido responde 400, un producto inexistente 404, y los errores van en español.
- **Nombre en las pantallas de U3.** En `main.js`, `nombreDe` pasa a consultar el catálogo, que reemplaza a `nombreDeProductoPorDefecto`. Los ejemplos se cargan en `arrancar()` antes de iniciar el servidor.
- **Pantalla del catálogo en `/`.**
  - `public/index.html`, la página provisional de U1, pasa a ser el catálogo, con `public/js/catalogo.js` y `public/js/logica-catalogo.js` (lógica pura) y los estilos de U3.
  - Muestra cada producto con su nombre y su paso actual en texto, y un enlace a su recorrido (`recorrido.html?producto=<id>`). Así se llega al contenido de un paso en dos acciones (NFR3).
  - Con el catálogo vacío, un mensaje y el botón de crear (FR1.7).
  - El formulario de nuevo producto conserva lo escrito si el nombre no es válido (AC1.3).
  - Se puede renombrar.
  - Borrar abre un diálogo nativo `<dialog>` que nombra el producto y permite cancelar (FR1.5, AC1.4); no se usa `window.confirm`.
  - Controles nativos con etiquetas, `data-testid` y todo en español (NFR2, NFR4).

## Pasos

### Paso 1. Estructura
- [x] Crear `src/catalogo/` (`nombre.js`, `servicio.js`, `ejemplos.js`, `rutas.js`, `index.js`) y añadir `ErrorCatalogo` (código, mensaje en español, estado HTTP sugerido) a `src/base/errores.js` sin cambiar lo existente.
- Traza: FR1.

### Paso 2. Ejecutor de pruebas listo
- [x] Crear `tests/u4-catalogo/` con una prueba de humo y comprobar `node --test tests/u4-catalogo/*.test.js` desde `herramienta/`.
- [x] Añadir `tests/ayudas/catalogo.js`, que arranca la aplicación con una carpeta temporal y permite envolver el almacén para provocar fallos en una escritura concreta.
- Traza: NFR5.

### Paso 3. Producto y nombre (modelo de datos): implementar
- [x] `nombre.js`: `validarNombre(texto)` (devuelve el nombre recortado o lanza `ErrorCatalogo` 400 con "El nombre es obligatorio" o "El nombre no puede tener más de 100 caracteres") y `nuevoIdProducto()`.
- [x] Forma de `productos.json` y de la marca de primera apertura, con lectura que acepta que no existan.
- Traza: FR1.3, FR1.4.

### Paso 4. Producto y nombre: escribir y ejecutar sus pruebas
- [x] Un nombre normal se acepta y se recortan los espacios de los lados.
- [x] Un nombre vacío o solo con espacios se rechaza con "El nombre es obligatorio" (AC1.3).
- [x] Un nombre de más de 100 caracteres se rechaza.
- [x] Un nombre con comillas, acentos y caracteres especiales se conserva igual.
- [x] `nuevoIdProducto()` cumple la regla de ids de U3 y no repite en 1000 llamadas.
- [x] Ejecutar `node --test tests/u4-catalogo/nombre.test.js`.

### Paso 5. Servicio del catálogo (acceso a datos y lógica de negocio): implementar
- [x] `servicio.js` con `crearServicioCatalogo({ almacen, recorridos, registro })`:
  - `listar()`, con el paso actual de cada producto pedido a `recorridos.pasoActual` (FR1.1, FR1.2 mostrado).
  - `obtener(id)`, `crear(nombre)`, `renombrar(id, nombre)`, `borrar(id)` y `nombreDe(id)`.
  - Crear y borrar siguen las operaciones compuestas con deshacer de la sección Decisiones (Q4).
  - Las operaciones se hacen de una en una.
- Traza: FR1.1, FR1.3, FR1.4, FR1.5, Q4.

### Paso 6. Servicio: escribir y ejecutar sus pruebas
- [x] Crear tres productos y listarlos devuelve los tres con su nombre y su paso actual, "Hipótesis" para uno nuevo (AC1.1).
- [x] Un producto con los pasos 1 a 3 en Completo y el 4 en En curso aparece con paso actual "Mapa de piezas" (AC1.2).
- [x] Renombrar cambia el nombre y `nombreDe` lo devuelve; renombrar uno inexistente da 404.
- [x] Borrar quita el producto y su recorrido, y un nuevo servicio sobre la misma carpeta ya no lo ve.
- [x] Si falla el guardado de `productos.json` al crear, el recorrido creado se deshace y no queda ni producto ni recorrido.
- [x] Si falla el guardado de `productos.json` al borrar, el recorrido se recupera y el producto sigue completo, con su contenido.
- [x] Si además falla el deshacer, se devuelve el error original y los dos errores quedan en la consola.
- [x] Ejecutar `node --test tests/u4-catalogo/servicio.test.js`.

### Paso 7. Datos de ejemplo de la primera apertura (lógica de negocio): implementar
- [x] Escribir `herramienta/proceso/ejemplos.json` con los tres productos ficticios de la sección Decisiones, usando los ids reales de `herramienta/proceso/definicion-proceso.json`.
- [x] `ejemplos.js`: `cargarEjemplosSiPrimeraApertura({ almacen, recorridos, catalogo, rutaEjemplos })` con la regla de la marca de primera apertura y el deshacer completo si algo falla (FR6.2, FR6.3, ADR-006).
- Traza: FR6.2, FR6.3, R-04 del diseño.

### Paso 8. Ejemplos: escribir y ejecutar sus pruebas
- [x] Con la carpeta de datos vacía, se cargan tres productos en distintos puntos del recorrido: uno sin empezar, uno con paso actual "Mapa de piezas" y uno "Completo" (AC6.2).
- [x] Al volver a arrancar no se cargan otra vez; si se borró un ejemplo, no vuelve (AC6.3).
- [x] Con un catálogo vaciado a propósito, no se vuelven a cargar.
- [x] Con productos guardados pero sin la marca, no se cargan, no se toca lo existente y se escribe la marca.
- [x] Si falla la escritura de la marca, se deshacen los recorridos sembrados y `productos.json` queda como estaba.
- [x] `ejemplos.json` pasa la validación de `recorridos.sembrar` (sin pasos incoherentes ni adjuntos).
- [x] Ejecutar `node --test tests/u4-catalogo/ejemplos.test.js`.

### Paso 9. API del catálogo: implementar
- [x] `rutas.js` con `registrarRutasCatalogo(rutas, { catalogo })`: las rutas de la sección Decisiones, con 400 y 404 en JSON y mensajes en español.
- [x] En `src/main.js`, crear el servicio del catálogo, cargar los ejemplos si es la primera apertura antes de iniciar el servidor, registrar sus rutas, pasar `catalogo.nombreDe` como `nombreDe` a las rutas de U3 y devolver `catalogo` entre las piezas de `arrancar()`.
- Traza: FR1, FR6.2, R-01.

### Paso 10. API: escribir y ejecutar sus pruebas
- [x] `GET /api/productos` devuelve los productos con nombre y paso actual; con el catálogo vacío devuelve una lista vacía.
- [x] `POST /api/productos` con un nombre válido responde 201 y el producto tiene su recorrido; con un nombre vacío responde 400 con "El nombre es obligatorio".
- [x] `PUT /api/productos/:id` renombra y `DELETE /api/productos/:id` borra; con un id inexistente, 404.
- [x] Tras crear un producto, `GET /api/recorridos/:id` (de U3) devuelve su nombre gracias a `nombreDe`.
- [x] Un `POST` con `Origin` ajeno responde 403 (la protección de U1 también cubre U4).
- [x] Ejecutar `node --test tests/u4-catalogo/rutas.test.js`.

### Paso 11. Pantalla del catálogo (comportamiento de pantallas): implementar
- [x] `public/js/logica-catalogo.js` (puro, sin DOM): texto del paso actual, mensaje de catálogo vacío, texto de confirmación de borrado con el nombre del producto, enlace al recorrido y comprobación del nombre antes de enviar.
- [x] `public/index.html` y `public/js/catalogo.js`:
  - la lista de productos con nombre, paso actual en texto y enlace al recorrido;
  - el mensaje y el botón de crear cuando no hay productos;
  - el formulario de nuevo producto, que conserva lo escrito si hay error;
  - renombrar;
  - borrar con un `<dialog>` que nombra el producto y permite cancelar.

  Todo en español, con etiquetas, foco visible, `data-testid` y sin JavaScript en línea.
- Traza: FR1.1, FR1.3 a FR1.7, NFR2, NFR3, NFR4.

### Paso 12. Pantalla: escribir y ejecutar sus pruebas
- [x] El texto del paso actual es el nombre del paso, o "Completo".
- [x] El texto de confirmación de borrado nombra el producto (FR1.5).
- [x] El enlace al recorrido de un producto es `recorrido.html?producto=<id>` con el id codificado.
- [x] La comprobación del nombre en pantalla rechaza vacío o solo espacios, igual que el servidor.
- [x] `/` se sirve en español, carga su JavaScript y su CSS desde archivos, no tiene `<script>` en línea, cada control tiene etiqueta y el borrado usa `<dialog>` en lugar de `window.confirm`.
- [x] Ejecutar `node --test tests/u4-catalogo/pantalla.test.js`.

### Paso 13. Integración de punta a punta
- [x] Contra la API: crear un producto ficticio, llevarlo por los 10 pasos guardando contenido y marcando cada uno Completo con las rutas de U3, y comprobar que el catálogo lo muestra como "Completo" (AC2.2, criterio de éxito E1); por el camino, el catálogo muestra en cada momento el paso actual correcto (E3) y cada paso conserva lo creado en él (E4).
- [x] Primera apertura real: arrancar con una carpeta vacía muestra los tres ejemplos en el catálogo; borrar uno, reiniciar y comprobar que no vuelve (AC6.2, AC6.3).
- [x] Ejecutar `node --test tests/u4-catalogo/integracion.test.js` y comprobar que las pruebas de U1, U2 y U3 siguen pasando con `npm test`.

### Paso 14. Documentación y trazabilidad
- [x] Completar en `herramienta/docs/formato-datos.md` la sección de U4: `productos.json`, la marca de primera apertura y `proceso/ejemplos.json`.
- [x] Actualizar `herramienta/README.md`: el catálogo en `/`, cómo volver a ver los ejemplos (borrar la carpeta de datos), el comando de pruebas de U4 y el recorrido de uso completo.
- [x] Ejecutar todas las pruebas de la unidad con `node --test tests/u4-catalogo/*.test.js` y la comprobación completa con `npm test`.

## Trazabilidad

| Requisito u origen | Pasos |
|---|---|
| FR1 Catálogo de productos | 5, 6, 9, 10, 11, 13 |
| FR1.1 Catálogo con nombre y paso actual | 5, 6, 10, 11, 12 |
| FR1.3 Crear con nombre obligatorio | 3, 4, 5, 10, 11, 12 |
| FR1.4 Renombrar | 3, 5, 6, 10, 11 |
| FR1.5 Borrar con confirmación | 5, 6, 10, 11, 12 |
| FR1.6 Abrir el recorrido desde el catálogo | 11, 12 |
| FR1.7 Catálogo vacío | 10, 11, 12 |
| FR6.2 Tres productos ficticios la primera vez | 7, 8, 13 |
| FR6.3 Los ejemplos no sobrescriben datos | 7, 8, 13 |
| NFR3 Navegación en dos acciones | 11, 13 |
| NFR2, NFR4 Idioma y accesibilidad de la pantalla del catálogo | 11, 12 |
| NFR5 Pruebas | 2, 4, 6, 8, 10, 12, 13 |
| Q4 de Units Generation: deshacer la primera escritura | 5, 6, 7, 8 |
| E1, E3, E4 Criterios de éxito | 13 |

## Fuera de esta unidad

El cálculo del paso actual, los estados, el contenido de los pasos y las pantallas de recorrido, paso y registros son de U3. El guardado completo o nulo y el servidor son de U1. La definición del proceso es de U2.

## Testing Contract

```json
{
  "version": 1,
  "methodology": "test-after",
  "source": "org",
  "ordering": "implement each applicable testable layer, then write and run that layer's tests.",
  "scope": "express",
  "test_strategy": "standard",
  "project_type": "greenfield",
  "applicable_notes": [
    {
      "layer": "org",
      "text": "We treat tests as a first-class deliverable in every Bolt. The specific\nmethodology (TDD, BDD, ATDD, or classic test-after) is affirmed at\npractices-discovery and recorded in `team.md` under this heading with explicit\n`Methodology` and `Ordering` fields; Code Generation resolves those fields\nindependently from coverage, tooling, and scope notes.\n\nWhen no posture has been affirmed, our default per scope is:\n- **Methodology**: test-after\n- **Ordering**: implement each applicable testable layer, then write and run\n  that layer's tests.\n- `mvp`, `enterprise`, `feature`, `infra`, `classic` add an 80% line-coverage\n  floor and CI execution before merge.\n- `bugfix`, `security-patch` add a targeted regression for the specific\n  bug/vulnerability and require the existing suite to remain green.\n- `express` uses the Minimal strategy: requirement-driven unit tests (one per\n  requirement, with a happy-path floor per component); existing tests remain\n  green.\n- `poc`, `refactor`, `workshop` add no extra new-test floor and require the\n  existing suite to remain green.\n\nThe active `Test Strategy` still applies in every scope and determines test\nvolume/types. Scope floors are additive; they never reduce or replace the\nselected strategy.\n\nBuild and Test verifies defined coverage floors and affirmed quality targets;\nthey may not be weakened to make a step pass.\n\nAffirm a stricter posture in `team.md` if the team commits to one."
    }
  ],
  "obligations": {
    "strategy": "standard",
    "strategy_volume": [
      "Five to eight tests per component.",
      "Unit tests plus integration tests for key boundaries.",
      "Add E2E, performance, or security tests when requirements demand them."
    ],
    "scope_floor": [
      "Keep the existing test suite green.",
      "This scope adds no extra new-test floor beyond the selected test strategy."
    ],
    "combination_rule": "Apply every selected-strategy obligation and every scope-floor obligation; neither replaces the other, and a targeted scope regression may add the narrowest necessary test type beyond the strategy default."
  },
  "plan_profile": {
    "methodology": "test-after",
    "runner_step": "Bootstrap the minimal test runner/configuration and record the exact unit-scoped command.",
    "runner_ready_before_first_test": true,
    "testable_layers": [
      "Data model / database behavior",
      "Repository / data access",
      "Business logic",
      "API / endpoint",
      "Frontend behavior"
    ],
    "steps": [
      "Project structure and production configuration skeleton.",
      "Bootstrap the minimal test runner/configuration and record the exact unit-scoped command.",
      "Data model / database behavior - implement.",
      "Data model / database behavior - write and run its tests after implementation.",
      "Repository / data access - implement.",
      "Repository / data access - write and run its tests after implementation.",
      "Business logic - implement.",
      "Business logic - write and run its tests after implementation.",
      "API / endpoint - implement.",
      "API / endpoint - write and run its tests after implementation.",
      "Frontend behavior - implement.",
      "Frontend behavior - write and run its tests after implementation.",
      "Environment/build configuration.",
      "Documentation and traceability."
    ]
  },
  "input_sha256": "sha256:7eda6dbebc7eba01e8858d8911833c06e2bca18cdf76aeaf6f15de08f0d63baa",
  "contract_sha256": "sha256:aee7bb02f8205912a3ecda3439fd589eea1b0cfac342d3618186cb636cbed02a"
}
```

Orden de capas adaptado: el servicio (Pasos 5 y 6) une acceso a datos y lógica de negocio porque las operaciones compuestas son las dos cosas a la vez; los ejemplos (Pasos 7 y 8) son lógica de negocio que usa el servicio. Cada capa se implementa y luego se prueba, como pide el contrato. No hay configuración de entorno nueva: U4 no añade variables.
