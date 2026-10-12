// Pruebas de integración de U3 contra la API de la aplicación real:
//   - un recorrido completo por los 10 pasos, guardando contenido y marcando
//     cada uno Completo (AC2.2, AC2.3; criterios de éxito E1 y E4 a nivel de
//     recorrido);
//   - el recorrido y su adjunto siguen ahí al reiniciar la aplicación sobre la
//     misma carpeta (AC6.1).

import assert from "node:assert/strict";
import { test } from "node:test";
import { IDS_PASOS, arrancarAplicacion, llevarHasta, pedirJson } from "../ayudas/recorrido.js";

/** Contenido de ejemplo para un paso, con todos sus campos, un elemento de cada tipo, la checklist y un enlace. */
function contenidoDeEjemplo(paso) {
  const valor = (campo, donde) => (campo.tipo === "lista" ? [`${campo.nombre} (${donde}) 1`, `${campo.nombre} (${donde}) 2`] : `${campo.nombre} en "${donde}"\ncon ñ y ü`);
  const contenido = { campos: Object.fromEntries(paso.campos.map((campo) => [campo.id, valor(campo, paso.nombre)])) };
  if (paso.elementos) {
    contenido.elementos = Object.fromEntries(
      paso.elementos.map((tipo) => [tipo.id, [{ campos: Object.fromEntries(tipo.campos.map((campo) => [campo.id, valor(campo, tipo.nombre)])) }]]),
    );
  }
  if (paso.checklist) contenido.checklist = Object.fromEntries(paso.checklist.map((punto) => [punto.id, true]));
  if (paso.evidencia) contenido.evidencia = { tipo: "enlace", url: `https://ejemplo.com/${paso.id}` };
  return contenido;
}

test("un recorrido llevado por los 10 pasos, guardando contenido y marcando cada uno Completo, termina en Completo y cada paso conserva su contenido (AC2.2, AC2.3)", async (t) => {
  const { aplicacion } = await arrancarAplicacion(t);
  await aplicacion.recorridos.crear("ficticio");
  const { json: proceso } = await pedirJson(aplicacion, "GET", "/api/proceso");
  const enviados = {};

  for (const paso of proceso.datos.pasos) {
    const antes = await pedirJson(aplicacion, "GET", "/api/recorridos/ficticio");
    assert.equal(antes.json.datos.pasoActual.nombre, paso.nombre, `antes de completar "${paso.nombre}" es el paso actual`);
    assert.equal(antes.json.datos.pasos.find((p) => p.id === paso.id).habilitado, true);

    enviados[paso.id] = contenidoDeEjemplo(paso);
    const guardado = await pedirJson(aplicacion, "PUT", `/api/recorridos/ficticio/pasos/${paso.id}/contenido`, enviados[paso.id]);
    assert.equal(guardado.estado, 200, `se guarda el contenido de "${paso.nombre}"`);
    const completo = await pedirJson(aplicacion, "PUT", `/api/recorridos/ficticio/pasos/${paso.id}/estado`, { estado: "completo" });
    assert.equal(completo.estado, 200, `"${paso.nombre}" se marca Completo`);
  }

  const { json } = await pedirJson(aplicacion, "GET", "/api/recorridos/ficticio");
  const vista = json.datos;
  assert.deepEqual(vista.pasoActual, { completo: true, id: null, nombre: "Completo" });
  assert.deepEqual(vista.pasos.map((p) => p.estado), IDS_PASOS.map(() => "completo"));
  assert.equal(await aplicacion.recorridos.pasoActual("ficticio").then((p) => p.nombre), "Completo", "el servicio que usará U4 también lo ve");
  for (const paso of vista.pasos) {
    const enviado = enviados[paso.id];
    assert.deepEqual(paso.contenido.campos, enviado.campos, `"${paso.nombre}" conserva sus campos`);
    for (const [tipo, lista] of Object.entries(enviado.elementos ?? {})) {
      assert.deepEqual(paso.contenido.elementos[tipo].map((e) => e.campos), lista.map((e) => e.campos), `"${paso.nombre}" conserva sus elementos "${tipo}"`);
    }
    if (enviado.checklist) assert.deepEqual(paso.contenido.checklist, enviado.checklist);
    if (enviado.evidencia) assert.deepEqual(paso.contenido.evidencia, enviado.evidencia);
  }
});

test("al reiniciar la aplicación sobre la misma carpeta, el recorrido y su adjunto siguen ahí (AC6.1)", async (t) => {
  const { aplicacion: primera, carpetaDatos } = await arrancarAplicacion(t, { detenerAlTerminar: false });
  const bytes = Buffer.from("contenido binario \u0000ÿ del user flow");
  try {
    await llevarHasta(primera.recorridos, "p1", IDS_PASOS.slice(0, 5));
    await pedirJson(primera, "PUT", "/api/recorridos/p1/pasos/linea-base/contenido", { campos: { creencias: ["Lo resuelvo con notas"] } });
    await pedirJson(primera, "PUT", "/api/recorridos/p1/pasos/user-flow/estado", { estado: "en-curso" });
    const subida = await fetch(`${primera.direccion}/api/recorridos/p1/pasos/user-flow/adjunto?nombre=flujo.bin`, {
      method: "POST",
      headers: { "Content-Type": "application/octet-stream" },
      body: bytes,
    });
    assert.equal(subida.status, 200);
  } finally {
    await primera.detener();
  }

  const { aplicacion: segunda } = await arrancarAplicacion(t, { carpetaDatos });
  const { estado, json } = await pedirJson(segunda, "GET", "/api/recorridos/p1");
  assert.equal(estado, 200);
  const lineaBase = json.datos.pasos.find((p) => p.id === "linea-base");
  assert.equal(lineaBase.estado, "completo");
  assert.deepEqual(lineaBase.contenido.campos.creencias, ["Lo resuelvo con notas"]);
  const userFlow = json.datos.pasos.find((p) => p.id === "user-flow");
  assert.equal(userFlow.estado, "en-curso");
  assert.equal(userFlow.contenido.evidencia.nombre, "flujo.bin");
  assert.equal(json.datos.pasoActual.nombre, "User flow");

  const bajada = await fetch(`${segunda.direccion}/api/recorridos/p1/pasos/user-flow/adjunto`);
  assert.equal(bajada.status, 200);
  assert.deepEqual(Buffer.from(await bajada.arrayBuffer()), bytes);
});
