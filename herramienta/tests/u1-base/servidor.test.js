// Pruebas del servidor local: rutas, 404, control de origen, archivos
// estáticos, errores, cuerpo de las peticiones y descarga de adjuntos
// (FR6, hallazgos R-01 y R-03). El servidor se arranca de verdad en 127.0.0.1
// con el puerto 0 (el sistema elige uno libre).

import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { crearAdjuntos } from "../../src/base/adjuntos.js";
import { crearAlmacen } from "../../src/base/almacen.js";
import { ErrorAlmacen } from "../../src/base/errores.js";
import { crearRegistroRutas, crearServidor, descarga } from "../../src/base/servidor.js";
import { crearCarpetaTemporal } from "../ayudas/carpeta-temporal.js";
import { peticionCruda } from "../ayudas/http.js";
import { crearRegistroDePrueba } from "../ayudas/registro.js";

const SECRETO = "contenido-secreto-fuera-de-public";

async function arrancarServidor(t, { registrar = () => {}, opciones = {} } = {}) {
  const base = await crearCarpetaTemporal(t);
  const publica = path.join(base, "public");
  await mkdir(publica);
  await writeFile(path.join(publica, "index.html"), "<!doctype html><title>Prueba</title><p>Página de prueba</p>", "utf8");
  await writeFile(path.join(publica, "estilos.css"), "body { color: black; }", "utf8");
  await writeFile(path.join(base, "secreto.txt"), SECRETO, "utf8");
  const rutas = crearRegistroRutas();
  await registrar(rutas, base);
  const registro = crearRegistroDePrueba();
  const servidor = crearServidor({ rutas, carpetaPublica: publica, registro, ...opciones });
  const { puerto, direccion } = await servidor.iniciar(0);
  t.after(() => servidor.detener());
  return { puerto, direccion, registro, base };
}

