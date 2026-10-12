// Pruebas de la API local del recorrido (U3) contra la aplicación real
// arrancada en 127.0.0.1 con el puerto 0 y una carpeta de datos temporal:
// definición, recorrido, 404, 409, 400, adjuntos, registros y control de origen.

import assert from "node:assert/strict";
import { test } from "node:test";
import { IDS_PASOS, arrancarAplicacion, llevarHasta, pedirJson } from "../ayudas/recorrido.js";
import { peticionCruda } from "../ayudas/http.js";

test("GET /api/proceso devuelve los 10 pasos y los 2 registros", async (t) => {
  const { aplicacion } = await arrancarAplicacion(t);

  const { estado, json } = await pedirJson(aplicacion, "GET", "/api/proceso");

  assert.equal(estado, 200);
  assert.equal(json.ok, true);
  assert.deepEqual(json.datos.pasos.map((p) => p.id), IDS_PASOS);
  assert.deepEqual(json.datos.registros.map((r) => r.id), ["acuerdos", "gaps-y-supuestos"]);
  assert.ok(json.datos.pasos[0].campos.length > 0, "incluye los campos para construir los formularios");
});

test("GET /api/recorridos/:id devuelve los pasos con estado, habilitación y los que faltan, y el paso actual; un id inexistente da 404", async (t) => {
  const { aplicacion } = await arrancarAplicacion(t);
  await llevarHasta(aplicacion.recorridos, "p1", ["hipotesis", "linea-base"], { "walking-skeleton": "en-curso" });

  const { estado, json } = await pedirJson(aplicacion, "GET", "/api/recorridos/p1");

  assert.equal(estado, 200);
  const { datos } = json;
  assert.equal(datos.idProducto, "p1");
  assert.equal(datos.nombre, null, "sin catálogo (U4) no hay nombre");
  assert.deepEqual(datos.pasoActual, { completo: false, id: "walking-skeleton", nombre: "Walking skeleton" });
  assert.equal(datos.pasos.length, 10);
  const paso4 = datos.pasos.find((p) => p.id === "mapa-de-piezas");
  assert.equal(paso4.estado, "pendiente");
  assert.equal(paso4.habilitado, false);
  assert.deepEqual(paso4.faltan, [{ id: "walking-skeleton", nombre: "Walking skeleton" }]);
  assert.ok("contenido" in paso4);
  assert.deepEqual(Object.keys(datos.registros), ["acuerdos", "gaps-y-supuestos"]);

  const inexistente = await pedirJson(aplicacion, "GET", "/api/recorridos/no-existe");
  assert.equal(inexistente.estado, 404);
  assert.equal(inexistente.json.error.codigo, "NO_EXISTE");
  assert.match(inexistente.json.error.mensaje, /No existe el recorrido/);
});

test("PUT .../contenido guarda en un paso habilitado y en uno no habilitado da 409 con los pasos que faltan", async (t) => {
  const { aplicacion } = await arrancarAplicacion(t);
  await llevarHasta(aplicacion.recorridos, "p1", ["hipotesis", "linea-base"], { "walking-skeleton": "en-curso" });
  const texto = 'Con "comillas"\ny saltos de línea: ¡ñ!';

  const guardado = await pedirJson(aplicacion, "PUT", "/api/recorridos/p1/pasos/walking-skeleton/contenido", { campos: { "que-prueba": texto } });
  assert.equal(guardado.estado, 200);
  const paso3 = guardado.json.datos.pasos.find((p) => p.id === "walking-skeleton");
  assert.equal(paso3.contenido.campos["que-prueba"], texto);
  assert.equal(paso3.estado, "en-curso", "guardar no cambia el estado");

  const bloqueado = await pedirJson(aplicacion, "PUT", "/api/recorridos/p1/pasos/mapa-de-piezas/contenido", { campos: { pasada: "1" } });
  assert.equal(bloqueado.estado, 409);
  assert.equal(bloqueado.json.ok, false);
  assert.equal(bloqueado.json.error.codigo, "PASO_NO_HABILITADO");
  assert.match(bloqueado.json.error.mensaje, /Falta completar: Walking skeleton/);

  const noValido = await pedirJson(aplicacion, "PUT", "/api/recorridos/p1/pasos/walking-skeleton/contenido", { campos: { inventado: "x" } });
  assert.equal(noValido.estado, 400);
  assert.match(noValido.json.error.mensaje, /"inventado"/);
  const sinCuerpo = await pedirJson(aplicacion, "PUT", "/api/recorridos/p1/pasos/walking-skeleton/contenido");
  assert.equal(sinCuerpo.estado, 400);
  const pasoInventado = await pedirJson(aplicacion, "PUT", "/api/recorridos/p1/pasos/inventado/contenido", { campos: {} });
  assert.equal(pasoInventado.estado, 404);
});

