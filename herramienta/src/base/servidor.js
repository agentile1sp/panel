// Servidor local de la base común (U1).
//
// - Escucha solo en 127.0.0.1 y acepta solo peticiones dirigidas a su propio
//   origen (hallazgo R-03): la cabecera Host debe ser 127.0.0.1:<puerto> o
//   localhost:<puerto>, y las peticiones que cambian datos se rechazan si
//   llegan con un Origin ajeno o desde otro sitio (Sec-Fetch-Site).
// - Las rutas las registran las demás unidades en la raíz de composición
//   (src/main.js) con registrar(metodo, patron, manejador); este archivo no
//   conoce a ninguna otra unidad (hallazgo R-01).
// - Respuestas JSON uniformes: { ok: true, datos } o { ok: false, error: { codigo, mensaje } }.
// - Archivos estáticos desde la carpeta pública, sin poder salir de ella.
// - Descargas de adjuntos como archivo adjunto con tipo de contenido controlado,
//   para que el navegador nunca los ejecute.

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { TAMANO_MAXIMO_ADJUNTO } from "./adjuntos.js";
import { estaDentro } from "./almacen.js";
import { HOST } from "./config.js";
import { ErrorAdjunto, ErrorAlmacen, ErrorArranque, ErrorPeticion } from "./errores.js";

export const LIMITE_CUERPO_JSON = 1024 * 1024; // 1 MB
export const LIMITE_CUERPO_BINARIO = TAMANO_MAXIMO_ADJUNTO;
const METODOS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]);
const METODOS_SEGUROS = new Set(["GET", "HEAD", "OPTIONS"]);
const TIPOS_CUERPO = { json: "application/json", binario: "application/octet-stream" };
const MARCA_RESPUESTA = Symbol("respuesta");
const NOMBRE_PARAMETRO = /^[A-Za-z_]\w*$/;

// Cabeceras de seguridad en todas las respuestas. La política de contenido solo
// permite recursos del propio origen: las pantallas deben cargar su JavaScript
// y su CSS desde archivos de public/, no en línea.
const CABECERAS_SEGURIDAD = Object.freeze({
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
  "Content-Security-Policy": "default-src 'self'; frame-ancestors 'none'",
});

const TIPOS_CONTENIDO = Object.freeze({
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
});

// ---------------------------------------------------------------------------
// Respuestas especiales que puede devolver un manejador

/** Respuesta de descarga: el navegador guarda el archivo, nunca lo muestra ni lo ejecuta. */
export function descarga({ contenido, nombre }) {
  return { [MARCA_RESPUESTA]: "descarga", contenido, nombre };
}

/** Respuesta JSON con un código de estado distinto de 200 (por ejemplo, 201). */
export function conEstado(estado, datos) {
  return { [MARCA_RESPUESTA]: "json", estado, datos };
}

// ---------------------------------------------------------------------------
// Registro de rutas

/**
 * Crea un registro de rutas vacío.
 * registrar(metodo, patron, manejador, opciones?) admite parámetros en el patrón
 * ("/api/productos/:id"). El manejador recibe { metodo, ruta, parametros,
 * consulta, cuerpo, cabeceras } y devuelve los datos de la respuesta.
 * opciones.cuerpo: "json" (por defecto) o "binario"; opciones.limiteBytes.
 */
export function crearRegistroRutas() {
  const rutas = [];

  function registrar(metodo, patron, manejador, opciones = {}) {
    const definicion = crearDefinicion(metodo, patron, manejador, opciones);
    if (rutas.some((r) => r.metodo === definicion.metodo && r.patron === patron)) {
      throw new Error(`La ruta ${definicion.metodo} ${patron} ya está registrada.`);
    }
    rutas.push(definicion);
  }

  function buscar(metodo, ruta) {
    const tramosUrl = ruta.split("/").slice(1);
    let otroMetodo = false;
    for (const definicion of rutas) {
      const parametros = coincidir(definicion.tramos, tramosUrl);
      if (!parametros) continue;
      if (definicion.metodo === metodo) return { definicion, parametros };
      otroMetodo = true;
    }
    return otroMetodo ? { metodoNoPermitido: true } : null;
  }

  return Object.freeze({ registrar, buscar });
}

