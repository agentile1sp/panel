# Resumen del código: U1 · Base común (`u1-base`)

## Archivos creados o modificados

| Archivo | Contenido |
|---|---|
| `herramienta/package.json` | Módulos ES, Node 20 o superior, sin dependencias; scripts `start` (`node src/main.js`) y `test` (`node --test tests/*/*.test.js`) |
| `herramienta/src/main.js` | Raíz de composición: crea la carpeta de datos, avisa de elementos apartados, registra `GET /api/estado` y arranca; si falla, sale con código 1 y mensaje claro |
| `herramienta/src/base/config.js` | Host fijo `127.0.0.1`, puerto `3210` (`PUERTO`), carpeta `herramienta/datos/` (`HERRAMIENTA_DATOS`) |
| `herramienta/src/base/errores.js` | `ErrorAlmacen`, `ErrorAdjunto`, `ErrorPeticion` y `ErrorArranque`, con código, mensaje en español y causa |
| `herramienta/src/base/almacen.js` | Escritura completa o nula (temporal, `fsync`, `rename`), lectura, listado, borrado, restaurar, apartar, recuperar, descartar y comprobación de rutas |
| `herramienta/src/base/adjuntos.js` | Saneado de nombres, guardado con límite de 10 MB y prefijo único, lectura para descarga |
| `herramienta/src/base/servidor.js` | Registro de rutas con parámetros, servidor `node:http`, control de Host, Origin y Sec-Fetch-Site, archivos estáticos, descargas y errores en JSON |
| `herramienta/public/index.html` | Página estática en español: "La herramienta está en marcha" |
| `herramienta/README.md` | Cómo arrancar, variables, seguridad, pruebas y puntos de enganche para U2, U3 y U4 |
| `herramienta/docs/formato-datos.md` | Formato de la carpeta de datos, con secciones con nombre para U2, U3 y U4 |
| `herramienta/tests/ayudas/*.js` | Carpetas temporales, consola falsa y peticiones HTTP crudas |
| `herramienta/tests/u1-base/*.test.js` | 24 pruebas: humo 1, almacén 7, adjuntos 5, servidor 8, arranque 3 |
| `.gitignore` | Añade `herramienta/datos/` |

## Decisiones clave de implementación

- **Raíz de composición (R-01).** `src/main.js` monta la aplicación; `servidor.js` no conoce a ninguna otra unidad. Los comentarios de `main.js` marcan dónde enganchan B2 (validación de la definición al arrancar), B3 y B4 (sus rutas).
- **Deshacer (R-02).** `guardar` y `borrar` devuelven el contenido anterior y `restaurar(ruta, null)` borra. `apartar` mueve a `.apartado/<marca>/` el contenido más un `apartado.json` con la ruta y la fecha; `recuperar` se niega si el destino ya existe.
- **Rutas seguras.** Ningún tramo de ruta puede empezar por punto (rechaza `../` y protege `.apartado` y los temporales); también se rechazan rutas absolutas, barras invertidas y caracteres de control, y se comprueba la ruta resuelta.
- **Archivo dañado.** Un JSON dañado no se sobrescribe: `guardar` falla con `ARCHIVO_DANADO` para no perder datos sin avisar.
- **Defensas contra peticiones de otras webs (R-03 de Domain Design).** Los cambios con cuerpo exigen `application/json` (o `application/octet-stream` en rutas binarias), se rechaza `Sec-Fetch-Site: cross-site` y todas las respuestas llevan `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer` y una política de contenido `default-src 'self'`. Consecuencia para U3 y U4: su JavaScript y su CSS van en archivos de `public/`, no en línea.
- **Errores.** `ErrorAlmacen` responde 500 y `ErrorAdjunto` 400, ambos registrados en la consola; un error inesperado responde 500 con mensaje genérico y su traza queda en la consola.

## Pruebas

`node --test herramienta/tests/u1-base/*.test.js` (o `node --test tests/u1-base/*.test.js` desde `herramienta/`): 24 pruebas, 24 pasan, 0 fallan, 0 se saltan, en Node 22.17.1. Cada componente tiene casos de éxito y al menos dos de error o de borde.

## Desviaciones del plan

- **Comando de pruebas.** El plan aprobado al principio usaba `node --test tests/u1-base/`, que no funciona desde Node 21 (no acepta carpetas). Se cambió a `*.test.js` en el plan, las instrucciones y `package.json`, y el plan corregido se volvió a aprobar.
- **Más pruebas por componente.** Almacén 7 (en lugar de 6) y servidor 8 (en lugar de 7): una más de `listar`, `existe` y `borrar`, y otra del cuerpo JSON (400, 413, 415). Total 24, como decía el plan.
- **Defensas extra de seguridad** y el error `ErrorPeticion` y `ErrorArranque`, no listados en el plan, descritos arriba.
- **Prueba de guardado fallido.** Usa una carpeta sin permiso de escritura; si se ejecuta como root, esa prueba se salta porque root ignora los permisos.
