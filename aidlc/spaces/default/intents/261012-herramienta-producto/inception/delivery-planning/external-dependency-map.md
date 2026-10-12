# Dependencias externas

Un **Bolt** es una pasada de construcción sobre una parte del trabajo que termina en algo que funciona y se puede probar. Este documento recoge lo que está fuera de este trabajo y podría frenar algún Bolt de `bolt-plan.md`.

## Resultado

No hay dependencias externas que bloqueen ningún Bolt. La herramienta es una aplicación web local, sin despliegue, sin autenticación y sin integraciones externas (restricciones de `inception/requirements-analysis/requirements.md`). No depende de APIs de terceros, de datos de otros equipos ni de aprobaciones externas.

## Entradas que ya están en el proyecto

| Entrada | Dueño | Bolt que la usa | Si no está |
|---|---|---|---|
| Plantillas del proceso (`docs/proceso-producto/plantillas/`) | Tú | B2 · Definición del proceso | Ya existen; si una plantilla cambia antes de B2, la definición se escribe con la versión vigente |
| Descripción del proceso (`docs/proceso-producto/LEEME.md`) | Tú | B2 y B3 | Ya existe; es la referencia de los términos del proceso |
| Herramientas de desarrollo en el equipo (entorno de ejecución y gestor de paquetes de la tecnología que se elija) | Tú | B1 · Base común | Se instalan al empezar B1; no hay plazos de terceros |
