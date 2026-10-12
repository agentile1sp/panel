// Pruebas del servicio del catálogo (U4) sobre una carpeta de datos temporal
// real, con el almacén de U1 y el servicio del recorrido de U3: listar con el
// paso actual (AC1.1, AC1.2), renombrar, borrar y las operaciones compuestas
// que se deshacen si la segunda escritura falla (Q4 de Units Generation).

import assert from "node:assert/strict";
import { test } from "node:test";
import { ARCHIVO_PRODUCTOS } from "../../src/catalogo/index.js";
import { crearPiezas } from "../ayudas/catalogo.js";

const HIPOTESIS = { completo: false, id: "hipotesis", nombre: "Hipótesis" };

test("crear tres productos y listarlos devuelve los tres, en orden, con su nombre y su paso actual; uno nuevo está en Hipótesis (AC1.1)", async (t) => {
  const { catalogo, recorridos, almacen } = await crearPiezas(t);
  await assert.rejects(catalogo.crear("   "), { codigo: "NOMBRE_OBLIGATORIO", estado: 400 });
  assert.equal(await almacen.existe(ARCHIVO_PRODUCTOS), false, "un nombre no válido no escribe nada");
  assert.deepEqual(await almacen.listar("recorridos"), []);

  const creados = [];
  for (const nombre of ["Recordatorio de agua", '  Club "de" lectura ', "Agenda de huerto"]) creados.push(await catalogo.crear(nombre));

  assert.equal(creados[1].nombre, 'Club "de" lectura', "se guarda sin los espacios de los lados");
  assert.match(creados[0].creadoEn, /^\d{4}-\d{2}-\d{2}T/);
  const lista = await catalogo.listar();
  assert.deepEqual(lista.map((p) => p.nombre), ["Recordatorio de agua", 'Club "de" lectura', "Agenda de huerto"]);
  assert.deepEqual(lista.map((p) => p.idProducto), creados.map((p) => p.idProducto));
  for (const producto of lista) {
    assert.deepEqual(producto.pasoActual, HIPOTESIS);
    assert.equal(await recorridos.existe(producto.idProducto), true, "cada producto tiene su recorrido");
  }
  assert.deepEqual((await catalogo.obtener(creados[2].idProducto)).nombre, "Agenda de huerto");
  await assert.rejects(catalogo.obtener("p-no-existe"), { codigo: "NO_EXISTE", estado: 404 });
});

test('un producto con los pasos 1 a 3 en Completo y el 4 en En curso aparece con paso actual "Mapa de piezas" (AC1.2)', async (t) => {
  const { catalogo, recorridos } = await crearPiezas(t);
  const { idProducto } = await catalogo.crear("A medias");
  for (const paso of ["hipotesis", "linea-base", "walking-skeleton"]) await recorridos.cambiarEstado(idProducto, paso, "completo");
  await recorridos.cambiarEstado(idProducto, "mapa-de-piezas", "en-curso");

  const [producto] = await catalogo.listar();

  assert.deepEqual(producto.pasoActual, { completo: false, id: "mapa-de-piezas", nombre: "Mapa de piezas" });
  assert.deepEqual((await catalogo.obtener(idProducto)).pasoActual, producto.pasoActual);
});

test("renombrar cambia el nombre y nombreDe lo devuelve; un nombre vacío no cambia nada y renombrar un producto inexistente da 404", async (t) => {
  const { catalogo } = await crearPiezas(t);
  const producto = await catalogo.crear("Nombre provisional");
  assert.equal(await catalogo.nombreDe(producto.idProducto), "Nombre provisional");

  const renombrado = await catalogo.renombrar(producto.idProducto, "  Nombre definitivo ñ ");

  assert.equal(renombrado.nombre, "Nombre definitivo ñ");
  assert.equal(renombrado.creadoEn, producto.creadoEn, "la fecha de creación no cambia");
  assert.deepEqual(renombrado.pasoActual, HIPOTESIS);
  assert.equal(await catalogo.nombreDe(producto.idProducto), "Nombre definitivo ñ");
  await assert.rejects(catalogo.renombrar(producto.idProducto, "\t "), { codigo: "NOMBRE_OBLIGATORIO", estado: 400 });
  assert.equal(await catalogo.nombreDe(producto.idProducto), "Nombre definitivo ñ", "un nombre no válido no cambia nada");
  await assert.rejects(catalogo.renombrar("p-no-existe", "Otro"), { codigo: "NO_EXISTE", estado: 404 });
  assert.equal(await catalogo.nombreDe("p-no-existe"), null, "nombreDe de un producto que no está en el catálogo es null");
});

