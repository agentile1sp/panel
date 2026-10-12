// Lógica de la pantalla del catálogo (U4) que no toca el DOM: textos del paso
// actual, del catálogo vacío y de la confirmación de borrado, direcciones y la
// comprobación del nombre antes de enviar. Se prueba con `node --test`
// (tests/u4-catalogo/pantalla.test.js).
//
// La comprobación del nombre repite la del servidor (src/catalogo/nombre.js):
// obligatorio, sin espacios a los lados y de hasta 100 caracteres. El servidor
// la vuelve a hacer siempre; aquí solo sirve para avisar sin perder lo escrito.

import { urlRecorrido } from "./logica-recorrido.js";

export const LONGITUD_MAXIMA_NOMBRE = 100;
export const MENSAJE_NOMBRE_OBLIGATORIO = "El nombre es obligatorio.";
export const MENSAJE_NOMBRE_LARGO = `El nombre no puede tener más de ${LONGITUD_MAXIMA_NOMBRE} caracteres.`;
export const MENSAJE_CATALOGO_VACIO = "Todavía no hay ningún producto en el catálogo. Crea el primero con su nombre.";

/**
 * Comprueba el nombre escrito en un formulario.
 * @param {unknown} texto
 * @returns {{ valido: true, nombre: string } | { valido: false, mensaje: string }}
 */
export function comprobarNombre(texto) {
  const nombre = typeof texto === "string" ? texto.trim() : "";
  if (nombre === "") return { valido: false, mensaje: MENSAJE_NOMBRE_OBLIGATORIO };
  if (Array.from(nombre).length > LONGITUD_MAXIMA_NOMBRE) return { valido: false, mensaje: MENSAJE_NOMBRE_LARGO };
  return { valido: true, nombre };
}

/**
 * Texto del paso actual en el catálogo: el nombre del paso, o "Completo" si lo
 * están los 10 (FR1.2). Si no se pudo leer el recorrido, lo dice.
 * @param {{ completo: boolean, nombre: string } | null | undefined} pasoActual
 */
export function textoPasoActual(pasoActual) {
  if (!pasoActual) return "No se pudo leer su recorrido";
  return pasoActual.completo ? "Completo" : pasoActual.nombre;
}

/** Texto del diálogo de confirmación de borrado, nombrando el producto (FR1.5). */
export function textoConfirmacionBorrado(nombre) {
  return `¿Seguro que quieres borrar el producto "${nombre}"? Se borrarán también su recorrido y todo lo que se creó en cada paso. No se puede deshacer.`;
}

/** Texto del aviso tras crear, renombrar o borrar. */
export function textoResultado(accion, nombre) {
  const textos = {
    creado: `Producto "${nombre}" creado.`,
    renombrado: `El producto ahora se llama "${nombre}".`,
    borrado: `Producto "${nombre}" borrado.`,
  };
  return textos[accion] ?? "";
}

/** Dirección del recorrido de un producto: recorrido.html?producto=<id> con el id codificado (FR1.6). */
export function urlRecorridoProducto(idProducto) {
  return urlRecorrido(idProducto);
}

/** Ruta de la API de un producto. */
export function rutaApiProducto(idProducto) {
  return `/api/productos/${encodeURIComponent(idProducto)}`;
}
