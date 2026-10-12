// Forma de los archivos del catálogo (U4) en la carpeta de datos.
//
//   catalogo/productos.json
//     { "version": 1, "productos": [ { "idProducto", "nombre", "creadoEn", "actualizadoEn" } ] }
//     Los productos van en orden de creación. No se guarda el paso actual: se
//     pide a U3 cada vez (ADR-007).
//
//   catalogo/primera-apertura.json
//     { "version": 1, "ejemplosCargadosEn": "2026-10-12T10:00:00.000Z" }
//     Marca de primera apertura (ADR-006): se escribe al terminar la carga de
//     los productos de ejemplo, o al comprobar que ya había datos guardados.
//
// Las lecturas aceptan que los archivos no existan (devuelven null o false).
// Si productos.json existe pero no tiene la forma de arriba, se lanza
// ErrorCatalogo (CATALOGO_DANADO) sin tocarlo, para revisarlo a mano.

import { ErrorCatalogo } from "../base/errores.js";
import { PATRON_ID_PRODUCTO } from "./nombre.js";

export const VERSION_CATALOGO = 1;
export const CARPETA_CATALOGO = "catalogo";
export const ARCHIVO_PRODUCTOS = `${CARPETA_CATALOGO}/productos.json`;
export const ARCHIVO_PRIMERA_APERTURA = `${CARPETA_CATALOGO}/primera-apertura.json`;

/** Catálogo sin productos. */
export function catalogoVacio() {
  return { version: VERSION_CATALOGO, productos: [] };
}

/** Producto nuevo con su fecha de creación. */
export function nuevoProducto(idProducto, nombre, ahora) {
  return { idProducto, nombre, creadoEn: ahora, actualizadoEn: ahora };
}

/** Contenido de la marca de primera apertura. */
export function marcaPrimeraApertura(ahora) {
  return { version: VERSION_CATALOGO, ejemplosCargadosEn: ahora };
}

/**
 * Lee catalogo/productos.json. Devuelve null si no existe.
 * @param {ReturnType<import("../base/almacen.js").crearAlmacen>} almacen
 */
export async function leerCatalogo(almacen) {
  const datos = await almacen.leer(ARCHIVO_PRODUCTOS);
  return datos === null ? null : asegurarFormaCatalogo(datos);
}

/** Indica si ya existe la marca de primera apertura. */
export function existeMarcaPrimeraApertura(almacen) {
  return almacen.existe(ARCHIVO_PRIMERA_APERTURA);
}

/**
 * Comprueba la forma de productos.json y devuelve una copia. Conserva las
 * claves que no conoce. Si la forma no es válida, lanza CATALOGO_DANADO.
 * @param {unknown} datos
 */
export function asegurarFormaCatalogo(datos) {
  if (!esObjeto(datos) || !Array.isArray(datos.productos)) {
    throw danado("no tiene una lista de productos");
  }
  const vistos = new Set();
  const productos = datos.productos.map((producto, indice) => {
    const donde = `el producto ${indice + 1}`;
    if (!esObjeto(producto)) throw danado(`${donde} no es un objeto`);
    if (typeof producto.idProducto !== "string" || !PATRON_ID_PRODUCTO.test(producto.idProducto)) {
      throw danado(`${donde} no tiene un id válido`);
    }
    if (vistos.has(producto.idProducto)) throw danado(`el id "${producto.idProducto}" está repetido`);
    vistos.add(producto.idProducto);
    if (typeof producto.nombre !== "string") throw danado(`${donde} ("${producto.idProducto}") no tiene nombre`);
    return { ...producto };
  });
  return { ...datos, version: datos.version ?? VERSION_CATALOGO, productos };
}

function danado(motivo) {
  return new ErrorCatalogo(
    "CATALOGO_DANADO",
    `El archivo "${ARCHIVO_PRODUCTOS}" de la carpeta de datos está dañado: ${motivo}. Revísalo a mano; la herramienta no lo sobrescribe.`,
    { estado: 500 },
  );
}

function esObjeto(valor) {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}
