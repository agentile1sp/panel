// Crea una carpeta temporal en os.tmpdir() para una prueba y la borra al
// terminar la prueba. Ninguna prueba toca herramienta/datos/.

import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

/**
 * @param {import("node:test").TestContext} t contexto de la prueba
 * @param {string} [prefijo]
 * @returns {Promise<string>} ruta absoluta de la carpeta creada
 */
export async function crearCarpetaTemporal(t, prefijo = "herramienta-") {
  const ruta = await mkdtemp(path.join(tmpdir(), prefijo));
  t.after(() => rm(ruta, { recursive: true, force: true }));
  return ruta;
}
