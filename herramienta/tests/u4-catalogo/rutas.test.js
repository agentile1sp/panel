// Pruebas de la API local del catálogo (U4) contra la aplicación real
// arrancada en 127.0.0.1 con el puerto 0 y una carpeta de datos temporal:
// listar, crear (201 y 400), renombrar y borrar (404), el nombre en el
// recorrido de U3 y el control de origen de U1.

import assert from "node:assert/strict";
import { test } from "node:test";
import { arrancarAplicacion } from "../ayudas/catalogo.js";
import { peticionCruda } from "../ayudas/http.js";
import { pedirJson } from "../ayudas/recorrido.js";

/** Vacía el catálogo que la primera apertura llenó con los ejemplos. */
async function vaciarCatalogo(aplicacion) {
  for (const { idProducto } of (await pedirJson(aplicacion, "GET", "/api/productos")).json.datos) {
    assert.equal((await pedirJson(aplicacion, "DELETE", `/api/productos/${idProducto}`)).estado, 200);
  }
}

test("GET /api/productos devuelve los productos con nombre y paso actual; con el catálogo vacío devuelve una lista vacía", async (t) => {
  const { aplicacion } = await arrancarAplicacion(t);

  const conEjemplos = await pedirJson(aplicacion, "GET", "/api/productos");
  assert.equal(conEjemplos.estado, 200);
  assert.equal(conEjemplos.json.ok, true);
  assert.equal(conEjemplos.json.datos.length, 3, "la primera apertura trae los tres ejemplos");
  for (const producto of conEjemplos.json.datos) {
    assert.equal(typeof producto.nombre, "string");
    assert.equal(typeof producto.pasoActual.nombre, "string");
  }

  await vaciarCatalogo(aplicacion);
  const vacio = await pedirJson(aplicacion, "GET", "/api/productos");
  assert.equal(vacio.estado, 200);
  assert.deepEqual(vacio.json, { ok: true, datos: [] });
});

test('POST /api/productos con un nombre válido responde 201 y el producto tiene su recorrido; con un nombre vacío responde 400 con "El nombre es obligatorio"', async (t) => {
  const { aplicacion } = await arrancarAplicacion(t);

  const creado = await pedirJson(aplicacion, "POST", "/api/productos", { nombre: '  Producto "nuevo" ñ ' });
  assert.equal(creado.estado, 201);
  const { idProducto, nombre, pasoActual } = creado.json.datos;
  assert.equal(nombre, 'Producto "nuevo" ñ');
  assert.deepEqual(pasoActual, { completo: false, id: "hipotesis", nombre: "Hipótesis" });
  assert.equal(await aplicacion.recorridos.existe(idProducto), true, "tiene su recorrido");
  assert.equal((await pedirJson(aplicacion, "GET", `/api/productos/${idProducto}`)).json.datos.nombre, nombre);

  for (const cuerpo of [{ nombre: "" }, { nombre: "   " }, {}, undefined]) {
    const vacio = await pedirJson(aplicacion, "POST", "/api/productos", cuerpo);
    assert.equal(vacio.estado, 400, `cuerpo ${JSON.stringify(cuerpo)}`);
    assert.equal(vacio.json.ok, false);
    assert.equal(vacio.json.error.codigo, "NOMBRE_OBLIGATORIO");
    assert.match(vacio.json.error.mensaje, /^El nombre es obligatorio/);
  }
  const largo = await pedirJson(aplicacion, "POST", "/api/productos", { nombre: "x".repeat(101) });
  assert.equal(largo.estado, 400);
  assert.match(largo.json.error.mensaje, /más de 100 caracteres/);
  assert.equal((await pedirJson(aplicacion, "POST", "/api/productos", ["lista"])).estado, 400, "un cuerpo que no es un objeto se rechaza");
  assert.equal((await pedirJson(aplicacion, "GET", "/api/productos")).json.datos.length, 4, "los intentos no válidos no crean nada");
});

