# Instrucciones de construcción: herramienta de producto

## Requisitos previos

- Node.js 20 o superior (verificado con Node 22.17.1).
- Nada más: la herramienta no tiene dependencias de terceros, así que no hay que instalar paquetes.

## Instalación de dependencias

No hace falta. `herramienta/package.json` no declara dependencias; `npm install` no es necesario.

## Configuración del entorno

Variables opcionales (ver `herramienta/src/base/config.js`):

| Variable | Qué hace | Valor por defecto |
|---|---|---|
| `PUERTO` | Puerto de escucha, de 0 a 65535 (0 = uno libre) | `3210` |
| `HERRAMIENTA_DATOS` | Carpeta de datos | `herramienta/datos/` (ignorada por git) |

El servidor escucha siempre en `127.0.0.1`, solo en el propio equipo. No hay secretos ni credenciales.

## Construcción

No hay paso de compilación ni empaquetado: el servidor es JavaScript con módulos ES que Node ejecuta directamente, y la pantalla es HTML, CSS y JavaScript del navegador servido tal cual desde `herramienta/public/`.

## Verificación de la construcción

Desde la raíz del repositorio:

```
node --check herramienta/src/main.js
```

Para comprobar la sintaxis de todos los archivos JavaScript (30 en total), desde `herramienta/`:

```
for f in $(find src public/js -name '*.js'); do node --check "$f"; done
```

Arranque real, con una carpeta de datos de prueba para no tocar `datos/`:

```
cd herramienta
PUERTO=3299 HERRAMIENTA_DATOS=/tmp/herramienta-prueba node src/main.js
```

Debe imprimir "La herramienta está en marcha en http://127.0.0.1:3299" y, en la primera apertura, que se han cargado 3 productos de ejemplo.

## Problemas habituales

- **"La variable PUERTO debe ser un número…"**: `PUERTO` tiene un valor no numérico o mayor de 65535.
- **El puerto ya está en uso**: otra instancia está abierta; ciérrala o usa otro `PUERTO`.
- **La herramienta no arranca y nombra la definición del proceso**: `herramienta/proceso/definicion-proceso.json` está dañado o incompleto; el mensaje dice qué falta.
- **El catálogo aparece vacío en la primera apertura**: la carga de ejemplos falló y se deshizo; el motivo está en la consola. Se reintenta en el siguiente arranque.
- **Aviso de elementos apartados al arrancar**: quedó algo en `.apartado/` tras un fallo a medias; el aviso dice qué carpeta revisar.
