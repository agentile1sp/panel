// Pruebas de los productos de ejemplo de la primera apertura (U4): se cargan
// solo la primera vez (AC6.2, AC6.3, ADR-006), nunca sobrescriben datos
// (FR6.3), se deshacen por completo si algo falla a medias (Q4) y el archivo
// proceso/ejemplos.json es coherente con la definición del proceso (R-04).

import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { ARCHIVO_PRIMERA_APERTURA, ARCHIVO_PRODUCTOS, cargarEjemplosSiPrimeraApertura, leerEjemplos } from "../../src/catalogo/index.js";
import { tieneContenido } from "../../src/recorrido/modelo.js";
import { crearPiezas } from "../ayudas/catalogo.js";
import { crearCarpetaTemporal } from "../ayudas/carpeta-temporal.js";
import { IDS_PASOS } from "../ayudas/recorrido.js";

/** Carga los ejemplos con las piezas dadas (por defecto, con el almacén del catálogo). */
function cargar({ almacen, fallosCatalogo, recorridos, catalogo, registro }, opciones = {}) {
  return cargarEjemplosSiPrimeraApertura({ almacen: fallosCatalogo?.almacen ?? almacen, recorridos, catalogo, registro, ...opciones });
}

test('con la carpeta de datos vacía se cargan tres productos en distintos puntos del recorrido: uno sin empezar, uno en "Mapa de piezas" y uno "Completo" (AC6.2)', async (t) => {
  const piezas = await crearPiezas(t);
  const { catalogo, recorridos, almacen } = piezas;

  const resultado = await cargar(piezas);

  assert.equal(resultado.cargados, 3);
  assert.equal(resultado.motivo, "primera-apertura");
  const lista = await catalogo.listar();
  assert.equal(lista.length, 3);
  assert.ok(lista.every((p) => p.nombre.startsWith("Ejemplo: ")), "los nombres dejan claro que son ficticios");
  assert.deepEqual(lista.map((p) => p.pasoActual.nombre), ["Hipótesis", "Mapa de piezas", "Completo"]);
  assert.deepEqual(lista.map((p) => p.pasoActual.completo), [false, false, true]);
  const sinEmpezar = await recorridos.obtener(lista[0].idProducto);
  assert.ok(IDS_PASOS.every((id) => sinEmpezar.pasos[id].estado === "pendiente"), "el primero está sin empezar");
  const aMedias = await recorridos.obtener(lista[1].idProducto);
  assert.equal(aMedias.pasos["mapa-de-piezas"].estado, "en-curso");
  assert.equal(await almacen.existe(ARCHIVO_PRIMERA_APERTURA), true, "se escribe la marca de primera apertura");
  assert.deepEqual(await almacen.listarApartados(), []);
});

test("al volver a abrir no se cargan otra vez, y un ejemplo borrado no vuelve (AC6.3)", async (t) => {
  const piezas = await crearPiezas(t);
  await cargar(piezas);
  const [, borrado] = await piezas.catalogo.listar();
  await piezas.catalogo.borrar(borrado.idProducto);

  const otraVez = await crearPiezas(t, { carpetaDatos: piezas.carpetaDatos });
  const resultado = await cargar(otraVez);

  assert.equal(resultado.cargados, 0);
  assert.equal(resultado.motivo, "ya-abierta");
  const nombres = (await otraVez.catalogo.listar()).map((p) => p.nombre);
  assert.equal(nombres.length, 2);
  assert.ok(!nombres.includes(borrado.nombre), "el ejemplo borrado no vuelve");
});

test("con un catálogo vaciado a propósito, los ejemplos no se vuelven a cargar", async (t) => {
  const piezas = await crearPiezas(t);
  await cargar(piezas);
  for (const producto of await piezas.catalogo.listar()) await piezas.catalogo.borrar(producto.idProducto);

  const resultado = await cargar(await crearPiezas(t, { carpetaDatos: piezas.carpetaDatos }));

  assert.equal(resultado.motivo, "ya-abierta");
  assert.deepEqual(await piezas.catalogo.listar(), []);
  assert.deepEqual(await piezas.almacen.listar("recorridos"), []);
});

test("con productos guardados pero sin la marca, no se cargan, no se toca lo existente y solo se escribe la marca", async (t) => {
  const piezas = await crearPiezas(t);
  const mio = await piezas.catalogo.crear("Mi producto");
  const antes = await piezas.almacen.leer(ARCHIVO_PRODUCTOS);
  assert.equal(await piezas.almacen.existe(ARCHIVO_PRIMERA_APERTURA), false);

  const resultado = await cargar(piezas);

  assert.equal(resultado.motivo, "datos-previos");
  assert.equal(resultado.cargados, 0);
  assert.deepEqual(await piezas.almacen.leer(ARCHIVO_PRODUCTOS), antes, "productos.json no cambia");
  assert.deepEqual(await piezas.almacen.listar("recorridos"), [{ nombre: mio.idProducto, esCarpeta: true }]);
  assert.equal(typeof (await piezas.almacen.leer(ARCHIVO_PRIMERA_APERTURA)).ejemplosCargadosEn, "string");
  assert.equal((await cargar(piezas)).motivo, "ya-abierta");
});