test("PUT .../estado cambia el estado y con un estado no válido da 400", async (t) => {
  const { aplicacion } = await arrancarAplicacion(t);
  await aplicacion.recorridos.crear("p1");

  const cambio = await pedirJson(aplicacion, "PUT", "/api/recorridos/p1/pasos/hipotesis/estado", { estado: "completo" });
  assert.equal(cambio.estado, 200);
  assert.equal(cambio.json.datos.pasos[0].estado, "completo");
  assert.equal(cambio.json.datos.pasos[1].habilitado, true);

  const noValido = await pedirJson(aplicacion, "PUT", "/api/recorridos/p1/pasos/hipotesis/estado", { estado: "terminado" });
  assert.equal(noValido.estado, 400);
  assert.equal(noValido.json.error.codigo, "ESTADO_NO_VALIDO");
  const bloqueado = await pedirJson(aplicacion, "PUT", "/api/recorridos/p1/pasos/fichas/estado", { estado: "en-curso" });
  assert.equal(bloqueado.estado, 409);
});

test("POST .../adjunto guarda un archivo binario y GET .../adjunto lo devuelve como descarga", async (t) => {
  const { aplicacion } = await arrancarAplicacion(t);
  await llevarHasta(aplicacion.recorridos, "p1", IDS_PASOS.slice(0, 5));
  const bytes = Buffer.from([0, 1, 2, 250, 255, 13, 10]);

  const subida = await fetch(`${aplicacion.direccion}/api/recorridos/p1/pasos/user-flow/adjunto?nombre=${encodeURIComponent("Flujo v2.png")}`, {
    method: "POST",
    headers: { "Content-Type": "application/octet-stream" },
    body: bytes,
  });
  assert.equal(subida.status, 200);
  const evidencia = (await subida.json()).datos.pasos.find((p) => p.id === "user-flow").contenido.evidencia;
  assert.equal(evidencia.tipo, "adjunto");
  assert.equal(evidencia.nombre, "Flujo v2.png");

  const bajada = await fetch(`${aplicacion.direccion}/api/recorridos/p1/pasos/user-flow/adjunto`);
  assert.equal(bajada.status, 200);
  assert.equal(bajada.headers.get("content-type"), "application/octet-stream");
  assert.match(bajada.headers.get("content-disposition"), /^attachment; filename="Flujo v2.png"/);
  assert.deepEqual(Buffer.from(await bajada.arrayBuffer()), bytes);

  const vacio = await fetch(`${aplicacion.direccion}/api/recorridos/p1/pasos/user-flow/adjunto?nombre=x.png`, { method: "POST", headers: { "Content-Type": "application/octet-stream" } });
  assert.equal(vacio.status, 400);
  const sinAdjunto = await pedirJson(aplicacion, "GET", "/api/recorridos/p1/pasos/wireframes/adjunto");
  assert.equal(sinAdjunto.estado, 404);
});

test("las rutas de registros añaden, editan y quitan entradas", async (t) => {
  const { aplicacion } = await arrancarAplicacion(t);
  await aplicacion.recorridos.crear("p1");
  const ruta = "/api/recorridos/p1/registros/gaps-y-supuestos/supuesto";

  const alta = await pedirJson(aplicacion, "POST", ruta, { campos: { codigo: "S1", supuesto: "La persona usa un solo equipo" } });
  assert.equal(alta.estado, 201);
  const { id } = alta.json.datos;

  const edicion = await pedirJson(aplicacion, "PUT", `${ruta}/${id}`, { campos: { codigo: "S1", supuesto: "Un solo equipo", estado: "Abierto" } });
  assert.equal(edicion.estado, 200);
  assert.equal(edicion.json.datos.campos.estado, "Abierto");
  const leido = await pedirJson(aplicacion, "GET", "/api/recorridos/p1");
  assert.equal(leido.json.datos.registros["gaps-y-supuestos"].supuesto[0].campos.supuesto, "Un solo equipo");

  const baja = await pedirJson(aplicacion, "DELETE", `${ruta}/${id}`);
  assert.equal(baja.estado, 200);
  assert.equal((await pedirJson(aplicacion, "GET", "/api/recorridos/p1")).json.datos.registros["gaps-y-supuestos"].supuesto.length, 0);
  assert.equal((await pedirJson(aplicacion, "DELETE", `${ruta}/${id}`)).estado, 404);
  assert.equal((await pedirJson(aplicacion, "POST", "/api/recorridos/p1/registros/acuerdos/supuesto", { campos: {} })).estado, 404);
  assert.equal((await pedirJson(aplicacion, "POST", ruta, { campos: { inventado: "x" } })).estado, 400);
});

test("un cambio con Origin ajeno sigue respondiendo 403: la protección de U1 cubre también las rutas de U3", async (t) => {
  const { aplicacion } = await arrancarAplicacion(t);
  await aplicacion.recorridos.crear("p1");
  const cuerpo = JSON.stringify({ estado: "completo" });

  const respuesta = await peticionCruda(aplicacion.puerto, {
    metodo: "PUT",
    ruta: "/api/recorridos/p1/pasos/hipotesis/estado",
    cabeceras: {
      Host: `127.0.0.1:${aplicacion.puerto}`,
      Origin: "https://sitio-malicioso.example",
      "Content-Type": "application/json",
      "Content-Length": String(Buffer.byteLength(cuerpo)),
    },
    cuerpo,
  });

  assert.equal(respuesta.estado, 403);
  assert.equal(respuesta.json().error.codigo, "ORIGEN_NO_PERMITIDO");
  assert.equal((await aplicacion.recorridos.obtener("p1")).pasos.hipotesis.estado, "pendiente", "el estado no cambia");
});
