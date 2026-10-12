# Mapa de requisitos por unidad

Asigna cada requisito funcional de `inception/requirements-analysis/requirements.md` a la unidad que lo implementa (`unit-of-work.md`), siguiendo los componentes de `inception/domain-design/components.md`. No hay historias de usuario en este trabajo, así que las filas usan los IDs `FR`. Al final se añaden los `NFR` como referencia.

## Requisitos funcionales

| ID | Requisito (resumen) | Unit ID | Directory | Otras unidades que intervienen |
|---|---|---|---|---|
| FR1 | Catálogo de productos | U4 | u4-catalogo | — |
| FR1.1 | Catálogo con nombre y paso actual | U4 | u4-catalogo | U3 (paso actual) |
| FR1.2 | Cálculo del paso actual | U3 | u3-recorrido | U4 (lo muestra) |
| FR1.3 | Crear producto con nombre obligatorio | U4 | u4-catalogo | U3 (crea el recorrido) |
| FR1.4 | Renombrar producto | U4 | u4-catalogo | — |
| FR1.5 | Borrar producto con confirmación | U4 | u4-catalogo | U3 (borra el recorrido) |
| FR1.6 | Abrir el recorrido desde el catálogo | U4 | u4-catalogo | U3 |
| FR1.7 | Catálogo vacío | U4 | u4-catalogo | — |
| FR2 | Recorrido de un producto | U3 | u3-recorrido | — |
| FR2.1 | Los 10 pasos en orden con su estado | U3 | u3-recorrido | U2 (orden) |
| FR2.2 | Producto nuevo con todo en Pendiente | U3 | u3-recorrido | — |
| FR2.3 | Ver lo creado en un paso | U3 | u3-recorrido | — |
| FR2.4 | Acceso a los registros transversales | U3 | u3-recorrido | — |
| FR2.5 | Pasos habilitados y de qué dependen | U3 | u3-recorrido | U2 (orígenes) |
| FR3 | Estados y orden de los pasos | U3 | u3-recorrido | — |
| FR3.1 | Tres estados | U3 | u3-recorrido | — |
| FR3.2 | Cambio manual de estado | U3 | u3-recorrido | — |
| FR3.3 | Habilitación por pasos de origen (en cadena) | U3 | u3-recorrido | U2 (orígenes indirectos) |
| FR3.4 | Paso no habilitado: sin edición | U3 | u3-recorrido | — |
| FR3.5 | Bloqueo de dependientes sin perder contenido | U3 | u3-recorrido | — |
| FR4 | Contenido de cada paso | U3 | u3-recorrido | — |
| FR4.1 | Campos de la plantilla | U3 | u3-recorrido | U2 (campos) |
| FR4.2 | Pasos de texto | U3 | u3-recorrido | — |
| FR4.3 | Pasos estructurados con varios elementos | U3 | u3-recorrido | U2 (tipos de elemento) |
| FR4.4 | Pasos visuales con checklist y enlace o adjunto | U3 | u3-recorrido | U1 (adjuntos) |
| FR4.5 | Registros transversales | U3 | u3-recorrido | — |
| FR4.6 | Nada se copia ni calcula entre pasos | U3 | u3-recorrido | — |
| FR4.7 | Guardar sin marcar Completo | U3 | u3-recorrido | U1 |
| FR5 | Definición del proceso | U2 | u2-definicion-proceso | — |
| FR5.1 | Definición separada del código | U2 | u2-definicion-proceso | — |
| FR5.2 | Sin opción para cambiarla | U2 | u2-definicion-proceso | — |
| FR6 | Guardado y datos de ejemplo | U1 | u1-base | U4 |
| FR6.1 | Todo se conserva al cerrar y abrir | U1 | u1-base | U3, U4 |
| FR6.2 | Tres productos ficticios la primera vez | U4 | u4-catalogo | U3 (siembra) |
| FR6.3 | Los ejemplos no sobrescriben datos | U4 | u4-catalogo | — |

## Requisitos no funcionales (referencia)

| ID | Unit ID | Directory | Otras unidades |
|---|---|---|---|
| NFR1 | U1 | u1-base | U3, U4 (deshacer en operaciones compuestas) |
| NFR2 | U3 | u3-recorrido | U4 |
| NFR3 | U4 | u4-catalogo | U3 |
| NFR4 | U3 | u3-recorrido | U4 |
| NFR5 | U1 | u1-base | U2, U3, U4 (cada unidad prueba sus requisitos) |

## Requisitos que cruzan unidades

- **FR1.2 (paso actual):** U3 lo calcula y U4 lo muestra.
- **FR1.3, FR1.5 y FR6.2 (operaciones compuestas):** U4 coordina y U3 escribe el recorrido. Si falla la segunda escritura, se deshace la primera (Q4).
- **FR6.1 (guardado):** U1 escribe; U3 y U4 deciden qué se guarda.

## Orden de implementación dentro de cada unidad

- **U1:** guardado completo o nulo → lectura y borrado → deshacer → servidor local con origen restringido → adjuntos → documento del formato.
- **U2:** archivo de definición → lectura y validación → resolución de orígenes indirectos.
- **U3:** estados y habilitación en cadena → paso actual → contenido de los pasos de texto → pasos estructurados → pasos visuales y adjuntos → registros transversales → operaciones para U4 → pantallas.
- **U4:** crear, renombrar y borrar con deshacer → catálogo con paso actual → catálogo vacío → carga de ejemplos con marca de primera apertura → pantalla.

## Verificación de cobertura

- Los 35 IDs `FR` de `requirements.md` tienen unidad asignada.
- Todas las unidades tienen filas: U1 (FR6, FR6.1), U2 (FR5 a FR5.2), U3 (21 filas) y U4 (FR1 salvo FR1.2, FR6.2 y FR6.3).