function crearDefinicion(metodo, patron, manejador, opciones) {
  const metodoNormalizado = typeof metodo === "string" ? metodo.toUpperCase() : metodo;
  if (!METODOS.has(metodoNormalizado)) {
    throw new TypeError(`Método no admitido: ${metodo}. Usa ${[...METODOS].join(", ")}.`);
  }
  if (typeof manejador !== "function") {
    throw new TypeError(`El manejador de ${metodoNormalizado} ${patron} debe ser una función.`);
  }
  const cuerpo = opciones.cuerpo ?? "json";
  if (!(cuerpo in TIPOS_CUERPO)) throw new TypeError(`Tipo de cuerpo no admitido: ${cuerpo}.`);
  return { metodo: metodoNormalizado, patron, tramos: compilarPatron(patron), manejador, cuerpo, limite: opciones.limiteBytes };
}

function compilarPatron(patron) {
  if (typeof patron !== "string" || !patron.startsWith("/")) {
    throw new TypeError(`El patrón de ruta debe empezar por "/": ${patron}`);
  }
  return patron.split("/").slice(1).map((tramo) => {
    if (!tramo.startsWith(":")) return { literal: tramo };
    const nombre = tramo.slice(1);
    if (!NOMBRE_PARAMETRO.test(nombre)) throw new TypeError(`Parámetro no válido en el patrón ${patron}: ${tramo}`);
    return { parametro: nombre };
  });
}

function coincidir(tramosPatron, tramosUrl) {
  if (tramosPatron.length !== tramosUrl.length) return null;
  const parametros = {};
  for (let i = 0; i < tramosPatron.length; i += 1) {
    const { literal, parametro } = tramosPatron[i];
    if (literal !== undefined) {
      if (literal !== tramosUrl[i]) return null;
      continue;
    }
    if (tramosUrl[i] === "") return null;
    parametros[parametro] = decodificar(tramosUrl[i]);
  }
  return parametros;
}

function decodificar(texto) {
  try {
    return decodeURIComponent(texto);
  } catch (error) {
    throw new ErrorPeticion("RUTA_NO_VALIDA", "La ruta de la petición no es válida.", 400, error);
  }
}

// ---------------------------------------------------------------------------
// Servidor

/**
 * Crea el servidor local. No escucha hasta llamar a iniciar(puerto).
 * @param {{ rutas: ReturnType<typeof crearRegistroRutas>, carpetaPublica: string, host?: string,
 *           registro?: Pick<Console, "log" | "warn" | "error">, limiteJson?: number, limiteBinario?: number }} opciones
 */
export function crearServidor({ rutas, carpetaPublica, host = HOST, registro = console, limiteJson = LIMITE_CUERPO_JSON, limiteBinario = LIMITE_CUERPO_BINARIO }) {
  if (!rutas || typeof rutas.buscar !== "function") {
    throw new TypeError("crearServidor necesita un registro de rutas creado con crearRegistroRutas().");
  }
  if (typeof carpetaPublica !== "string" || carpetaPublica === "") {
    throw new TypeError("crearServidor necesita la carpeta pública.");
  }
  const contexto = { rutas, publica: path.resolve(carpetaPublica), registro, puerto: null, limites: { json: limiteJson, binario: limiteBinario } };
  const servidor = createServer((peticion, respuesta) => {
    atender(contexto, peticion, respuesta).catch((error) => {
      registro.error(`[servidor] Error al responder ${peticion.method} ${peticion.url}:`, error);
      respuesta.destroy();
    });
  });
  // Errores del servidor ya en marcha; los del arranque los recoge iniciar().
  const alErrorEnMarcha = (error) => registro.error("[servidor] Error del servidor:", error);

  function iniciar(puerto) {
    return new Promise((resolve, reject) => {
      const alFallar = (error) => {
        servidor.off("listening", alEscuchar);
        reject(errorDeArranque(error, puerto));
      };
      const alEscuchar = () => {
        servidor.off("error", alFallar);
        servidor.off("error", alErrorEnMarcha);
        servidor.on("error", alErrorEnMarcha);
        contexto.puerto = servidor.address().port;
        resolve({ puerto: contexto.puerto, direccion: `http://${host}:${contexto.puerto}` });
      };
      servidor.once("error", alFallar);
      servidor.once("listening", alEscuchar);
      servidor.listen(puerto, host);
    });
  }

  function detener() {
    return new Promise((resolve, reject) => {
      if (!servidor.listening) return resolve();
      servidor.close((error) => (error ? reject(new ErrorArranque("PARADA_FALLIDA", `No se pudo detener el servidor: ${error.message}`, error)) : resolve()));
      servidor.closeAllConnections();
    });
  }

  return Object.freeze({
    servidor,
    iniciar,
    detener,
    get puerto() {
      return contexto.puerto;
    },
  });
}

