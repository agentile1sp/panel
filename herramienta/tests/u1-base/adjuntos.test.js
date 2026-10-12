// Pruebas de los adjuntos: saneado de nombres, límite de tamaño y adjuntos
// siempre dentro de la carpeta de datos (FR6.1, hallazgo R-03).

import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { crearAdjuntos, sanearNombre, TAMANO_MAXIMO_ADJUNTO } from "../../src/base/adjuntos.js";
import { crearAlmacen } from "../../src/base/almacen.js";
import { ErrorAdjunto } from "../../src/base/errores.js";
import { crearCarpetaTemporal } from "../ayudas/carpeta-temporal.js";

async function prepararAdjuntos(t) {
  const base = await crearCarpetaTemporal(t);
  const almacen = crearAlmacen(path.join(base, "datos"));
  return { base, almacen, adjuntos: crearAdjuntos(almacen) };
}

test("un adjunto con nombre normal se guarda y se lee igual", async (t) => {
  const { almacen, adjuntos } = await prepararAdjuntos(t);
  const contenido = Buffer.from("%PDF-1.7 contenido de prueba ñ", "utf8");

  const guardado = await adjuntos.guardarAdjunto("productos/p1/adjuntos", "Informe final.pdf", contenido);
  const leido = await adjuntos.leerAdjunto(guardado.ruta);

  assert.equal(guardado.nombre, "Informe final.pdf");
  assert.equal(guardado.tamano, contenido.byteLength);
  assert.match(guardado.ruta, /^productos\/p1\/adjuntos\/[0-9a-f]{16}-Informe final\.pdf$/);
  assert.deepEqual(leido, { contenido, nombre: "Informe final.pdf" });
  assert.equal(await adjuntos.leerAdjunto("productos/p1/adjuntos/0123456789abcdef-no-existe.pdf"), null);
  assert.ok(await almacen.existe(guardado.ruta));
});

test("nombres con rutas como ../../etc/passwd, ..\\x o /abs/ruta quedan dentro de la carpeta de datos", async (t) => {
  const { base, almacen, adjuntos } = await prepararAdjuntos(t);
  const casos = [
    ["../../etc/passwd", "passwd"],
    ["..\\x", "x"],
    ["/abs/ruta", "ruta"],
    ["C:\\Windows\\system32\\evil.exe", "evil.exe"],
    ["..", "adjunto"],
    ["  ...oculto.txt  ", "oculto.txt"],
    ['a<b>c:d"e|f?g*h\u0000i.txt', "abcdefghi.txt"],
  ];

  for (const [nombre, esperado] of casos) {
    assert.equal(sanearNombre(nombre), esperado, `sanearNombre(${JSON.stringify(nombre)})`);
    const { ruta } = await adjuntos.guardarAdjunto("adjuntos", nombre, Buffer.from("x"));
    const absoluta = almacen.rutaAbsoluta(ruta);
    assert.equal(path.dirname(absoluta), path.join(almacen.carpetaDatos, "adjuntos"));
  }

  assert.deepEqual(await readdir(base), ["datos"], "no se ha escrito nada fuera de la carpeta de datos");
  assert.equal(Array.from(sanearNombre(`${"a".repeat(150)}.pdf`)).length, 100);
  assert.ok(sanearNombre(`${"a".repeat(150)}.pdf`).endsWith(".pdf"), "al recortar se conserva la extensión");
});

test("un nombre vacío o solo con caracteres no válidos se guarda como adjunto", async (t) => {
  const { adjuntos } = await prepararAdjuntos(t);

  for (const nombre of ["", "   ", "///", "\u0000\u0001", "<>:|?*", undefined, 42]) {
    assert.equal(sanearNombre(nombre), "adjunto", `sanearNombre(${JSON.stringify(nombre)})`);
  }
  const guardado = await adjuntos.guardarAdjunto("adjuntos", "?*?", Buffer.from("x"));
  assert.equal(guardado.nombre, "adjunto");
  assert.equal((await adjuntos.leerAdjunto(guardado.ruta)).nombre, "adjunto");
});

test("un archivo de más de 10 MB es rechazado con ErrorAdjunto sin dejar nada escrito", async (t) => {
  const { base, adjuntos } = await prepararAdjuntos(t);
  const demasiadoGrande = Buffer.alloc(TAMANO_MAXIMO_ADJUNTO + 1);

  await assert.rejects(adjuntos.guardarAdjunto("adjuntos", "grande.bin", demasiadoGrande), (error) => {
    assert.ok(error instanceof ErrorAdjunto);
    assert.equal(error.codigo, "TAMANO_EXCEDIDO");
    assert.match(error.message, /10,0 MB/);
    return true;
  });
  await assert.rejects(adjuntos.guardarAdjunto("adjuntos", "texto.txt", "no es binario"), { codigo: "CONTENIDO_NO_VALIDO" });
  await assert.rejects(adjuntos.leerAdjunto("productos/p1/producto.json"), { codigo: "RUTA_NO_VALIDA" });

  assert.deepEqual(await readdir(base), [], "no se ha creado ningún archivo ni carpeta");
  const justoEnElLimite = await adjuntos.guardarAdjunto("adjuntos", "limite.bin", Buffer.alloc(TAMANO_MAXIMO_ADJUNTO));
  assert.equal(justoEnElLimite.tamano, TAMANO_MAXIMO_ADJUNTO, "exactamente 10 MB sí se acepta");
});

test("dos adjuntos con el mismo nombre no se pisan", async (t) => {
  const { adjuntos } = await prepararAdjuntos(t);

  const primero = await adjuntos.guardarAdjunto("adjuntos", "foto.png", Buffer.from("primera"));
  const segundo = await adjuntos.guardarAdjunto("adjuntos", "foto.png", Buffer.from("segunda"));

  assert.notEqual(primero.ruta, segundo.ruta);
  assert.equal((await adjuntos.leerAdjunto(primero.ruta)).contenido.toString(), "primera");
  assert.equal((await adjuntos.leerAdjunto(segundo.ruta)).contenido.toString(), "segunda");
  assert.equal((await adjuntos.leerAdjunto(segundo.ruta)).nombre, "foto.png");
});
