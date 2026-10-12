// Adjuntos de la base común (U1).
//
// Guarda y lee los archivos que la persona usuaria adjunta a un paso visual
// (FR4.4). El nombre que llega del navegador no es de fiar: se sanea para que
// nunca se escriba fuera de la carpeta de datos (hallazgo R-03 de Domain
// Design), y se le añade un prefijo único para que dos adjuntos con el mismo
// nombre no se pisen. La escritura es completa o nula porque usa el almacén.

import { randomBytes } from "node:crypto";
import path from "node:path";
import { estaDentro } from "./almacen.js";
import { ErrorAdjunto } from "./errores.js";

export const TAMANO_MAXIMO_ADJUNTO = 10 * 1024 * 1024; // 10 MB
export const LONGITUD_MAXIMA_NOMBRE = 100; // caracteres
export const NOMBRE_POR_DEFECTO = "adjunto";
const BYTES_MAXIMOS_NOMBRE = 200; // margen bajo el límite de 255 bytes de los sistemas de archivos
const CARACTERES_PROHIBIDOS = /[\u0000-\u001f\u007f<>:"/\\|?*]/g;
const PATRON_GUARDADO = /^[0-9a-f]{16}-(.+)$/;

/**
 * Convierte un nombre de archivo cualquiera en uno seguro: solo el nombre
 * final (sin carpetas), sin separadores, sin "..", sin caracteres de control
 * ni reservados, con 100 caracteres como máximo y "adjunto" si queda vacío.
 * @param {unknown} nombre
 * @returns {string}
 */
export function sanearNombre(nombre) {
  if (typeof nombre !== "string") return NOMBRE_POR_DEFECTO;
  const final = nombre.split(/[/\\]/).pop() ?? "";
  const limpio = recortarBordes(
    final.normalize("NFC").replace(CARACTERES_PROHIBIDOS, "").replace(/\.{2,}/g, "."),
  );
  const recortado = recortar(limpio);
  return recortado === "" ? NOMBRE_POR_DEFECTO : recortado;
}

/**
 * Crea las operaciones de adjuntos sobre un almacén.
 * @param {ReturnType<import("./almacen.js").crearAlmacen>} almacen
 */
export function crearAdjuntos(almacen) {
  async function guardarAdjunto(carpeta, nombre, contenido) {
    validarContenido(contenido);
    const nombreSaneado = sanearNombre(nombre);
    const ruta = unirRuta(carpeta, `${randomBytes(8).toString("hex")}-${nombreSaneado}`);
    comprobarDentro(almacen, ruta);
    await almacen.guardarBinario(ruta, contenido);
    return { ruta, nombre: nombreSaneado, tamano: contenido.byteLength };
  }

  async function leerAdjunto(ruta) {
    const nombre = nombreDescarga(ruta);
    const contenido = await almacen.leerBinario(ruta);
    return contenido === null ? null : { contenido, nombre };
  }

  return Object.freeze({ guardarAdjunto, leerAdjunto });
}

function validarContenido(contenido) {
  if (!(contenido instanceof Uint8Array)) {
    throw new ErrorAdjunto("CONTENIDO_NO_VALIDO", "El adjunto debe enviarse como un archivo binario.");
  }
  if (contenido.byteLength > TAMANO_MAXIMO_ADJUNTO) {
    throw new ErrorAdjunto(
      "TAMANO_EXCEDIDO",
      `El adjunto ocupa ${enMegas(contenido.byteLength)} MB y el máximo permitido es ${enMegas(TAMANO_MAXIMO_ADJUNTO)} MB.`,
    );
  }
}

function comprobarDentro(almacen, ruta) {
  const absoluta = almacen.rutaAbsoluta(ruta);
  if (!estaDentro(almacen.carpetaDatos, absoluta) || absoluta === almacen.carpetaDatos) {
    throw new ErrorAdjunto("RUTA_NO_VALIDA", "El adjunto quedaría fuera de la carpeta de datos.");
  }
}

function nombreDescarga(ruta) {
  const base = typeof ruta === "string" ? ruta.split("/").pop() : "";
  const coincidencia = PATRON_GUARDADO.exec(base ?? "");
  if (!coincidencia) {
    throw new ErrorAdjunto("RUTA_NO_VALIDA", "La ruta indicada no corresponde a un adjunto guardado.");
  }
  return coincidencia[1];
}

function unirRuta(carpeta, nombre) {
  const limpia = typeof carpeta === "string" ? carpeta.replace(/\/+$/, "") : carpeta;
  return limpia === "" ? nombre : `${limpia}/${nombre}`;
}

function recortarBordes(texto) {
  return texto.replace(/^[.\s]+/, "").replace(/[.\s]+$/, "");
}

function recortar(texto) {
  const extension = path.extname(texto);
  const caracteresExtension = Array.from(extension).length;
  const conservaExtension = extension !== "" && caracteresExtension <= 10;
  let resultado = texto;
  let maximo = LONGITUD_MAXIMA_NOMBRE;
  while (Array.from(resultado).length > LONGITUD_MAXIMA_NOMBRE || Buffer.byteLength(resultado) > BYTES_MAXIMOS_NOMBRE) {
    resultado = conservaExtension
      ? recortarBordes(Array.from(texto).slice(0, maximo - caracteresExtension).join("")) + extension
      : recortarBordes(Array.from(texto).slice(0, maximo).join(""));
    maximo -= 1;
  }
  return resultado;
}

function enMegas(bytes) {
  return (bytes / (1024 * 1024)).toFixed(1).replace(".", ",");
}