test("PUT /api/productos/:id renombra y DELETE /api/productos/:id borra; con un id inexistente responden 404", async (t) => {
  const { aplicacion } = await arrancarAplicacion(t);
  const { idProducto } = (await pedirJson(aplicacion, "POST", "/api/productos", { nombre: "Provisional" })).json.datos;

  const renombrado = await pedirJson(aplicacion, "PUT", `/api/productos/${idProducto}`, { nombre: "Definitivo" });
  assert.equal(renombrado.estado, 200);
  assert.equal(renombrado.json.datos.nombre, "Definitivo");
  assert.equal((await pedirJson(aplicacion, "PUT", `/api/productos/${idProducto}`, { nombre: " " })).estado, 400);

  const borrado = await pedirJson(aplicacion, "DELETE", `/api/productos/${idProducto}`);
  assert.equal(borrado.estado, 200);
  assert.equal(borrado.json.datos.nombre, "Definitivo");
  assert.equal(await aplicacion.recorridos.existe(idProducto), false, "el recorrido también se borra");
  assert.ok(!(await pedirJson(aplicacion, "GET", "/api/productos")).json.datos.some((p) => p.idProducto === idProducto));

  for (const [metodo, cuerpo] of [["GET"], ["PUT", { nombre: "Otro" }], ["DELETE"]]) {
    const respuesta = await pedirJson(aplicacion, metodo, `/api/productos/${idProducto}`, cuerpo);
    assert.equal(respuesta.estado, 404, `${metodo} de un producto borrado`);
    assert.equal(respuesta.json.error.codigo, "NO_EXISTE");
    assert.match(respuesta.json.error.mensaje, /No existe ningún producto/);
  }
  assert.equal((await pedirJson(aplicacion, "GET", "/api/productos/..%2Fcatalogo")).estado, 404, "un id raro tampoco existe");
});

test("tras crear un producto, GET /api/recorridos/:id (U3) devuelve su nombre gracias a nombreDe, también después de renombrarlo", async (t) => {
  const { aplicacion } = await arrancarAplicacion(t);
  const { idProducto } = (await pedirJson(aplicacion, "POST", "/api/productos", { nombre: "Con nombre" })).json.datos;

  const recorrido = await pedirJson(aplicacion, "GET", `/api/recorridos/${idProducto}`);
  assert.equal(recorrido.estado, 200);
  assert.equal(recorrido.json.datos.nombre, "Con nombre");

  await pedirJson(aplicacion, "PUT", `/api/productos/${idProducto}`, { nombre: "Renombrado" });
  assert.equal((await pedirJson(aplicacion, "GET", `/api/recorridos/${idProducto}`)).json.datos.nombre, "Renombrado");
});

test("un POST con Origin ajeno responde 403 y no crea nada: la protección de U1 cubre también las rutas de U4", async (t) => {
  const { aplicacion } = await arrancarAplicacion(t);
  const antes = (await pedirJson(aplicacion, "GET", "/api/productos")).json.datos.length;
  const cuerpo = JSON.stringify({ nombre: "Intruso" });
  const cabeceras = {
    Host: `127.0.0.1:${aplicacion.puerto}`,
    "Content-Type": "application/json",
    "Content-Length": String(Buffer.byteLength(cuerpo)),
  };

  const ajeno = await peticionCruda(aplicacion.puerto, { metodo: "POST", ruta: "/api/productos", cabeceras: { ...cabeceras, Origin: "https://sitio-malicioso.example" }, cuerpo });
  const cruzado = await peticionCruda(aplicacion.puerto, { metodo: "POST", ruta: "/api/productos", cabeceras: { ...cabeceras, "Sec-Fetch-Site": "cross-site" }, cuerpo });

  assert.equal(ajeno.estado, 403);
  assert.equal(ajeno.json().error.codigo, "ORIGEN_NO_PERMITIDO");
  assert.equal(cruzado.estado, 403);
  assert.equal((await pedirJson(aplicacion, "GET", "/api/productos")).json.datos.length, antes, "no se crea nada");
});