function enviarJson(direccion, ruta, cuerpo, cabeceras = {}) {
  return fetch(`${direccion}${ruta}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...cabeceras },
    body: typeof cuerpo === "string" ? cuerpo : JSON.stringify(cuerpo),
  });
}

test("una ruta registrada responde con su manejador, sus parámetros y la consulta", async (t) => {
  const { direccion } = await arrancarServidor(t, {
    registrar: (rutas) =>
      rutas.registrar("GET", "/api/productos/:id/pasos/:numero", ({ parametros, consulta }) => ({
        ...parametros,
        vista: consulta.get("vista"),
      })),
  });

  const respuesta = await fetch(`${direccion}/api/productos/caf%C3%A9%20negro/pasos/3?vista=detalle`);

  assert.equal(respuesta.status, 200);
  assert.match(respuesta.headers.get("content-type"), /^application\/json/);
  assert.equal(respuesta.headers.get("x-content-type-options"), "nosniff");
  assert.deepEqual(await respuesta.json(), { ok: true, datos: { id: "café negro", numero: "3", vista: "detalle" } });
  assert.throws(() => crearRegistroRutas().registrar("TRACE", "/x", () => {}), /Método no admitido/);
});

test("una ruta desconocida responde 404 en JSON y un método no registrado responde 405", async (t) => {
  const { direccion } = await arrancarServidor(t, {
    registrar: (rutas) => rutas.registrar("GET", "/api/productos/:id", () => ({})),
  });

  const desconocida = await fetch(`${direccion}/api/no-existe`);
  assert.equal(desconocida.status, 404);
  assert.deepEqual(await desconocida.json(), {
    ok: false,
    error: { codigo: "RUTA_NO_ENCONTRADA", mensaje: "No existe la ruta GET /api/no-existe." },
  });

  const estaticoInexistente = await fetch(`${direccion}/no-existe.html`);
  assert.equal(estaticoInexistente.status, 404);
  assert.equal((await estaticoInexistente.json()).error.codigo, "RUTA_NO_ENCONTRADA");

  const metodo = await fetch(`${direccion}/api/productos/p1`, { method: "DELETE" });
  assert.equal(metodo.status, 405);
  assert.equal((await metodo.json()).error.codigo, "METODO_NO_PERMITIDO");
});

test("una petición con Host ajeno responde 403", async (t) => {
  const { puerto } = await arrancarServidor(t, {
    registrar: (rutas) => rutas.registrar("GET", "/api/estado", () => undefined),
  });

  for (const host of [`evil.example:${puerto}`, "127.0.0.1", `127.0.0.1:${puerto + 1}`, `localhost.evil.example:${puerto}`]) {
    const respuesta = await peticionCruda(puerto, { ruta: "/api/estado", cabeceras: { Host: host } });
    assert.equal(respuesta.estado, 403, `Host ${host}`);
    assert.equal(respuesta.json().error.codigo, "ORIGEN_NO_PERMITIDO");
  }

  const local = await peticionCruda(puerto, { ruta: "/api/estado", cabeceras: { Host: `localhost:${puerto}` } });
  assert.equal(local.estado, 200);
  assert.deepEqual(local.json(), { ok: true });
});

test("una petición que cambia datos con Origin ajeno responde 403 y con el propio origen se acepta", async (t) => {
  const { puerto } = await arrancarServidor(t, {
    registrar: (rutas) => rutas.registrar("POST", "/api/eco", ({ cuerpo }) => cuerpo),
  });
  const cuerpo = JSON.stringify({ nombre: "P1" });
  const enviar = (cabeceras) =>
    peticionCruda(puerto, { metodo: "POST", ruta: "/api/eco", cuerpo, cabeceras: { "Content-Type": "application/json", ...cabeceras } });

  const ajeno = await enviar({ Origin: "http://evil.example" });
  assert.equal(ajeno.estado, 403);
  assert.equal(ajeno.json().error.codigo, "ORIGEN_NO_PERMITIDO");
  assert.equal((await enviar({ Origin: "null" })).estado, 403);
  assert.equal((await enviar({ Origin: `http://127.0.0.1:${puerto}`, "Sec-Fetch-Site": "cross-site" })).estado, 403);

  const propio = await enviar({ Origin: `http://127.0.0.1:${puerto}`, "Sec-Fetch-Site": "same-origin" });
  assert.equal(propio.estado, 200);
  assert.deepEqual(propio.json(), { ok: true, datos: { nombre: "P1" } });
  assert.equal((await enviar({ Origin: `http://localhost:${puerto}` })).estado, 200);
});

test("/ sirve index.html y una ruta con ../ no sale de public/", async (t) => {
  const { direccion, puerto } = await arrancarServidor(t);

  const inicio = await fetch(`${direccion}/`);
  assert.equal(inicio.status, 200);
  assert.equal(inicio.headers.get("content-type"), "text/html; charset=utf-8");
  assert.match(await inicio.text(), /Página de prueba/);
  const css = await fetch(`${direccion}/estilos.css`);
  assert.equal(css.headers.get("content-type"), "text/css; charset=utf-8");

  for (const ruta of ["/../secreto.txt", "/..%2fsecreto.txt", "/%2e%2e/secreto.txt", "/%2e%2e%5csecreto.txt", "/sub/..%2f..%2fsecreto.txt"]) {
    const respuesta = await peticionCruda(puerto, { ruta });
    assert.equal(respuesta.estado, 404, `ruta ${ruta}`);
    assert.ok(!respuesta.cuerpo.toString().includes(SECRETO), `ruta ${ruta} no debe filtrar el archivo`);
  }
  assert.equal((await peticionCruda(puerto, { ruta: "/%E0%A4%A" })).estado, 400, "una ruta mal codificada responde 400");
});

