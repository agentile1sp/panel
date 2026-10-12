// Ayudas de DOM compartidas por las pantallas del recorrido (U3).
//
// Todo el texto que viene de los datos se pone con textContent o con value,
// nunca como HTML, para que lo que escriba la persona usuaria no se ejecute.

import { controlDeCampo } from "./logica-paso.js";

/**
 * Crea un elemento con atributos e hijos.
 * Atributos especiales: `texto` (textContent) y `dataset` (atributos data-*).
 * Los atributos con valor false, null o undefined no se ponen; true pone el atributo vacío.
 */
export function crear(etiqueta, atributos = {}, hijos = []) {
  const elemento = document.createElement(etiqueta);
  for (const [nombre, valor] of Object.entries(atributos)) {
    if (valor === undefined || valor === null || valor === false) continue;
    if (nombre === "texto") elemento.textContent = String(valor);
    else if (nombre === "dataset") Object.assign(elemento.dataset, valor);
    else elemento.setAttribute(nombre, valor === true ? "" : String(valor));
  }
  for (const hijo of [].concat(hijos)) {
    if (hijo !== null && hijo !== undefined && hijo !== false) elemento.append(hijo);
  }
  return elemento;
}

/** Muestra un mensaje en la zona de avisos (role="status"); tipo: "info", "exito" o "error". */
export function mostrarMensaje(zona, texto, tipo = "info") {
  zona.textContent = texto;
  zona.className = `mensaje mensaje-${tipo}`;
  zona.hidden = texto === "";
}

/**
 * Crea la etiqueta, el control y la ayuda de un campo de la definición.
 * @param {{ id: string, nombre: string, tipo: string, ayuda?: string }} campo
 * @param {{ idControl: string, texto: string, testid: string }} opciones
 */
export function crearControlCampo(campo, { idControl, texto, testid }) {
  const descripcion = controlDeCampo(campo);
  const idAyuda = descripcion.ayuda ? `${idControl}-ayuda` : null;
  const control = crear(descripcion.control, {
    id: idControl,
    name: idControl,
    type: descripcion.control === "input" ? "text" : null,
    rows: descripcion.filas,
    "aria-describedby": idAyuda,
    "data-campo": campo.id,
    "data-testid": testid,
  });
  control.value = texto;
  return crear("div", { class: "campo" }, [
    crear("label", { for: idControl, texto: descripcion.etiqueta }),
    idAyuda ? crear("p", { id: idAyuda, class: "ayuda", texto: descripcion.ayuda }) : null,
    control,
  ]);
}
