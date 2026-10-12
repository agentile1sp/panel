# Resumen del código: U2 · Definición del proceso (`u2-definicion-proceso`)

## Archivos creados o modificados

| Archivo | Contenido |
|---|---|
| `herramienta/proceso/definicion-proceso.json` | Los 10 pasos (ids estables, orden, tipo, orígenes, plantilla, campos, tipos de elemento, checklist) y los 2 registros transversales, escritos a mano desde `docs/proceso-producto/plantillas/` |
| `herramienta/src/definicion/cargar.js` | Lee el archivo directamente (sin el almacén de U1) y lanza `ErrorDefinicion` si falta, no se puede leer o el JSON está dañado |
| `herramienta/src/definicion/validar.js` | Valida la forma completa y junta todos los problemas en un único error que nombra el archivo y cada problema |
| `herramienta/src/definicion/definicion.js` | Objeto congelado en profundidad con `pasos()`, `paso(id)`, `registros()`, `registro(id)`, `origenesDirectos(id)` y `origenesTodos(id)` |
| `herramienta/src/definicion/index.js` | Punto de entrada público, con tipos JSDoc para U3 |
| `herramienta/src/main.js` | Carga la definición al arrancar, antes de la carpeta de datos y el servidor; la devuelve como `definicion` |
| `herramienta/src/base/config.js` | `rutaDefinicion` (`HERRAMIENTA_DEFINICION`) y `carpetaPlantillas` |
| `herramienta/src/base/errores.js` | `ErrorDefinicion` con `codigo`, `archivo`, `problemas` y `causa` |
| `herramienta/docs/formato-datos.md` | Sección de U2: dónde vive la definición, su forma, los ids y que solo se lee |
| `herramienta/README.md` | Variable `HERRAMIENTA_DEFINICION`, estructura, comando de pruebas de U2 y nota para U3 |
| `herramienta/tests/ayudas/definicion-temporal.js` | Copias estropeadas de la definición en carpetas temporales |
| `herramienta/tests/u2-definicion-proceso/*.test.js` | 20 pruebas: humo 1, archivo 4, validar 8, consultas 5, arranque 2 |

## Decisiones clave de implementación

- **Tipos de elemento.** El paso 5 tiene `ficha-capacidad` y `ficha-instancia`; el paso 7 tiene `actividad`, `historia`, `fila-crud`, `fila-estados` y `fila-navegacion`; el paso 4 (piezas) y el 9 (non-goals y paquete de producto) también usan elementos.
- **Los registros transversales también tienen `elementos`.** El plan los describía con `campos`, pero su Paso 3 dice que las entradas de registro son tipos de elemento, y la plantilla de gaps y supuestos tiene dos tablas con columnas distintas: `acuerdos` tiene el elemento `acuerdo` y `gaps-y-supuestos` tiene `gap` y `supuesto`. U3 guarda cada entrada con su tipo de elemento.
- **Contenido repetido en pasos de texto y visuales.** Solo los estructurados tienen elementos, así que lo que se repite en los demás (riesgos del pre-mortem, tablas de pantallas de wireframes y mockups) son campos `lista` o `texto-largo` con una ayuda.
- **Validación más estricta que el plan.** Rechaza elementos fuera de los pasos estructurados y checklist o evidencia fuera de los visuales, exige ids en minúsculas con guiones y plantillas `.md` sin carpetas (evita `../`), y tolera la marca BOM de un archivo editado a mano.
- **Orígenes como ids.** `origenesDirectos` y `origenesTodos` devuelven ids en el orden del proceso.
- **Arranque.** Si la definición falla, la herramienta no arranca y el mensaje empieza por "No se pudo arrancar la herramienta: La definición del proceso ...".

## Pruebas

| Comando | Pruebas | Pasan | Fallan |
|---|---|---|---|
| `node --test herramienta/tests/u2-definicion-proceso/*.test.js` | 20 | 20 | 0 |
| `node --test herramienta/tests/u1-base/*.test.js` | 24 | 24 | 0 |
| `npm --prefix herramienta test` | 44 | 44 | 0 |

## Desviaciones del plan

- Los registros transversales usan `elementos` en lugar de solo `campos`, explicado arriba.
- `validar.test.js` tiene 8 pruebas en lugar de 7: se añadió el caso de éxito con la definición real. Total 20 en lugar de "unas 18".
- Reglas de validación añadidas, explicadas arriba.
