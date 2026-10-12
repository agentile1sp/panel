// Petición HTTP de bajo nivel para las pruebas que necesitan enviar cabeceras
// que fetch normaliza o no deja cambiar (Host, Origin) o rutas sin normalizar
// (por ejemplo, con "../" codificado).

import { request } from "node:http";

/**
 * @param {number} puerto
 * @param {{ metodo?: string, ruta?: string, cabeceras?: Record<string, string>, cuerpo?: string | Buffer }} opciones
 * @returns {Promise<{ estado: number, cabeceras: import("node:http").IncomingHttpHeaders, cuerpo: Buffer, json: () => any }>}
 */
export function peticionCruda(puerto, { metodo = "GET", ruta = "/", cabeceras = {}, cuerpo } = {}) {
  return new Promise((resolve, reject) => {
    const peticion = request(
      { host: "127.0.0.1", port: puerto, method: metodo, path: ruta, headers: cabeceras, agent: false },
      (respuesta) => {
        const trozos = [];
        respuesta.on("data", (trozo) => trozos.push(trozo));
        respuesta.on("end", () => {
          const datos = Buffer.concat(trozos);
          resolve({
            estado: respuesta.statusCode,
            cabeceras: respuesta.headers,
            cuerpo: datos,
            json: () => JSON.parse(datos.toString("utf8")),
          });
        });
        respuesta.on("error", reject);
      },
    );
    peticion.on("error", reject);
    peticion.end(cuerpo);
  });
}