test("si falla la escritura de la marca, se deshacen los recorridos sembrados y productos.json queda como estaba; el siguiente arranque los carga", async (t) => {
  const piezas = await crearPiezas(t);
  piezas.fallosCatalogo.fallarEn("guardar", ARCHIVO_PRIMERA_APERTURA);

  await assert.rejects(cargar(piezas), { codigo: "FALLO_PROVOCADO" });

  assert.deepEqual(piezas.fallosCatalogo.provocados.map((f) => f.ruta), [ARCHIVO_PRIMERA_APERTURA], "falló la última escritura");
  assert.equal(await piezas.almacen.existe(ARCHIVO_PRODUCTOS), false, "productos.json vuelve a no existir");
  assert.equal(await piezas.almacen.existe(ARCHIVO_PRIMERA_APERTURA), false);
  assert.deepEqual(await piezas.almacen.listar("recorridos"), [], "no queda ningún recorrido sembrado");
  assert.deepEqual(await piezas.almacen.listarApartados(), []);
  assert.deepEqual(piezas.registro.mensajes.error, [], "el deshacer funcionó, no hay nada más que avisar");

  const reintento = await cargar(piezas);
  assert.equal(reintento.cargados, 3);
});

test("proceso/ejemplos.json pasa la validación de la siembra de U3: sin pasos incoherentes ni adjuntos; un archivo de ejemplos no válido no escribe nada", async (t) => {
  const ejemplos = await leerEjemplos();
  assert.equal(ejemplos.length, 3);
  const { recorridos, almacen } = await crearPiezas(t);
  const sembrados = [];
  for (const [indice, ejemplo] of ejemplos.entries()) {
    const evidencias = Object.values(ejemplo.recorrido.pasos ?? {}).map((p) => p.contenido?.evidencia?.tipo).filter(Boolean);
    assert.ok(evidencias.every((tipo) => tipo === "enlace"), `${ejemplo.nombre}: solo enlaces, ningún adjunto`);
    sembrados.push((await recorridos.sembrar(`ejemplo-${indice}`, ejemplo.recorrido)).recorrido);
  }
  const completo = sembrados[2];
  for (const id of IDS_PASOS) {
    assert.equal(completo.pasos[id].estado, "completo", `paso ${id} del ejemplo completo`);
    assert.ok(tieneContenido(completo.pasos[id].contenido), `el paso ${id} del ejemplo completo tiene contenido`);
  }
  const aMedias = sembrados[1];
  assert.deepEqual(IDS_PASOS.slice(0, 4).map((id) => aMedias.pasos[id].estado), ["completo", "completo", "completo", "en-curso"]);
  assert.ok(IDS_PASOS.slice(0, 4).every((id) => tieneContenido(aMedias.pasos[id].contenido)), "los pasos 1 a 4 del ejemplo a medias tienen contenido");

  // Un archivo de ejemplos que falta o no es válido se rechaza sin escribir nada.
  const carpeta = await crearCarpetaTemporal(t, "herramienta-u4-ejemplos-");
  const malo = path.join(carpeta, "ejemplos.json");
  await writeFile(malo, JSON.stringify({ version: 1, productos: [{ nombre: "  ", recorrido: {} }, { nombre: "Sin recorrido" }] }), "utf8");
  await assert.rejects(leerEjemplos(malo), (error) => {
    assert.equal(error.codigo, "EJEMPLOS_NO_VALIDOS");
    assert.equal(error.problemas.length, 2);
    assert.ok(error.message.includes(malo), "el mensaje nombra el archivo");
    return true;
  });
  await assert.rejects(leerEjemplos(path.join(carpeta, "no-existe.json")), { codigo: "EJEMPLOS_NO_DISPONIBLES" });
  const vacia = await crearPiezas(t);
  await assert.rejects(cargar(vacia, { rutaEjemplos: malo }), { codigo: "EJEMPLOS_NO_VALIDOS" });
  assert.equal(await vacia.almacen.existe(ARCHIVO_PRODUCTOS), false);
  assert.equal(await vacia.almacen.existe(ARCHIVO_PRIMERA_APERTURA), false);
  assert.deepEqual(await vacia.almacen.listar("recorridos"), [], "no se siembra ningún recorrido");
  assert.deepEqual(await almacen.listarApartados(), []);
});