function errorDeArranque(error, puerto) {
  const mensajes = {
    EADDRINUSE: `El puerto ${puerto} ya está en uso. Cierra la otra aplicación que lo usa o elige otro puerto con la variable PUERTO.`,
    EACCES: `No hay permiso para usar el puerto ${puerto}. Elige otro con la variable PUERTO.`,
  };
  const mensaje = mensajes[error.code] ?? `No se pudo arrancar el servidor en el puerto ${puerto}: ${error.message}`;
  return new ErrorArranque(error.code ?? "ARRANQUE_FALLIDO", mensaje, error);
}

// ---------------------------------------------------------------------------
// Atención de peticiones

async function atender(contexto, peticion, respuesta) {
  try {
    comprobarOrigen(peticion, contexto.puerto);
    const { ruta, consulta } = separarUrl(peticion.url);
    const metodo = peticion.method;
    const encontrada = contexto.rutas.buscar(metodo, ruta);
    if (encontrada?.definicion) {
      await ejecutarRuta({ contexto, peticion, respuesta, encontrada, ruta, consulta });
      return;
    }
    if (encontrada?.metodoNoPermitido) {
      throw new ErrorPeticion("METODO_NO_PERMITIDO", `El método ${metodo} no está permitido en ${ruta}.`, 405);
    }
    if ((metodo === "GET" || metodo === "HEAD") && !ruta.startsWith("/api/")) {
      await servirEstatico(contexto.publica, respuesta, ruta, metodo === "HEAD");
      return;
    }
    throw new ErrorPeticion("RUTA_NO_ENCONTRADA", `No existe la ruta ${metodo} ${ruta}.`, 404);
  } catch (error) {
    responderError(contexto.registro, peticion, respuesta, error);
  }
}

function comprobarOrigen(peticion, puerto) {
  const permitidos = [`127.0.0.1:${puerto}`, `localhost:${puerto}`];
  const host = (peticion.headers.host ?? "").toLowerCase();
  if (!permitidos.includes(host)) {
    throw new ErrorPeticion("ORIGEN_NO_PERMITIDO", "La petición no va dirigida a esta herramienta local.", 403);
  }
  if (METODOS_SEGUROS.has(peticion.method)) return;
  const origen = peticion.headers.origin;
  if (origen !== undefined && !permitidos.some((p) => origen.toLowerCase() === `http://${p}`)) {
    throw new ErrorPeticion("ORIGEN_NO_PERMITIDO", "Solo se aceptan cambios hechos desde la propia herramienta.", 403);
  }
  const sitio = peticion.headers["sec-fetch-site"];
  if (sitio !== undefined && sitio !== "same-origin" && sitio !== "none") {
    throw new ErrorPeticion("ORIGEN_NO_PERMITIDO", "Solo se aceptan cambios hechos desde la propia herramienta.", 403);
  }
}

