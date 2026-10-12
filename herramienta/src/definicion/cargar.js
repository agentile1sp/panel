// Lectura de la definición del proceso (U2, ADR-003).
//
// Lee el archivo de definición directamente del proyecto (no pasa por el
// almacén de U1: no es un dato de la carpeta de datos), comprueba que es JSON,
// lista las plantillas que existen y valida el contenido. Cualquier fallo se
// lanza como un único ErrorDefinicion cuyo mensaje nombra el archivo y el
// problema; la aplicación no arranca con una definición que falta o no vale.

import { readFile, readdir } from "node:fs/promises";
import { ErrorDefinicion } from "../base/errores.js";
import { crearDefinicion } from "./definicion.js";
import { validarDefinicion } from "./validar.js";

const AYUDA_VARIABLE = "Comprueba el archivo o indica otro con la variable HERRAMIENTA_DEFINICION.";

/**
 * Carga y valida la definición del proceso.
 * @param {{ rutaDefinicion: string, carpetaPlantillas: string }} opciones rutas absolutas
 * @returns {Promise<import("./definicion.js").Definicion>} la definición de solo lectura
 * @throws {ErrorDefinicion} si el archivo falta, no se puede leer, no es JSON o no es válido
 */
export async function cargarDefinicion({ rutaDefinicion, carpetaPlantillas }) {
  const texto = await leerArchivo(rutaDefinicion);
  const datos = interpretarJson(texto, rutaDefinicion);
  const plantillasDisponibles = await listarPlantillas(carpetaPlantillas, rutaDefinicion);
  const problemas = validarDefinicion(datos, { plantillasDisponibles });
  if (problemas.length > 0) {
    throw new ErrorDefinicion(
      "DEFINICION_NO_VALIDA",
      `La definición del proceso "${rutaDefinicion}" no es válida (${problemas.length} problema${problemas.length === 1 ? "" : "s"}):\n` +
        problemas.map((problema) => `  - ${problema}`).join("\n"),
      { archivo: rutaDefinicion, problemas },
    );
  }
  return crearDefinicion(datos);
}

async function leerArchivo(ruta) {
  try {
    return await readFile(ruta, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new ErrorDefinicion(
        "DEFINICION_NO_ENCONTRADA",
        `No se encontró el archivo de definición del proceso "${ruta}". ${AYUDA_VARIABLE}`,
        { archivo: ruta, causa: error },
      );
    }
    throw new ErrorDefinicion(
      "DEFINICION_ILEGIBLE",
      `No se pudo leer el archivo de definición del proceso "${ruta}": ${error.message}. ${AYUDA_VARIABLE}`,
      { archivo: ruta, causa: error },
    );
  }
}

function interpretarJson(texto, ruta) {
  try {
    // Un archivo editado a mano puede empezar por la marca BOM de UTF-8.
    return JSON.parse(texto.replace(/^﻿/, ""));
  } catch (error) {
    throw new ErrorDefinicion(
      "DEFINICION_JSON_DANADO",
      `El archivo de definición del proceso "${ruta}" no es JSON válido: ${error.message}.`,
      { archivo: ruta, causa: error },
    );
  }
}

async function listarPlantillas(carpeta, rutaDefinicion) {
  try {
    const entradas = await readdir(carpeta, { withFileTypes: true });
    return new Set(entradas.filter((entrada) => entrada.isFile()).map((entrada) => entrada.name));
  } catch (error) {
    throw new ErrorDefinicion(
      "PLANTILLAS_NO_DISPONIBLES",
      `No se pudo leer la carpeta de plantillas "${carpeta}" para validar la definición del proceso "${rutaDefinicion}": ${error.message}.`,
      { archivo: rutaDefinicion, causa: error },
    );
  }
}
