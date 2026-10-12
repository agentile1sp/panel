// Llamadas a la API local desde las pantallas.
//
// Los cuerpos JSON se envían con Content-Type: application/json y los
// adjuntos con application/octet-stream, como pide la base común (U1). Si una
// petición falla, se lanza un Error con el mensaje en español que devuelve la
// herramienta, para mostrarlo tal cual a la persona usuaria.

const SIN_CONEXION = "No se pudo conectar con la herramienta. Comprueba que sigue en marcha (npm start) y vuelve a intentarlo.";

/**
 * Petición JSON. Devuelve los `datos` de la respuesta.
 * @param {"GET" | "POST" | "PUT" | "DELETE"} metodo
 * @param {string} ruta
 * @param {unknown} [cuerpo]
 */
export async function pedir(metodo, ruta, cuerpo) {
  const opciones = { method: metodo, headers: { Accept: "application/json" } };
  if (cuerpo !== undefined) {
    opciones.headers["Content-Type"] = "application/json";
    opciones.body = JSON.stringify(cuerpo);
  }
  return procesar(await enviar(ruta, opciones));
}

/**
 * Sube un archivo como cuerpo binario. Devuelve los `datos` de la respuesta.
 * @param {string} ruta
 * @param {Blob} archivo
 */
export async function subirArchivo(ruta, archivo) {
  const opciones = { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/octet-stream" }, body: archivo };
  return procesar(await enviar(ruta, opciones));
}

async function enviar(ruta, opciones) {
  try {
    return await fetch(ruta, opciones);
  } catch (error) {
    throw new Error(SIN_CONEXION, { cause: error });
  }
}

async function procesar(respuesta) {
  let cuerpo;
  try {
    cuerpo = await respuesta.json();
  } catch (error) {
    throw new Error(`La herramienta respondió de forma inesperada (código ${respuesta.status}).`, { cause: error });
  }
  if (!respuesta.ok || cuerpo?.ok !== true) {
    throw new Error(cuerpo?.error?.mensaje ?? `La petición no se pudo completar (código ${respuesta.status}).`);
  }
  return cuerpo.datos;
}
