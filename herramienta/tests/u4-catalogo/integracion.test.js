// Pruebas de integración de U4 contra la API de la aplicación real:
//   - un producto ficticio creado desde el catálogo y llevado por los 10 pasos
//     con las rutas de U3 termina como "Completo" en el catálogo (AC2.2,
//     criterio de éxito E1); por el camino el catálogo muestra siempre el paso
//     actual correcto (E3) y cada paso conserva lo creado en él (E4);
//   - la primera apertura real trae los tres ejemplos, y un ejemplo borrado no
//     vuelve al reiniciar (AC6.2, AC6.3).

import assert from "node:assert/strict";
import { test } from "node:test";
import { arrancarAplicacion } from "../ayudas/catalogo.js";
import { IDS_PASOS, pedirJson } from "../ayudas/recorrido.js";

/** Contenido de ejemplo para un paso: todos sus campos, un elemento de cada tipo, la checklist y un enlace. */
function contenidoDeEjemplo(paso) {
  const valor = (campo, donde) => (campo.tipo === "lista" ? [`${campo.nombre} (${donde}) 1`, `${campo.nombre} (${donde}) 2`] : `${campo.nombre} en "${donde}"\ncon ñ y ü`);
  const contenido = { campos: Object.fromEntries(paso.campos.map((campo) => [campo.id, valor(campo, paso.nombre)])) };
  if (paso.elementos) {
    contenido.elementos = Object.fromEntries(
      paso.elementos.map((tipo) => [tipo.id, [{ campos: Object.fromEntries(tipo.campos.map((campo) => [campo.id, valor(campo, tipo.nombre)])) }]]),
    );
  }
  if (paso.checklist) contenido.checklist = Object.fromEntries(paso.checklist.map((punto) => [punto.id, true]));
  if (paso.evidencia) contenido.evidencia = { tipo: "enlace", url: `https://www.example.com/ficticio/${paso.id}` };
  return contenido;
}

async function enCatalogo(aplicacion, idProducto) {
  const { json } = await pedirJson(aplicacion, "GET", "/api/productos");
  return json.datos.find((p) => p.idProducto === idProducto);
}

test('un producto ficticio creado en el catálogo y llevado por los 10 pasos aparece como "Completo"; el catálogo muestra en cada momento su paso actual y cada paso conserva lo creado (AC2.2, E1, E3, E4)', async (t) => {
  const { aplicacion } = await arrancarAplicacion(t);
  const creado = await pedirJson(aplicacion, "POST", "/api/productos", { nombre: "Producto ficticio de prueba" });
  assert.equal(creado.estado, 201);
  const { idProducto } = creado.json.datos;
  const { json: proceso } = await pedirJson(aplicacion, "GET", "/api/proceso");
  const enviados = {};

  for (const paso of proceso.datos.pasos) {
    assert.deepEqual((await enCatalogo(aplicacion, idProducto)).pasoActual, { completo: false, id: paso.id, nombre: paso.nombre }, `E3: antes de completar "${paso.nombre}" el catálogo lo muestra como paso actual`);
    enviados[paso.id] = contenidoDeEjemplo(paso);
    const guardado = await pedirJson(aplicacion, "PUT", `/api/recorridos/${idProducto}/pasos/${paso.id}/contenido`, enviados[paso.id]);
    assert.equal(guardado.estado, 200, `se guarda el contenido de "${paso.nombre}"`);
    const completo = await pedirJson(aplicacion, "PUT", `/api/recorridos/${idProducto}/pasos/${paso.id}/estado`, { estado: "completo" });
    assert.equal(completo.estado, 200, `"${paso.nombre}" se marca Completo`);
  }

  const final = await enCatalogo(aplicacion, idProducto);
  assert.equal(final.nombre, "Producto ficticio de prueba");
  assert.deepEqual(final.pasoActual, { completo: true, id: null, nombre: "Completo" }, "E1: el catálogo muestra el producto como Completo");

  const { json } = await pedirJson(aplicacion, "GET", `/api/recorridos/${idProducto}`);
  assert.equal(json.datos.nombre, "Producto ficticio de prueba", "el recorrido muestra el nombre del catálogo");
  assert.deepEqual(json.datos.pasos.map((p) => p.estado), IDS_PASOS.map(() => "completo"));
  for (const paso of json.datos.pasos) {
    const enviado = enviados[paso.id];
    assert.deepEqual(paso.contenido.campos, enviado.campos, `E4: "${paso.nombre}" conserva sus campos`);
    for (const [tipo, lista] of Object.entries(enviado.elementos ?? {})) {
      assert.deepEqual(paso.contenido.elementos[tipo].map((e) => e.campos), lista.map((e) => e.campos), `E4: "${paso.nombre}" conserva sus elementos "${tipo}"`);
    }
    if (enviado.checklist) assert.deepEqual(paso.contenido.checklist, enviado.checklist);
    if (enviado.evidencia) assert.deepEqual(paso.contenido.evidencia, enviado.evidencia);
  }
});

test("la primera apertura real muestra los tres ejemplos en el catálogo; un ejemplo borrado no vuelve al reiniciar (AC6.2, AC6.3)", async (t) => {
  const { aplicacion: primera, carpetaDatos, registro } = await arrancarAplicacion(t, { detenerAlTerminar: false });
  let borrado;
  try {
    assert.ok(registro.mensajes.log.some((m) => m.includes("se han cargado 3 productos de ejemplo")), "la consola avisa de la carga");
    const { json } = await pedirJson(primera, "GET", "/api/productos");
    assert.equal(json.datos.length, 3);
    assert.deepEqual(json.datos.map((p) => p.pasoActual.nombre), ["Hipótesis", "Mapa de piezas", "Completo"], "en distintos puntos del recorrido");
    const catalogo = await (await fetch(`${primera.direccion}/`)).text();
    assert.match(catalogo, /Catálogo de productos/, "la página inicial es el catálogo");
    borrado = json.datos[1];
    assert.equal((await pedirJson(primera, "DELETE", `/api/productos/${borrado.idProducto}`)).estado, 200);
  } finally {
    await primera.detener();
  }

  const { aplicacion: segunda, registro: registroSegunda } = await arrancarAplicacion(t, { carpetaDatos });
  const { json } = await pedirJson(segunda, "GET", "/api/productos");
  assert.equal(json.datos.length, 2, "no se vuelven a cargar los ejemplos");
  assert.ok(!json.datos.some((p) => p.idProducto === borrado.idProducto || p.nombre === borrado.nombre), "el ejemplo borrado no vuelve");
  assert.ok(!registroSegunda.mensajes.log.some((m) => m.includes("productos de ejemplo")));
  assert.equal((await pedirJson(segunda, "GET", `/api/recorridos/${borrado.idProducto}`)).estado, 404, "su recorrido tampoco");
  assert.deepEqual(registroSegunda.mensajes.warn, [], "no queda nada apartado de qué avisar");
});
