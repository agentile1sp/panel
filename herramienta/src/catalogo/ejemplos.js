// Productos de ejemplo de la primera apertura (U4; FR6.2, FR6.3, ADR-006).
//
// La primera vez que se abre la herramienta se cargan los tres productos
// ficticios de proceso/ejemplos.json: uno sin empezar, uno a medias y uno con
// los 10 pasos completos. La regla de la marca de primera apertura
// (catalogo/primera-apertura.json) es:
//   - Si existe la marca, no se carga nada: la herramienta ya se abrió antes.
//     Así un ejemplo borrado no vuelve y un catálogo vaciado a propósito sigue
//     vacío.
//   - Si no hay marca pero sí productos.json (por ejemplo, tras un corte justo
//     antes de escribir la marca), no se carga nada, no se toca lo que hay y
//     solo se escribe la marca: los ejemplos nunca sobrescriben datos.
//   - Si no existe ninguno de los dos, se siembran los recorridos con U3, se
//     guarda productos.json y, por último, la marca.
// Si algo falla a medias, se deshace todo: productos.json vuelve a como estaba
// (el contenido anterior que devuelve guardar) y se deshacen los recorridos ya
// sembrados (Q4 de Units Generation). Si el propio deshacer falla, se registra
// en la consola junto al error original y se devuelve el original.
//
// La carga se hace en la cola del catálogo, de una en una con sus operaciones.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ErrorCatalogo } from "../base/errores.js";
import {
  ARCHIVO_PRIMERA_APERTURA,
  ARCHIVO_PRODUCTOS,
  VERSION_CATALOGO,
  existeMarcaPrimeraApertura,
  marcaPrimeraApertura,
  nuevoProducto,
} from "./modelo.js";
import { nuevoIdProducto, validarNombre } from "./nombre.js";

export const RUTA_EJEMPLOS_POR_DEFECTO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "proceso", "ejemplos.json");
const INTENTOS_ID = 10;

/**
 * Carga los productos de ejemplo si es la primera apertura.
 * Devuelve { cargados, motivo, productos }: motivo es "primera-apertura" (se
 * cargaron), "ya-abierta" (había marca) o "datos-previos" (había productos.json
 * sin marca; solo se escribió la marca).
 * @param {{
 *   almacen: ReturnType<import("../base/almacen.js").crearAlmacen>,
 *   recorridos: ReturnType<import("../recorrido/index.js").crearServicioRecorrido>,
 *   catalogo: ReturnType<import("./servicio.js").crearServicioCatalogo>,
 *   rutaEjemplos?: string,
 *   registro?: Pick<Console, "error">,
 *   generarId?: () => string,
 *   ahora?: () => string,
 * }} dependencias
 */
export async function cargarEjemplosSiPrimeraApertura({
  almacen,
  recorridos,
  catalogo,
  rutaEjemplos = RUTA_EJEMPLOS_POR_DEFECTO,
  registro = console,
  generarId = nuevoIdProducto,
  ahora = () => new Date().toISOString(),
}) {
  if (!almacen || !recorridos || !catalogo) {
    throw new TypeError("cargarEjemplosSiPrimeraApertura necesita el almacén, el servicio del recorrido (U3) y el del catálogo.");
  }
  return catalogo.enExclusiva(async () => {
    if (await existeMarcaPrimeraApertura(almacen)) return { cargados: 0, motivo: "ya-abierta", productos: [] };
    if (await almacen.existe(ARCHIVO_PRODUCTOS)) {
      await almacen.guardar(ARCHIVO_PRIMERA_APERTURA, marcaPrimeraApertura(ahora()));
      return { cargados: 0, motivo: "datos-previos", productos: [] };
    }
    const ejemplos = await leerEjemplos(rutaEjemplos);
    const productos = await sembrarYGuardar({ almacen, recorridos, registro, generarId, momento: ahora() }, ejemplos);
    return { cargados: productos.length, motivo: "primera-apertura", productos };
  });
}

/**
 * Lee y comprueba el archivo de ejemplos: { version, productos: [ { nombre, recorrido } ] }.
 * El contenido de cada recorrido lo valida U3 al sembrarlo.
 * @param {string} rutaEjemplos
 * @returns {Promise<{ nombre: string, recorrido: object }[]>}
 */