function separarUrl(url) {
  const indice = url.indexOf("?");
  const ruta = indice === -1 ? url : url.slice(0, indice);
  if (!ruta.startsWith("/")) {
    throw new ErrorPeticion("RUTA_NO_VALIDA", "La ruta de la petición no es válida.", 400);
  }
  return { ruta, consulta: new URLSearchParams(indice === -1 ? "" : url.slice(indice + 1)) };
}

async function ejecutarRuta({ contexto, peticion, respuesta, encontrada, ruta, consulta }) {
  const { definicion, parametros } = encontrada;
  const cuerpo = await leerCuerpo(peticion, definicion, contexto.limites);
  const resultado = await definicion.manejador({
    metodo: peticion.method,
    ruta,
    parametros,
    consulta,
    cuerpo,
    cabeceras: peticion.headers,
  });
  enviarResultado(respuesta, resultado);
}

// ---------------------------------------------------------------------------
// Cuerpo de la petición

async function leerCuerpo(peticion, definicion, limites) {
  if (METODOS_SEGUROS.has(peticion.method)) return undefined;
  const longitud = Number(peticion.headers["content-length"] ?? 0);
  const tieneCuerpo = longitud > 0 || peticion.headers["transfer-encoding"] !== undefined;
  if (!tieneCuerpo) return undefined;
  comprobarTipoCuerpo(peticion.headers["content-type"], TIPOS_CUERPO[definicion.cuerpo]);
  const limite = definicion.limite ?? limites[definicion.cuerpo];
  const bytes = await leerBytes(peticion, limite);
  if (bytes.length === 0) return undefined;
  return definicion.cuerpo === "binario" ? bytes : interpretarCuerpoJson(bytes);
}

function comprobarTipoCuerpo(tipo, esperado) {
  const base = (tipo ?? "").split(";")[0].trim().toLowerCase();
  if (base !== esperado) {
    throw new ErrorPeticion("TIPO_NO_ADMITIDO", `El cuerpo de la petición debe enviarse como ${esperado}.`, 415);
  }
}

function leerBytes(peticion, limite) {
  const declarado = Number(peticion.headers["content-length"]);
  if (Number.isFinite(declarado) && declarado > limite) return Promise.reject(cuerpoDemasiadoGrande(limite));
  return new Promise((resolve, reject) => {
    const trozos = [];
    let total = 0;
    let terminado = false;
    const terminar = (accion, valor) => {
      if (terminado) return;
      terminado = true;
      accion(valor);
    };
    peticion.on("data", (trozo) => {
      total += trozo.length;
      if (total > limite) {
        peticion.pause();
        terminar(reject, cuerpoDemasiadoGrande(limite));
      } else if (!terminado) {
        trozos.push(trozo);
      }
    });
    peticion.on("end", () => terminar(resolve, Buffer.concat(trozos)));
    peticion.on("error", (error) => terminar(reject, new ErrorPeticion("CUERPO_INTERRUMPIDO", "La petición se interrumpió mientras se recibía.", 400, error)));
  });
}

function cuerpoDemasiadoGrande(limite) {
  const megas = (limite / (1024 * 1024)).toFixed(1).replace(".", ",");
  return new ErrorPeticion("CUERPO_DEMASIADO_GRANDE", `El cuerpo de la petición supera el máximo de ${megas} MB.`, 413);
}

function interpretarCuerpoJson(bytes) {
  try {
    return JSON.parse(bytes.toString("utf8"));
  } catch (error) {
    throw new ErrorPeticion("CUERPO_NO_VALIDO", "El cuerpo de la petición no es JSON válido.", 400, error);
  }
}

// ---------------------------------------------------------------------------
// Envío de respuestas

function enviarResultado(respuesta, resultado) {
  const tipo = resultado?.[MARCA_RESPUESTA];
  if (tipo === "descarga") return enviarDescarga(respuesta, resultado);
  if (tipo === "json") return enviarJson(respuesta, resultado.estado, { ok: true, datos: resultado.datos });
  return enviarJson(respuesta, 200, { ok: true, datos: resultado });
}

