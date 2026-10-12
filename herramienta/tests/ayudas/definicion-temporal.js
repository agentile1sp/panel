// Copias de la definición del proceso para las pruebas de errores de U2.
//
// Lee la definición real (herramienta/proceso/definicion-proceso.json, que
// nunca se modifica), aplica un cambio a una copia y la escribe en una carpeta
// temporal que se borra al terminar la prueba.

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { RUTA_DEFINICION_POR_DEFECTO } from "../../src/base/config.js";
import { crearCarpetaTemporal } from "./carpeta-temporal.js";

/** Devuelve una copia nueva de los datos de la definición real. */
export async function leerDefinicionReal() {
  return JSON.parse(await readFile(RUTA_DEFINICION_POR_DEFECTO, "utf8"));
}

/**
 * Escribe en una carpeta temporal una copia modificada de la definición real.
 *
 * `modificar` recibe una copia de los datos. Puede cambiarla en el sitio (sin
 * devolver nada), devolver otros datos o devolver un texto, que se escribe tal
 * cual (por ejemplo, un JSON dañado).
 *
 * @param {import("node:test").TestContext} t contexto de la prueba
 * @param {(datos: any) => any} [modificar]
 * @returns {Promise<string>} ruta absoluta del archivo escrito
 */
export async function escribirDefinicionTemporal(t, modificar = () => undefined) {
  const datos = await leerDefinicionReal();
  const resultado = modificar(datos) ?? datos;
  const contenido = typeof resultado === "string" ? resultado : `${JSON.stringify(resultado, null, 2)}\n`;
  const carpeta = await crearCarpetaTemporal(t, "herramienta-definicion-");
  const ruta = path.join(carpeta, "definicion-proceso.json");
  await writeFile(ruta, contenido, "utf8");
  return ruta;
}

/**
 * Busca un paso por id en unos datos de definición (para modificarlo en las
 * pruebas). Lanza un error si no existe, para que la prueba no pase en falso.
 */
export function pasoDe(datos, id) {
  const paso = datos.pasos.find((p) => p.id === id);
  if (paso === undefined) throw new Error(`La definición real no tiene el paso "${id}"`);
  return paso;
}