export async function leerEjemplos(rutaEjemplos = RUTA_EJEMPLOS_POR_DEFECTO) {
  let texto;
  try {
    texto = await readFile(rutaEjemplos, "utf8");
  } catch (error) {
    throw new ErrorCatalogo("EJEMPLOS_NO_DISPONIBLES", `No se pudo leer el archivo de ejemplos "${rutaEjemplos}": ${error.message}`, { estado: 500, causa: error });
  }
  let datos;
  try {
    datos = JSON.parse(texto.replace(/^﻿/, ""));
  } catch (error) {
    throw noValidos(rutaEjemplos, [`no contiene JSON válido (${error.message})`], error);
  }
  if (!esObjeto(datos) || !Array.isArray(datos.productos) || datos.productos.length === 0) {
    throw noValidos(rutaEjemplos, ['debe tener una lista "productos" con al menos un producto']);
  }
  const problemas = [];
  const ejemplos = datos.productos.map((ejemplo, indice) => {
    const donde = `el producto ${indice + 1}`;
    if (!esObjeto(ejemplo)) {
      problemas.push(`${donde} no es un objeto con "nombre" y "recorrido"`);
      return null;
    }
    let nombre = null;
    try {
      nombre = validarNombre(ejemplo.nombre);
    } catch (error) {
      problemas.push(`${donde}: ${error.message}`);
    }
    if (!esObjeto(ejemplo.recorrido)) problemas.push(`${donde} no tiene un "recorrido" (un objeto con "pasos" y "registros")`);
    return { nombre, recorrido: ejemplo.recorrido };
  });
  if (problemas.length > 0) throw noValidos(rutaEjemplos, problemas);
  return ejemplos;
}

async function sembrarYGuardar({ almacen, recorridos, registro, generarId, momento }, ejemplos) {
  const sembrados = [];
  let catalogoEscrito = false;
  let anterior = null;
  try {
    const productos = [];
    for (const ejemplo of ejemplos) {
      const idProducto = await idLibre(recorridos, generarId, productos);
      sembrados.push(await recorridos.sembrar(idProducto, ejemplo.recorrido));
      productos.push(nuevoProducto(idProducto, ejemplo.nombre, momento));
    }
    anterior = await almacen.guardar(ARCHIVO_PRODUCTOS, { version: VERSION_CATALOGO, productos });
    catalogoEscrito = true;
    await almacen.guardar(ARCHIVO_PRIMERA_APERTURA, marcaPrimeraApertura(momento));
    return productos;
  } catch (error) {
    await deshacerCarga({ almacen, recorridos, registro }, { sembrados, catalogoEscrito, anterior }, error);
    throw error;
  }
}

async function deshacerCarga({ almacen, recorridos, registro }, { sembrados, catalogoEscrito, anterior }, original) {
  const fallos = [];
  if (catalogoEscrito) {
    try {
      await almacen.restaurar(ARCHIVO_PRODUCTOS, anterior);
    } catch (error) {
      fallos.push(`no se pudo devolver ${ARCHIVO_PRODUCTOS} a como estaba: ${error.message}`);
    }
  }
  for (const sembrado of [...sembrados].reverse()) {
    try {
      await recorridos.deshacerCreacion(sembrado);
    } catch (error) {
      fallos.push(`no se pudo deshacer el recorrido recorridos/${sembrado.idProducto}/: ${error.message}`);
    }
  }
  if (fallos.length === 0) return;
  registro.error(`[catalogo] Falló la carga de los productos de ejemplo: ${original.message}`);
  for (const fallo of fallos) registro.error(`[catalogo] Y al deshacerla, ${fallo}. Revisa la carpeta de datos.`);
}

async function idLibre(recorridos, generarId, productos) {
  for (let intento = 0; intento < INTENTOS_ID; intento += 1) {
    const id = generarId();
    if (!productos.some((p) => p.idProducto === id) && !(await recorridos.existe(id))) return id;
  }
  throw new ErrorCatalogo("ID_NO_DISPONIBLE", "No se pudo generar un identificador libre para un producto de ejemplo.", { estado: 500 });
}

function noValidos(ruta, problemas, causa) {
  return new ErrorCatalogo("EJEMPLOS_NO_VALIDOS", `El archivo de ejemplos "${ruta}" no es válido:\n  - ${problemas.join("\n  - ")}`, {
    estado: 500,
    problemas,
    causa,
  });
}

function esObjeto(valor) {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}
