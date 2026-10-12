// Ayudas para las pruebas de U4 · Catálogo.
//
// - arrancarAplicacion(t): arranca la herramienta en 127.0.0.1 con el puerto 0
//   y una carpeta de datos temporal (o la indicada), y la detiene al terminar.
//   En una carpeta vacía, el arranque carga los tres productos de ejemplo.
// - envolverAlmacen(almacen): devuelve un almacén que funciona igual que el
//   real, pero que puede fallar a propósito en una operación concreta sobre una
//   ruta concreta (por ejemplo, guardar "catalogo/productos.json"), para probar
//   qué pasa cuando una operación compuesta falla a medias.
// - crearPiezas(t): el almacén real sobre una carpeta temporal, el servicio
//   del recorrido (U3) y el del catálogo (U4) sin servidor, cada uno con su
//   almacén envuelto (fallosCatalogo y fallosRecorridos) para provocar fallos.
//
// Ninguna prueba toca herramienta/datos/.

import { crearAdjuntos } from "../../src/base/adjuntos.js";
import { crearAlmacen } from "../../src/base/almacen.js";
import { ErrorAlmacen } from "../../src/base/errores.js";
import { crearServicioCatalogo } from "../../src/catalogo/index.js";
import { arrancar } from "../../src/main.js";
import { crearServicioRecorrido } from "../../src/recorrido/index.js";
import { crearCarpetaTemporal } from "./carpeta-temporal.js";
import { cargarDefinicionReal } from "./recorrido.js";
import { crearRegistroDePrueba } from "./registro.js";

/**
 * Crea el catálogo y el recorrido sobre una carpeta de datos temporal (o la
 * indicada), sin servidor.
 * @param {import("node:test").TestContext} t
 * @param {{ carpetaDatos?: string }} [opciones]
 */
export async function crearPiezas(t, { carpetaDatos } = {}) {
  const carpeta = carpetaDatos ?? (await crearCarpetaTemporal(t, "herramienta-u4-servicio-"));
  const almacen = crearAlmacen(carpeta);
  const fallosCatalogo = envolverAlmacen(almacen);
  const fallosRecorridos = envolverAlmacen(almacen);
  const registro = crearRegistroDePrueba();
  const definicion = await cargarDefinicionReal();
  const recorridos = crearServicioRecorrido({ almacen: fallosRecorridos.almacen, adjuntos: crearAdjuntos(fallosRecorridos.almacen), definicion, registro });
  const catalogo = crearServicioCatalogo({ almacen: fallosCatalogo.almacen, recorridos, registro });
  return { carpetaDatos: carpeta, almacen, fallosCatalogo, fallosRecorridos, recorridos, catalogo, registro, definicion };
}

/**
 * @param {import("node:test").TestContext} t
 * @param {{ carpetaDatos?: string, detenerAlTerminar?: boolean }} [opciones]
 */
export async function arrancarAplicacion(t, { carpetaDatos, detenerAlTerminar = true } = {}) {
  const carpeta = carpetaDatos ?? (await crearCarpetaTemporal(t, "herramienta-u4-"));
  const registro = crearRegistroDePrueba();
  const aplicacion = await arrancar({ entorno: { HERRAMIENTA_DATOS: carpeta, PUERTO: "0" }, registro });
  if (detenerAlTerminar) t.after(() => aplicacion.detener());
  return { aplicacion, carpetaDatos: carpeta, registro };
}

const OPERACIONES = ["guardar", "borrar", "restaurar", "apartar", "recuperar", "descartar"];

/**
 * Envuelve un almacén real. Con fallarEn(operacion, ruta) la siguiente llamada
 * (o todas, con { siempre: true }) a esa operación sobre esa ruta lanza
 * ErrorAlmacen sin tocar nada. La ruta puede ser un texto exacto o una
 * expresión regular; para recuperar y descartar se compara con la marca.
 * @param {ReturnType<import("../../src/base/almacen.js").crearAlmacen>} almacen
 */
export function envolverAlmacen(almacen) {
  const fallos = [];
  const provocados = [];

  function comprobar(operacion, ruta) {
    const indice = fallos.findIndex((f) => f.operacion === operacion && coincide(f.ruta, ruta));
    if (indice === -1) return;
    const fallo = fallos[indice];
    if (!fallo.siempre) fallos.splice(indice, 1);
    provocados.push({ operacion, ruta });
    throw new ErrorAlmacen("FALLO_PROVOCADO", `Fallo provocado en la prueba al ${operacion} "${ruta}".`);
  }

  const envuelto = { ...almacen };
  for (const operacion of OPERACIONES) {
    envuelto[operacion] = async (ruta, ...resto) => {
      comprobar(operacion, ruta);
      return almacen[operacion](ruta, ...resto);
    };
  }

  return {
    almacen: Object.freeze(envuelto),
    /** Hace fallar la próxima llamada (o todas) a `operacion` sobre `ruta`. */
    fallarEn(operacion, ruta, { siempre = false } = {}) {
      if (!OPERACIONES.includes(operacion)) throw new Error(`Operación desconocida: ${operacion}`);
      fallos.push({ operacion, ruta, siempre });
    },
    /** Quita todos los fallos pendientes. */
    dejarDeFallar() {
      fallos.length = 0;
    },
    /** Fallos que ya se han provocado ({ operacion, ruta }), en orden. */
    provocados,
  };
}

function coincide(patron, ruta) {
  return patron instanceof RegExp ? patron.test(String(ruta)) : patron === ruta;
}
