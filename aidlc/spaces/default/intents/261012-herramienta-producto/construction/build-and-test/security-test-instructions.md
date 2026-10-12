# Instrucciones de pruebas de seguridad

## Alcance

La estrategia estándar no pide pruebas de seguridad aparte, y los requisitos no fijan objetivos de seguridad medibles. Como la herramienta es un servidor local, se documentan las protecciones que ya existen y las pruebas automáticas que las cubren.

## Protecciones y sus pruebas

| Protección | Dónde | Prueba automática |
|---|---|---|
| El servidor solo escucha en `127.0.0.1` | `src/base/config.js`, `src/base/servidor.js` | `u1-base/servidor.test.js` |
| Control de origen: una escritura con `Origin` ajeno responde 403 | `src/base/servidor.js` | `u1-base/servidor.test.js`, `u3-recorrido/rutas.test.js`, `u4-catalogo/rutas.test.js` |
| Cuerpos JSON limitados (400, 413, 415) | `src/base/servidor.js` | `u1-base/servidor.test.js` |
| Nombres de adjuntos saneados, límite de tamaño y siempre dentro de la carpeta de datos | `src/base/adjuntos.js` | `u1-base/adjuntos.test.js` |
| Solo enlaces `http` o `https` en el contenido de los pasos | `src/recorrido/modelo.js` | `u3-recorrido/modelo.test.js` |
| Validación de entradas en la API (nombre, ids, contenido) | `src/catalogo/nombre.js`, `src/recorrido/modelo.js` | `u4-catalogo/nombre.test.js`, `u3-recorrido/rutas.test.js` |
| CSP `default-src 'self'; frame-ancestors 'none'`, sin JavaScript en línea, `X-Content-Type-Options: nosniff` | `src/base/servidor.js`, `public/*.html` | `u3-recorrido/pantallas.test.js`, `u4-catalogo/pantalla.test.js` |
| La pantalla no usa `innerHTML` con datos | `public/js/*.js` | Revisión de código de U4 (sin hallazgos) |

## Cómo ejecutarlas

Están dentro del conjunto completo, desde `herramienta/`:

```
npm test
```

Comprobación manual de cabeceras con la aplicación arrancada (ver `build-instructions.md`):

```
curl -sI http://127.0.0.1:3299/
```

## Dependencias

No hay dependencias de terceros, así que no hay nada que escanear contra bases de vulnerabilidades.

## Fuera de alcance

No hay autenticación porque la herramienta es personal y local (decisión de alcance de la versión). No se ha hecho análisis estático ni dinámico con herramientas externas.