test("borrar quita el producto y su recorrido, sin dejar nada apartado, y un servicio nuevo sobre la misma carpeta ya no lo ve; un producto sin recorrido se lista con el problema y se puede borrar", async (t) => {
  const { catalogo, recorridos, almacen, carpetaDatos, registro } = await crearPiezas(t);
  const queda = await catalogo.crear("Se queda");
  const sobra = await catalogo.crear("Se borra");
  await recorridos.guardarContenido(sobra.idProducto, "hipotesis", { campos: { "creo-que": "Algo que se borra" } });

  const borrado = await catalogo.borrar(sobra.idProducto);

  assert.equal(borrado.nombre, "Se borra");
  assert.equal(await recorridos.existe(sobra.idProducto), false, "el recorrido también se borra");
  assert.deepEqual(await almacen.listarApartados(), [], "no queda nada apartado");
  const { catalogo: otro } = await crearPiezas(t, { carpetaDatos });
  assert.deepEqual((await otro.listar()).map((p) => p.nombre), ["Se queda"]);
  await assert.rejects(catalogo.borrar(sobra.idProducto), { codigo: "NO_EXISTE", estado: 404 });

  // Un recorrido que falta (por ejemplo, borrado a mano) no impide ver ni borrar el catálogo.
  await almacen.descartar(await almacen.apartar(`recorridos/${queda.idProducto}`));
  const [huerfano] = await catalogo.listar();
  assert.equal(huerfano.pasoActual, null);
  assert.match(huerfano.problema, /No existe el recorrido/);
  assert.ok(registro.mensajes.error.some((m) => m.includes(queda.idProducto)), "el problema queda en la consola");
  await catalogo.borrar(queda.idProducto);
  assert.deepEqual(await catalogo.listar(), []);
});

test("si falla el guardado de productos.json al crear, el recorrido creado se deshace y no queda ni producto ni recorrido nuevos", async (t) => {
  const { catalogo, almacen, fallosCatalogo } = await crearPiezas(t);
  const previo = await catalogo.crear("Ya estaba");
  const antes = await almacen.leer(ARCHIVO_PRODUCTOS);
  fallosCatalogo.fallarEn("guardar", ARCHIVO_PRODUCTOS);

  await assert.rejects(catalogo.crear("Nuevo"), { codigo: "FALLO_PROVOCADO" });

  assert.deepEqual(fallosCatalogo.provocados, [{ operacion: "guardar", ruta: ARCHIVO_PRODUCTOS }], "el fallo ocurrió en la segunda escritura");
  assert.deepEqual(await almacen.leer(ARCHIVO_PRODUCTOS), antes, "productos.json queda como estaba");
  assert.deepEqual(await almacen.listar("recorridos"), [{ nombre: previo.idProducto, esCarpeta: true }], "solo queda el recorrido que ya estaba");
  assert.deepEqual(await almacen.listarApartados(), []);
  assert.deepEqual((await catalogo.listar()).map((p) => p.nombre), ["Ya estaba"]);
  assert.equal((await catalogo.crear("Nuevo")).nombre, "Nuevo", "después se puede crear con normalidad");
});

test("si falla el guardado de productos.json al borrar, el recorrido se recupera y el producto sigue completo, con su contenido", async (t) => {
  const { catalogo, recorridos, almacen, fallosCatalogo } = await crearPiezas(t);
  const { idProducto } = await catalogo.crear("Con contenido");
  await recorridos.guardarContenido(idProducto, "hipotesis", { campos: { "creo-que": 'La persona dirá "sí"\ncada día' } });
  await recorridos.cambiarEstado(idProducto, "hipotesis", "completo");
  fallosCatalogo.fallarEn("guardar", ARCHIVO_PRODUCTOS);

  await assert.rejects(catalogo.borrar(idProducto), { codigo: "FALLO_PROVOCADO" });

  const [producto] = await catalogo.listar();
  assert.equal(producto.idProducto, idProducto, "el producto sigue en el catálogo");
  assert.equal(producto.pasoActual.nombre, "Línea base");
  const recorrido = await recorridos.obtener(idProducto);
  assert.equal(recorrido.pasos.hipotesis.contenido.campos["creo-que"], 'La persona dirá "sí"\ncada día', "el recorrido vuelve con su contenido");
  assert.deepEqual(await almacen.listarApartados(), [], "no queda nada apartado");
});

test("si además falla el deshacer, se devuelve el error original y los dos errores quedan en la consola", async (t) => {
  const { catalogo, almacen, fallosCatalogo, fallosRecorridos, registro } = await crearPiezas(t);
  const existente = await catalogo.crear("Existente");

  // Crear: falla productos.json y también apartar el recorrido recién creado.
  fallosCatalogo.fallarEn("guardar", ARCHIVO_PRODUCTOS);
  fallosRecorridos.fallarEn("apartar", /^recorridos\//);
  await assert.rejects(catalogo.crear("Nuevo"), (error) => {
    assert.equal(error.codigo, "FALLO_PROVOCADO");
    assert.match(error.message, /guardar "catalogo\/productos\.json"/, "es el error original, no el del deshacer");
    return true;
  });
  assert.equal(registro.mensajes.error.length, 2);
  assert.match(registro.mensajes.error[0], /Falló al crear el producto "Nuevo".*guardar "catalogo\/productos\.json"/);
  assert.match(registro.mensajes.error[1], /no se pudo deshacer.*apartar "recorridos\/p-[0-9a-f]{12}".*recorrido sin producto/);

  // Borrar: falla productos.json y también recuperar el recorrido apartado.
  fallosCatalogo.fallarEn("guardar", ARCHIVO_PRODUCTOS);
  fallosRecorridos.fallarEn("recuperar", /./);
  await assert.rejects(catalogo.borrar(existente.idProducto), { codigo: "FALLO_PROVOCADO", message: /guardar "catalogo\/productos\.json"/ });
  assert.equal(registro.mensajes.error.length, 4);
  assert.match(registro.mensajes.error[2], /Falló al borrar el producto "Existente"/);
  assert.match(registro.mensajes.error[3], /no se pudo deshacer.*sigue apartado en \.apartado\//);
  assert.equal((await almacen.listarApartados()).length, 1, "lo apartado sigue en .apartado/ y U1 avisará al arrancar");
});
