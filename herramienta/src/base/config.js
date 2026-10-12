// Configuración de la herramienta.
//
// El servidor escucha siempre en 127.0.0.1 (solo el propio equipo). El puerto,
// la carpeta de datos y el archivo de definición del proceso se pueden cambiar
// con variables de entorno:
//   PUERTO                   número entre 0 y 65535 (0 = el sistema elige uno libre)
//   HERRAMIENTA_DATOS        ruta de la carpeta de datos (relativa a la carpeta
//                            actual o absoluta)
//   HERRAMIENTA_DEFINICION   ruta del archivo de definición del proceso (U2;
//                            relativa a la carpeta actual o absoluta)
//
// Las plantillas del proceso viven fuera de la herramienta, en
// docs/proceso-producto/plantillas/ del repositorio.

import path from "node:path";
import { fileURLToPath } from "node:url";
import { ErrorArranque } from "./errores.js";

const RAIZ_HERRAMIENTA = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

export const HOST = "127.0.0.1";
export const PUERTO_POR_DEFECTO = 3210;
export const CARPETA_DATOS_POR_DEFECTO = path.join(RAIZ_HERRAMIENTA, "datos");
export const CARPETA_PUBLICA = path.join(RAIZ_HERRAMIENTA, "public");
export const RUTA_DEFINICION_POR_DEFECTO = path.join(RAIZ_HERRAMIENTA, "proceso", "definicion-proceso.json");
export const CARPETA_PLANTILLAS = path.join(RAIZ_HERRAMIENTA, "..", "docs", "proceso-producto", "plantillas");

/**
 * Lee la configuración a partir de las variables de entorno.
 * @param {Record<string, string | undefined>} entorno
 */
export function leerConfig(entorno = process.env) {
  return {
    host: HOST,
    puerto: leerPuerto(entorno.PUERTO),
    carpetaDatos: leerCarpetaDatos(entorno.HERRAMIENTA_DATOS),
    carpetaPublica: CARPETA_PUBLICA,
    rutaDefinicion: leerRutaDefinicion(entorno.HERRAMIENTA_DEFINICION),
    carpetaPlantillas: CARPETA_PLANTILLAS,
  };
}

function leerPuerto(valor) {
  if (valor === undefined || valor.trim() === "") return PUERTO_POR_DEFECTO;
  const texto = valor.trim();
  const puerto = Number(texto);
  if (!/^\d+$/.test(texto) || puerto > 65535) {
    throw new ErrorArranque(
      "PUERTO_NO_VALIDO",
      `La variable PUERTO debe ser un número entre 0 y 65535, y vale "${valor}".`,
    );
  }
  return puerto;
}

function leerCarpetaDatos(valor) {
  if (valor === undefined || valor.trim() === "") return CARPETA_DATOS_POR_DEFECTO;
  return path.resolve(valor);
}

function leerRutaDefinicion(valor) {
  if (valor === undefined || valor.trim() === "") return RUTA_DEFINICION_POR_DEFECTO;
  return path.resolve(valor);
}