function enviarJson(respuesta, estado, cuerpo, cabecerasExtra = {}) {
  const texto = JSON.stringify(cuerpo);
  respuesta.writeHead(estado, {
    ...CABECERAS_SEGURIDAD,
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(texto),
    "Cache-Control": "no-store",
    ...cabecerasExtra,
  });
  respuesta.end(texto);
}

function enviarDescarga(respuesta, { contenido, nombre }) {
  if (!(contenido instanceof Uint8Array)) {
    throw new TypeError("Una descarga necesita un contenido binario (Buffer).");
  }
  const nombreFinal = typeof nombre === "string" && nombre !== "" ? nombre : "adjunto";
  respuesta.writeHead(200, {
    ...CABECERAS_SEGURIDAD,
    "Content-Type": "application/octet-stream",
    "Content-Disposition": disposicionAdjunto(nombreFinal),
    "Content-Length": contenido.byteLength,
    "Cache-Control": "no-store",
  });
  respuesta.end(contenido);
}

function disposicionAdjunto(nombre) {
  const ascii = nombre.replace(/[^\x20-\x7e]|["\\]/g, "_");
  const codificado = encodeURIComponent(nombre).replace(/['()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
  return `attachment; filename="${ascii}"; filename*=UTF-8''${codificado}`;
}

// ---------------------------------------------------------------------------
// Archivos estáticos

async function servirEstatico(publica, respuesta, ruta, soloCabeceras) {
  const archivo = resolverEstatico(publica, ruta);
  const contenido = archivo === null ? null : await leerEstatico(archivo);
  if (contenido === null) {
    throw new ErrorPeticion("RUTA_NO_ENCONTRADA", `No existe ${ruta}.`, 404);
  }
  respuesta.writeHead(200, {
    ...CABECERAS_SEGURIDAD,
    "Content-Type": TIPOS_CONTENIDO[path.extname(archivo).toLowerCase()] ?? "application/octet-stream",
    "Content-Length": contenido.length,
    "Cache-Control": "no-cache",
  });
  respuesta.end(soloCabeceras ? undefined : contenido);
}

function resolverEstatico(publica, ruta) {
  const decodificada = decodificar(ruta);
  if (decodificada.includes("\0")) {
    throw new ErrorPeticion("RUTA_NO_VALIDA", "La ruta de la petición no es válida.", 400);
  }
  const relativa = decodificada === "/" ? "index.html" : decodificada.slice(1);
  const absoluta = path.resolve(publica, relativa);
  return estaDentro(publica, absoluta) && absoluta !== publica ? absoluta : null;
}

async function leerEstatico(archivo) {
  try {
    const info = await stat(archivo);
    return info.isFile() ? await readFile(archivo) : null;
  } catch (error) {
    if (error.code === "ENOENT" || error.code === "ENOTDIR") return null;
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Errores

function responderError(registro, peticion, respuesta, error) {
  const { estado, codigo, mensaje, registrar } = clasificarError(error);
  if (registrar) {
    const detalle = error?.cause ?? error?.stack ?? "";
    registro.error(`[servidor] ${peticion.method} ${peticion.url} -> ${estado} ${codigo}: ${error?.message}`, detalle);
  }
  if (respuesta.headersSent) {
    respuesta.destroy();
    return;
  }
  const extra = estado === 413 ? { Connection: "close" } : {};
  enviarJson(respuesta, estado, { ok: false, error: { codigo, mensaje } }, extra);
}

function clasificarError(error) {
  if (error instanceof ErrorPeticion) {
    return { estado: error.estado, codigo: error.codigo, mensaje: error.message, registrar: false };
  }
  if (error instanceof ErrorAdjunto) {
    return { estado: 400, codigo: error.codigo, mensaje: error.message, registrar: true };
  }
  if (error instanceof ErrorAlmacen) {
    return { estado: 500, codigo: error.codigo, mensaje: error.message, registrar: true };
  }
  return {
    estado: 500,
    codigo: "ERROR_INTERNO",
    mensaje: "Ha ocurrido un error interno. Revisa la consola donde se arrancó la herramienta.",
    registrar: true,
  };
}
