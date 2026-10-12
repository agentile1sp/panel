// Nombre e identificador de un producto del catálogo (U4).
//
// - El nombre es obligatorio al crear y al renombrar (FR1.3, FR1.4): se quitan
//   los espacios de los lados, no puede quedar vacío ni ser solo espacios y
//   tiene como máximo 100 caracteres. El resto se conserva tal cual (comillas,
//   acentos, emojis...). Dos productos pueden llamarse igual.
// - El id lo pone la herramienta: "p-" y 12 caracteres hexadecimales
//   aleatorios. Cumple la regla de ids de U3 (letras, números, "-" y "_",
//   empieza por letra o número, hasta 64 caracteres).
//
// La pantalla del catálogo repite esta misma comprobación del nombre en
// public/js/logica-catalogo.js para avisar antes de enviar; las pruebas de
// tests/u4-catalogo/pantalla.test.js comprueban que las dos coinciden.

import { randomBytes } from "node:crypto";
import { ErrorCatalogo } from "../base/errores.js";

export const LONGITUD_MAXIMA_NOMBRE = 100; // caracteres
export const MENSAJE_NOMBRE_OBLIGATORIO = "El nombre es obligatorio.";
export const MENSAJE_NOMBRE_LARGO = `El nombre no puede tener más de ${LONGITUD_MAXIMA_NOMBRE} caracteres.`;

/** Regla de ids de producto de U3 (recorridos/<idProducto>/). */
export const PATRON_ID_PRODUCTO = /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/;

/**
 * Devuelve el nombre sin espacios a los lados, o lanza ErrorCatalogo (400) si
 * no es válido.
 * @param {unknown} texto
 * @returns {string}
 */
export function validarNombre(texto) {
  const nombre = typeof texto === "string" ? texto.trim() : "";
  if (nombre === "") {
    throw new ErrorCatalogo("NOMBRE_OBLIGATORIO", MENSAJE_NOMBRE_OBLIGATORIO, { estado: 400 });
  }
  if (Array.from(nombre).length > LONGITUD_MAXIMA_NOMBRE) {
    throw new ErrorCatalogo("NOMBRE_DEMASIADO_LARGO", MENSAJE_NOMBRE_LARGO, { estado: 400 });
  }
  return nombre;
}

/** Id nuevo para un producto: "p-" y 12 caracteres hexadecimales aleatorios. */
export function nuevoIdProducto() {
  return `p-${randomBytes(6).toString("hex")}`;
}