test("un manejador que lanza ErrorAlmacen produce un 500 con mensaje y queda registrado, sin tumbar el servidor", async (t) => {
  const { direccion, registro } = await arrancarServidor(t, {
    registrar: (rutas) => {
      rutas.registrar("GET", "/api/falla-almacen", () => {
        throw new ErrorAlmacen("ESCRITURA_FALLIDA", 'No se pudo guardar "productos/p1.json".');
      });
      rutas.registrar("GET", "/api/falla-inesperada", () => {
        throw new Error("detalle interno que no debe salir");
      });
      rutas.registrar("GET", "/api/estado", () => undefined);
    },
  });

  const fallo = await fetch(`${direccion}/api/falla-almacen`);
  assert.equal(fallo.status, 500);
  assert.deepEqual(await fallo.json(), {
    ok: false,
    error: { codigo: "ESCRITURA_FALLIDA", mensaje: 'No se pudo guardar "productos/p1.json".' },
  });
  assert.equal(registro.mensajes.error.length, 1);
  assert.match(registro.mensajes.error[0], /ESCRITURA_FALLIDA/);

  const inesperado = await fetch(`${direccion}/api/falla-inesperada`);
  assert.equal(inesperado.status, 500);
  const cuerpo = await inesperado.json();
  assert.equal(cuerpo.error.codigo, "ERROR_INTERNO");
  assert.ok(!cuerpo.error.mensaje.includes("detalle interno"), "no se filtran detalles internos");
  assert.match(registro.mensajes.error[1], /detalle interno/, "pero sí quedan en la consola");

  const sigueVivo = await fetch(`${direccion}/api/estado`);
  assert.equal(sigueVivo.status, 200);
});

test("el cuerpo JSON se lee con límite de tamaño y se rechaza si no es JSON válido", async (t) => {
  const { direccion } = await arrancarServidor(t, {
    registrar: (rutas) => rutas.registrar("POST", "/api/eco", ({ cuerpo }) => cuerpo),
    opciones: { limiteJson: 64 },
  });

  const valido = await enviarJson(direccion, "/api/eco", { texto: 'con "comillas" y\nsalto' });
  assert.equal(valido.status, 200);
  assert.deepEqual(await valido.json(), { ok: true, datos: { texto: 'con "comillas" y\nsalto' } });

  const invalido = await enviarJson(direccion, "/api/eco", "{no es json");
  assert.equal(invalido.status, 400);
  assert.equal((await invalido.json()).error.codigo, "CUERPO_NO_VALIDO");

  const grande = await enviarJson(direccion, "/api/eco", { texto: "x".repeat(100) });
  assert.equal(grande.status, 413);
  assert.equal((await grande.json()).error.codigo, "CUERPO_DEMASIADO_GRANDE");

  const formulario = await fetch(`${direccion}/api/eco`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "nombre=P1",
  });
  assert.equal(formulario.status, 415, "un formulario HTML no puede enviar cambios");
});

test("un adjunto se sirve como descarga con las cabeceras de seguridad", async (t) => {
  const contenido = Buffer.from("<script>alert('no se ejecuta')</script>", "utf8");
  let rutaGuardada;
  const { direccion } = await arrancarServidor(t, {
    registrar: async (rutas, base) => {
      const adjuntos = crearAdjuntos(crearAlmacen(path.join(base, "datos")));
      rutaGuardada = (await adjuntos.guardarAdjunto("adjuntos", "página «final».html", contenido)).ruta;
      rutas.registrar("GET", "/api/adjuntos/:nombre", async ({ parametros }) => {
        const adjunto = await adjuntos.leerAdjunto(`adjuntos/${parametros.nombre}`);
        return descarga(adjunto);
      });
    },
  });

  const respuesta = await fetch(`${direccion}/api/adjuntos/${encodeURIComponent(rutaGuardada.split("/").pop())}`);

  assert.equal(respuesta.status, 200);
  assert.equal(respuesta.headers.get("content-type"), "application/octet-stream");
  assert.equal(respuesta.headers.get("x-content-type-options"), "nosniff");
  assert.equal(
    respuesta.headers.get("content-disposition"),
    `attachment; filename="p_gina _final_.html"; filename*=UTF-8''${encodeURIComponent("página «final».html")}`,
  );
  assert.deepEqual(Buffer.from(await respuesta.arrayBuffer()), contenido);
});
