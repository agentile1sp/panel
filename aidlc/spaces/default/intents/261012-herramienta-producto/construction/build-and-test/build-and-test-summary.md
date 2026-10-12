# Resumen de construcción y pruebas

## Estado general

- **Construcción:** correcta. No hay compilación ni dependencias; los 30 archivos JavaScript pasan `node --check` y la herramienta arranca de verdad con una carpeta de datos temporal.
- **Pruebas:** 110 de 110 pasan (u1 24, u2 20, u3 35, u4 31), sin omitidas. Cobertura informativa: 96,6 % de líneas y 89,5 % de ramas.
- **Requisito previo:** Node.js 20 o superior.

## Tipos de prueba generados

| Tipo | Documento | Estado |
|---|---|---|
| Unitarias por unidad | `construction/<unidad>/code-generation/unit-test-instructions.md` | Ejecutadas, en verde |
| Integración entre unidades | `integration-test-instructions.md` | Ejecutadas, en verde |
| Humo contra la aplicación arrancada | `integration-test-instructions.md`, `test-results.md` | Ejecutada, correcta |
| Rendimiento | `performance-test-instructions.md` | No aplica: no hay objetivos de rendimiento |
| Seguridad | `security-test-instructions.md` | Protecciones locales cubiertas por las pruebas automáticas |

## Cobertura esperada por unidad

La estrategia estándar no fija un porcentaje. El objetivo es que cada responsabilidad de cada unidad tenga al menos una prueba que falle si se rompe, con las cantidades por componente aprobadas en sus instrucciones de pruebas. Se cumple en las cuatro unidades.

## Target Verification Matrix

| Target ID | Source | Expected | Actual | Evidence | Owning Stage | Verdict |
|---|---|---|---|---|---|---|
| TC-SUITE-VERDE | Testing Contract de u1 a u4, `obligations.scope_floor` | El conjunto de pruebas existente sigue en verde | 110 de 110 pasan | `npm test` | build-and-test | Met |
| TC-U1-VOLUMEN | Instrucciones de pruebas aprobadas de u1-base | Pruebas aprobadas por componente en verde | 24 de 24, cantidades iguales | `node --test tests/u1-base/*.test.js` | build-and-test | Met |
| TC-U2-VOLUMEN | Instrucciones de pruebas aprobadas de u2-definicion-proceso | Pruebas aprobadas por componente en verde | 20 de 20; una más de las previstas en validación | `node --test tests/u2-definicion-proceso/*.test.js` | build-and-test | Met |
| TC-U3-VOLUMEN | Instrucciones de pruebas aprobadas de u3-recorrido | Pruebas aprobadas por componente en verde | 35 de 35, cantidades iguales | `node --test tests/u3-recorrido/*.test.js` | build-and-test | Met |
| TC-U4-VOLUMEN | Instrucciones de pruebas aprobadas de u4-catalogo | Pruebas aprobadas por componente en verde | 31 de 31, cantidades iguales | `node --test tests/u4-catalogo/*.test.js` | build-and-test | Met |
| TC-INTEGRACION | Testing Contract, `obligations.strategy_volume` | Integración en cada frontera clave entre unidades | 6 fronteras con prueba, en verde | `integration-test-instructions.md`, `npm test` | build-and-test | Met |

## Preparación

- **Lista para construir:** sí.
- **Lista para probar:** sí, todo en verde.
- **Lista para desplegar:** no aplica. Es una herramienta local que se arranca con `npm start` desde `herramienta/`, y este flujo no tiene etapas de operación.

## Limitaciones y pendientes

- **Trazabilidad:** NFR5 (Pruebas) no tiene entrada en ningún `traceability.json`, aunque se cumple de hecho. Ver `cross-unit-traceability.md`.
- **Pantallas sin probar en un navegador real:** se probaron la lógica pura de pantalla y el HTML servido, pero no la interacción. Conviene una pasada manual con una carpeta de datos vacía:
  - los tres ejemplos aparecen;
  - crear con el nombre vacío (se conserva lo escrito);
  - renombrar;
  - abrir y cancelar el borrado, y luego borrar;
  - abrir un paso en dos acciones (NFR3);
  - añadir y quitar elementos y subir un adjunto (U3).
- **Observaciones menores del revisor en u4, abiertas y no bloqueantes:**
  - un corte brusco del proceso entre sembrar o crear un recorrido y guardar el catálogo deja carpetas sueltas en `recorridos/` sin aviso;
  - si falla la carga de ejemplos, el catálogo sale vacío y el motivo solo aparece en la consola;
  - un `productos.json` sin marca de primera apertura impide cargar los ejemplos sin avisar.
