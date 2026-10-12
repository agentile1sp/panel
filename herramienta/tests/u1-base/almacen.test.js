// Pruebas del almacén de archivos (FR6.1, NFR1, contrato de deshacer R-02).

import assert from "node:assert/strict";
import { chmod, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { crearAlmacen } from "../../src/base/almacen.js";
import { ErrorAlmacen } from "../../src/base/errores.js";
import { crearCarpetaTemporal } from "../ayudas/carpeta-temporal.js";

const esRoot = typeof process.getuid === "function" && process.getuid() === 0;

test("guardar y leer devuelven lo mismo, incluidos comillas, saltos de línea y caracteres especiales", async (t) => {
  const almacen = crearAlmacen(await crearCarpetaTemporal(t));
  const datos = {
    nombre: 'Producto "Ñandú" de prueba',
    notas: "Línea 1\nLínea 2\r\n\tTabulada \\ barra",
    simbolos: "€ ✓ 😀   <b>&amp;</b>",
    lista: [1, 2.5, true, null, { anidado: "sí" }],
  };

  const anterior = await almacen.guardar("productos/p1/datos.json", datos);
  const leido = await almacen.leer("productos/p1/datos.json");

  assert.equal(anterior, null);
  assert.deepEqual(leido, datos);
  const enDisco = await readFile(path.join(almacen.carpetaDatos, "productos/p1/datos.json"), "utf8");
  assert.match(enDisco, /^\{\n {2}"nombre": /, "el archivo es JSON con sangría y legible");
  assert.ok(enDisco.includes("Ñandú"), "el archivo se guarda en UTF-8 sin escapar los acentos");
});

test("un guardado que falla deja intacto el archivo anterior y lanza ErrorAlmacen", { skip: esRoot && "root ignora los permisos de carpeta" }, async (t) => {
  const almacen = crearAlmacen(await crearCarpetaTemporal(t));
  await almacen.guardar("sub/datos.json", { version: 1 });
  const carpeta = path.join(almacen.carpetaDatos, "sub");
  await chmod(carpeta, 0o555); // carpeta sin permiso de escritura: el temporal no se puede crear
  try {
    await assert.rejects(almacen.guardar("sub/datos.json", { version: 2 }), (error) => {
      assert.ok(error instanceof ErrorAlmacen);
      assert.equal(error.codigo, "ESCRITURA_FALLIDA");
      assert.match(error.message, /se conserva el contenido anterior/);
      return true;
    });
  } finally {
    await chmod(carpeta, 0o755); // permite borrar la carpeta temporal al terminar
  }

  assert.deepEqual(await almacen.leer("sub/datos.json"), { version: 1 });
  assert.deepEqual(await readdir(carpeta), ["datos.json"], "no quedan archivos temporales");
});

test("guardar devuelve el contenido anterior y restaurar lo deja como estaba, también si no existía", async (t) => {
  const almacen = crearAlmacen(await crearCarpetaTemporal(t));
  await almacen.guardar("estado.json", { paso: 1 });

  const anterior = await almacen.guardar("estado.json", { paso: 2 });
  assert.deepEqual(anterior, { paso: 1 });
  await almacen.restaurar("estado.json", anterior);
  assert.deepEqual(await almacen.leer("estado.json"), { paso: 1 });

  const anteriorNuevo = await almacen.guardar("nuevo.json", { creado: true });
  assert.equal(anteriorNuevo, null);
  await almacen.restaurar("nuevo.json", anteriorNuevo);
  assert.equal(await almacen.existe("nuevo.json"), false);
});

test("apartar y recuperar devuelven una carpeta con varios archivos a su sitio; descartar la borra", async (t) => {
  const almacen = crearAlmacen(await crearCarpetaTemporal(t));
  await almacen.guardar("productos/p1/producto.json", { nombre: "P1" });
  await almacen.guardar("productos/p1/recorrido.json", { pasos: [] });
  await almacen.guardarBinario("productos/p1/adjuntos/plano.bin", Buffer.from([1, 2, 3]));

  const marca = await almacen.apartar("productos/p1");
  assert.equal(await almacen.existe("productos/p1"), false);
  assert.deepEqual((await almacen.listarApartados()).map((a) => [a.marca, a.ruta]), [[marca, "productos/p1"]]);

  assert.equal(await almacen.recuperar(marca), "productos/p1");
  assert.deepEqual(await almacen.leer("productos/p1/producto.json"), { nombre: "P1" });
  assert.deepEqual(await almacen.leer("productos/p1/recorrido.json"), { pasos: [] });
  assert.deepEqual(await almacen.leerBinario("productos/p1/adjuntos/plano.bin"), Buffer.from([1, 2, 3]));
  assert.deepEqual(await almacen.listarApartados(), []);

  const otraMarca = await almacen.apartar("productos/p1");
  await almacen.descartar(otraMarca);
  assert.equal(await almacen.existe("productos/p1"), false);
  assert.deepEqual(await almacen.listarApartados(), []);
  await assert.rejects(almacen.recuperar(otraMarca), { codigo: "NO_EXISTE" });
  await assert.rejects(almacen.recuperar("../no-es-marca"), { codigo: "MARCA_NO_VALIDA" });
});

test("una ruta con ../ o que sale de la carpeta de datos es rechazada sin escribir nada", async (t) => {
  const base = await crearCarpetaTemporal(t);
  const almacen = crearAlmacen(path.join(base, "datos"));
  const rutasMaliciosas = ["../fuera.json", "a/../../fuera.json", "/fuera.json", ".apartado/x.json", "a\\..\\fuera.json", "a\u0000.json"];

  for (const ruta of rutasMaliciosas) {
    await assert.rejects(almacen.guardar(ruta, { malo: true }), (error) => {
      assert.ok(error instanceof ErrorAlmacen, `debería rechazar ${JSON.stringify(ruta)}`);
      assert.equal(error.codigo, "RUTA_NO_VALIDA");
      return true;
    });
  }

  assert.deepEqual(await readdir(base), [], "no se ha creado nada, ni siquiera la carpeta de datos");
});

test("leer un JSON dañado lanza ErrorAlmacen con el nombre del archivo", async (t) => {
  const carpeta = await crearCarpetaTemporal(t);
  const almacen = crearAlmacen(carpeta);
  await writeFile(path.join(carpeta, "roto.json"), '{"nombre": "sin cerrar"', "utf8");

  await assert.rejects(almacen.leer("roto.json"), (error) => {
    assert.ok(error instanceof ErrorAlmacen);
    assert.equal(error.codigo, "ARCHIVO_DANADO");
    assert.match(error.message, /roto\.json/);
    return true;
  });
  await assert.rejects(almacen.guardar("roto.json", { nuevo: true }), { codigo: "ARCHIVO_DANADO" });
  assert.equal(await readFile(path.join(carpeta, "roto.json"), "utf8"), '{"nombre": "sin cerrar"', "no se pisa un archivo dañado");
});

test("listar, existe y borrar trabajan solo con lo visible y borrar devuelve el contenido anterior", async (t) => {
  const almacen = crearAlmacen(await crearCarpetaTemporal(t));
  await almacen.guardar("productos/b.json", { id: "b" });
  await almacen.guardar("productos/a.json", { id: "a" });
  await almacen.guardar("productos/sub/c.json", { id: "c" });
  await almacen.apartar("productos/sub");

  assert.deepEqual(await almacen.listar("productos"), [
    { nombre: "a.json", esCarpeta: false },
    { nombre: "b.json", esCarpeta: false },
  ]);
  assert.deepEqual(await almacen.listar(), [{ nombre: "productos", esCarpeta: true }], "la carpeta .apartado no se lista");
  assert.deepEqual(await almacen.listar("no-existe"), []);

  assert.deepEqual(await almacen.borrar("productos/a.json"), { id: "a" });
  assert.equal(await almacen.existe("productos/a.json"), false);
  assert.equal(await almacen.borrar("productos/a.json"), null, "borrar algo que no existe no falla");
});
