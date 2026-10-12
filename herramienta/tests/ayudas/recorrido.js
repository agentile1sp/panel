// Ayudas para las pruebas de U3 · Recorrido.
//
// - cargarDefinicionReal(): la definición real del proceso
//   (herramienta/proceso/definicion-proceso.json), solo para leer.
// - arrancarAplicacion(t): arranca la herramienta en 127.0.0.1 con el puerto 0
//   y una carpeta de datos temporal, y la detiene al terminar la prueba.
// - pedirJson(aplicacion, metodo, ruta, cuerpo): petición a la API local con
//   Content-Type: application/json; devuelve el estado y el JSON de respuesta.
// - llevarHasta(servicio, idProducto, completos, otros): crea un recorrido de
//   prueba con el servicio y deja en Completo, en orden, los pasos indicados.
//
// Ninguna prueba toca herramienta/datos/.

import { CARPETA_PLANTILLAS, RUTA_DEFINICION_POR_DEFECTO } from "../../src/base/config.js";
import { cargarDefinicion } from "../../src/definicion/index.js";
import { arrancar } from "../../src/main.js";
import { crearCarpetaTemporal } from "./carpeta-temporal.js";
import { crearRegistroDePrueba } from "./registro.js";

/** Ids de los 10 pasos en el orden del proceso. */
export const IDS_PASOS = Object.freeze([
  "hipotesis",
  "linea-base",
  "walking-skeleton",
  "mapa-de-piezas",
  "fichas",
  "user-flow",
  "story-map",
  "wireframes",
  "cierre-del-alcance",
  "mockups",
]);

/** Carga la definición real del proceso (solo lectura). */
export function cargarDefinicionReal() {
  return cargarDefinicion({ rutaDefinicion: RUTA_DEFINICION_POR_DEFECTO, carpetaPlantillas: CARPETA_PLANTILLAS });
}

/**
 * Arranca la aplicación sobre una carpeta de datos temporal (o la indicada).
 * @param {import("node:test").TestContext} t
 * @param {{ carpetaDatos?: string, detenerAlTerminar?: boolean }} [opciones]
 */
export async function arrancarAplicacion(t, { carpetaDatos, detenerAlTerminar = true } = {}) {
  const carpeta = carpetaDatos ?? (await crearCarpetaTemporal(t, "herramienta-u3-"));
  const registro = crearRegistroDePrueba();
  const aplicacion = await arrancar({ entorno: { HERRAMIENTA_DATOS: carpeta, PUERTO: "0" }, registro });
  if (detenerAlTerminar) t.after(() => aplicacion.detener());
  return { aplicacion, carpetaDatos: carpeta, registro };
}

/**
 * Petición JSON a la API local de la aplicación.
 * @returns {Promise<{ estado: number, json: any, cabeceras: Headers }>}
 */
export async function pedirJson(aplicacion, metodo, ruta, cuerpo) {
  const opciones = { method: metodo, headers: {} };
  if (cuerpo !== undefined) {
    opciones.headers["Content-Type"] = "application/json";
    opciones.body = JSON.stringify(cuerpo);
  }
  const respuesta = await fetch(`${aplicacion.direccion}${ruta}`, opciones);
  const texto = await respuesta.text();
  return { estado: respuesta.status, json: texto === "" ? null : JSON.parse(texto), cabeceras: respuesta.headers };
}

/**
 * Crea un recorrido con el servicio y marca Completo, en orden, los pasos de
 * `completos`; después aplica `otros` ({ idPaso: estado }) en el orden dado.
 * @param {ReturnType<import("../../src/recorrido/servicio.js").crearServicioRecorrido>} servicio
 * @param {string} idProducto
 * @param {string[]} [completos]
 * @param {Record<string, string>} [otros]
 */
export async function llevarHasta(servicio, idProducto, completos = [], otros = {}) {
  await servicio.crear(idProducto);
  for (const idPaso of completos) await servicio.cambiarEstado(idProducto, idPaso, "completo");
  for (const [idPaso, estado] of Object.entries(otros)) await servicio.cambiarEstado(idProducto, idPaso, estado);
  return servicio.obtener(idProducto);
}
