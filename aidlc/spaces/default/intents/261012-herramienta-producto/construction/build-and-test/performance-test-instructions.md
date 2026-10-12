# Instrucciones de pruebas de rendimiento

## No aplica en esta versión

- La estrategia de pruebas es la estándar, que no pide pruebas de rendimiento.
- Los requisitos (`inception/requirements-analysis/requirements.md`) no tienen ningún objetivo medible de rendimiento: ni latencia, ni volumen, ni concurrencia. NFR1 a NFR5 tratan de integridad, idioma, navegación, accesibilidad y pruebas.
- Es una herramienta personal y local (un solo usuario en `127.0.0.1`), con un puñado de productos guardados en archivos legibles.

## Referencia informativa

El conjunto completo de 110 pruebas, que arranca la aplicación real varias veces, termina en unos 1,3 s con Node 22.17.1. No es un objetivo, solo una línea de base por si en el futuro se añade un requisito de rendimiento.

## Si se añade un requisito de rendimiento

Definir el objetivo medible en los requisitos (por ejemplo, tiempo de carga del catálogo con N productos) y añadir aquí la prueba con su comando, en lugar de un número sin contexto.
