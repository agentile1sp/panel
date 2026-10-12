// API local del recorrido (U3). Se registra en la raíz de composición
// (src/main.js) con registrarRutasRecorrido(rutas, { servicio, definicion, nombreDe }).
//
//   GET    /api/proceso                                          definición del proceso (pasos y registros)
//   GET    /api/recorridos/:id                                   recorrido con estado, habilitación y paso actual
//   PUT    /api/recorridos/:id/pasos/:paso/contenido             guarda el contenido (sin tocar el estado)
//   PUT    /api/recorridos/:id/pasos/:paso/estado                cambia el estado: { "estado": "en-curso" }
//   POST   /api/recorridos/:id/pasos/:paso/adjunto?nombre=...    sube un adjunto (application/octet-stream)
//   GET    /api/recorridos/:id/pasos/:paso/adjunto               descarga el adjunto
//   POST   /api/recorridos/:id/registros/:registro/:tipo         añade una entrada: { "campos": { ... } }
//   PUT    /api/recorridos/:id/registros/:registro/:tipo/:entrada edita una entrada
//   DELETE /api/recorridos/:id/registros/:registro/:tipo/:entrada quita una entrada
//
// Errores en JSON con mensaje en español ({ ok: false, error: { codigo, mensaje } }):
// 404 si el recorrido, el paso, el registro o la entrada no existen; 409 si el
// paso no está habilitado (el mensaje nombra los pasos que faltan); 400 si el
// contenido no encaja con la definición (el mensaje lista los problemas).
//
// El nombre del producto lo da el proveedor opcional `nombreDe(idProducto)`.
// Por defecto devuelve null; U4 lo conectará al catálogo, así U3 no depende de U4.

import { ErrorPeticion, ErrorRecorrido } from "../base/errores.js";
import { conEstado, descarga } from "../base/servidor.js";
import { estadoDePasos, pasoActual } from "./reglas.js";

/**
 * @param {ReturnType<import("../base/servidor.js").crearRegistroRutas>} rutas
 * @param {{
 *   servicio: ReturnType<import("./servicio.js").crearServicioRecorrido>,
 *   definicion: import("../definicion/index.js").Definicion,
 *   nombreDe?: (idProducto: string) => string | null | Promise<string | null>,
 *   registro?: Pick<Console, "error">,
 * }} dependencias
 */
export function registrarRutasRecorrido(rutas, { servicio, definicion, nombreDe = () => null, registro = console }) {
  const registrar = (metodo, patron, manejador, opciones) => rutas.registrar(metodo, patron, traducirErrores(manejador, registro), opciones);
  const base = "/api/recorridos/:id";

  async function vista(idProducto, recorrido) {
    const nombre = await nombreDe(idProducto);
    return {
      idProducto,
      nombre: typeof nombre === "string" && nombre.trim() !== "" ? nombre : null,
      pasoActual: pasoActual(recorrido, definicion),
      pasos: estadoDePasos(recorrido, definicion).map((paso) => ({
        ...paso,
        contenido: recorrido.pasos[paso.id].contenido,
        actualizadoEn: recorrido.pasos[paso.id].actualizadoEn,
      })),
      registros: recorrido.registros,
    };
  }

  registrar("GET", "/api/proceso", () => ({ pasos: definicion.pasos(), registros: definicion.registros() }));

  registrar("GET", base, async ({ parametros }) => vista(parametros.id, await servicio.obtener(parametros.id)));

  registrar("PUT", `${base}/pasos/:paso/contenido`, async ({ parametros, cuerpo }) => {
    const contenido = exigirObjeto(cuerpo, "el contenido del paso");
    return vista(parametros.id, await servicio.guardarContenido(parametros.id, parametros.paso, contenido));
  });

  registrar("PUT", `${base}/pasos/:paso/estado`, async ({ parametros, cuerpo }) => {
    const { estado } = exigirObjeto(cuerpo, 'el estado ({ "estado": "en-curso" })');
    return vista(parametros.id, await servicio.cambiarEstado(parametros.id, parametros.paso, estado));
  });

  registrar(
    "POST",
    `${base}/pasos/:paso/adjunto`,
    async ({ parametros, consulta, cuerpo }) => {
      if (!(cuerpo instanceof Uint8Array) || cuerpo.byteLength === 0) {
        throw new ErrorPeticion("ADJUNTO_VACIO", "No ha llegado ningún archivo: elige un archivo que no esté vacío.", 400);
      }
      const recorrido = await servicio.subirAdjunto(parametros.id, parametros.paso, consulta.get("nombre") ?? "", cuerpo);
      return vista(parametros.id, recorrido);
    },
    { cuerpo: "binario" },
  );

  registrar("GET", `${base}/pasos/:paso/adjunto`, async ({ parametros }) => descarga(await servicio.leerAdjunto(parametros.id, parametros.paso)));

  registrar("POST", `${base}/registros/:registro/:tipo`, async ({ parametros, cuerpo }) => {
    const { id, registro: idRegistro, tipo } = parametros;
    return conEstado(201, await servicio.anadirEntrada(id, idRegistro, tipo, camposDe(cuerpo)));
  });

  registrar("PUT", `${base}/registros/:registro/:tipo/:entrada`, async ({ parametros, cuerpo }) => {
    const { id, registro: idRegistro, tipo, entrada } = parametros;
    return servicio.editarEntrada(id, idRegistro, tipo, entrada, camposDe(cuerpo));
  });

  registrar("DELETE", `${base}/registros/:registro/:tipo/:entrada`, async ({ parametros }) => {
    const { id, registro: idRegistro, tipo, entrada } = parametros;
    return servicio.quitarEntrada(id, idRegistro, tipo, entrada);
  });
}

/** Convierte los ErrorRecorrido en respuestas con su código de estado y su mensaje. */
function traducirErrores(manejador, registro) {
  return async (peticion) => {
    try {
      return await manejador(peticion);
    } catch (error) {
      if (!(error instanceof ErrorRecorrido)) throw error;
      if (error.estado >= 500) registro.error(`[recorrido] ${peticion.metodo} ${peticion.ruta}: ${error.message}`);
      throw new ErrorPeticion(error.codigo, error.message, error.estado, error);
    }
  };
}

function exigirObjeto(cuerpo, que) {
  if (typeof cuerpo !== "object" || cuerpo === null || Array.isArray(cuerpo)) {
    throw new ErrorPeticion("CUERPO_NO_VALIDO", `Falta ${que} en el cuerpo de la petición, como un objeto JSON.`, 400);
  }
  return cuerpo;
}

function camposDe(cuerpo) {
  return exigirObjeto(cuerpo, 'la entrada ({ "campos": { ... } })').campos ?? {};
}
