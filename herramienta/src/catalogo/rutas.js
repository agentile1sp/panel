// API local del catálogo (U4). Se registra en la raíz de composición
// (src/main.js) con registrarRutasCatalogo(rutas, { catalogo }).
//
//   GET    /api/productos        productos en orden de creación, con nombre y paso actual
//   POST   /api/productos        crea un producto: { "nombre": "..." } (responde 201)
//   GET    /api/productos/:id    un producto con su paso actual
//   PUT    /api/productos/:id    cambia el nombre: { "nombre": "..." }
//   DELETE /api/productos/:id    borra el producto con su recorrido y todo su contenido
//
// Cada producto se devuelve como { idProducto, nombre, creadoEn, actualizadoEn,
// pasoActual } (pasoActual es el de U3: { completo, id, nombre }).
// Errores en JSON con mensaje en español ({ ok: false, error: { codigo, mensaje } }):
// 400 si el nombre no es válido o el cuerpo no es un objeto, 404 si el producto
// no existe. Un fallo al guardar responde 500 con el mensaje del almacén, y el
// catálogo queda como estaba (Q4).

import { ErrorCatalogo, ErrorPeticion, ErrorRecorrido } from "../base/errores.js";
import { conEstado } from "../base/servidor.js";

/**
 * @param {ReturnType<import("../base/servidor.js").crearRegistroRutas>} rutas
 * @param {{
 *   catalogo: ReturnType<import("./servicio.js").crearServicioCatalogo>,
 *   registro?: Pick<Console, "error">,
 * }} dependencias
 */
export function registrarRutasCatalogo(rutas, { catalogo, registro = console }) {
  if (!catalogo) throw new TypeError("registrarRutasCatalogo necesita el servicio del catálogo.");
  const registrar = (metodo, patron, manejador) => rutas.registrar(metodo, patron, traducirErrores(manejador, registro));

  registrar("GET", "/api/productos", () => catalogo.listar());

  registrar("POST", "/api/productos", async ({ cuerpo }) => conEstado(201, await catalogo.crear(nombreDelCuerpo(cuerpo))));

  registrar("GET", "/api/productos/:id", ({ parametros }) => catalogo.obtener(parametros.id));

  registrar("PUT", "/api/productos/:id", ({ parametros, cuerpo }) => catalogo.renombrar(parametros.id, nombreDelCuerpo(cuerpo)));

  registrar("DELETE", "/api/productos/:id", ({ parametros }) => catalogo.borrar(parametros.id));
}

/** Convierte los errores del catálogo (y los de U3 que lleguen) en respuestas con su estado y su mensaje. */
function traducirErrores(manejador, registro) {
  return async (peticion) => {
    try {
      return await manejador(peticion);
    } catch (error) {
      if (!(error instanceof ErrorCatalogo) && !(error instanceof ErrorRecorrido)) throw error;
      if (error.estado >= 500) registro.error(`[catalogo] ${peticion.metodo} ${peticion.ruta}: ${error.message}`);
      throw new ErrorPeticion(error.codigo, error.message, error.estado, error);
    }
  };
}

/** El nombre del cuerpo { "nombre": "..." }; sin cuerpo, el nombre falta y lo rechaza validarNombre. */
function nombreDelCuerpo(cuerpo) {
  if (cuerpo === undefined) return undefined;
  if (typeof cuerpo !== "object" || cuerpo === null || Array.isArray(cuerpo)) {
    throw new ErrorPeticion("CUERPO_NO_VALIDO", 'El cuerpo de la petición debe ser un objeto JSON con el nombre: { "nombre": "..." }.', 400);
  }
  return cuerpo.nombre;
}
