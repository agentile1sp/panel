// Pruebas del nombre y del id de un producto (U4): nombre obligatorio (AC1.3),
// límite de 100 caracteres, caracteres especiales que se conservan e ids que
// cumplen la regla de U3; y la lectura de la forma de productos.json.

import assert from "node:assert/strict";
import { test } from "node:test";
import { asegurarFormaCatalogo } from "../../src/catalogo/modelo.js";
import { nuevoIdProducto, validarNombre } from "../../src/catalogo/nombre.js";
import { PATRON_ID } from "../../src/recorrido/modelo.js";

test("un nombre normal se acepta y se le quitan los espacios de los lados", () => {
  assert.equal(validarNombre("Recordatorio de agua"), "Recordatorio de agua");
  assert.equal(validarNombre("  Club de lectura \t\n"), "Club de lectura");
  assert.equal(validarNombre("A"), "A", "basta con un carácter");
  assert.equal(validarNombre("Dos  espacios  dentro"), "Dos  espacios  dentro", "los espacios de dentro se conservan");
});

test('un nombre vacío, solo con espacios o que no es texto se rechaza con "El nombre es obligatorio" (AC1.3)', () => {
  for (const nombre of ["", "   ", "\t\n ", undefined, null, 42, ["Producto"]]) {
    assert.throws(
      () => validarNombre(nombre),
      (error) => {
        assert.equal(error.name, "ErrorCatalogo");
        assert.equal(error.codigo, "NOMBRE_OBLIGATORIO");
        assert.equal(error.estado, 400);
        assert.match(error.message, /^El nombre es obligatorio/);
        return true;
      },
      `rechaza ${JSON.stringify(nombre)}`,
    );
  }
});

test("un nombre de más de 100 caracteres se rechaza; uno de 100 exactos, contados como caracteres y no como bytes, se acepta", () => {
  assert.equal(validarNombre("x".repeat(100)), "x".repeat(100));
  assert.equal(validarNombre("ñ".repeat(100)), "ñ".repeat(100), "100 eñes ocupan 200 bytes pero son 100 caracteres");
  assert.equal(validarNombre(`  ${"y".repeat(100)}  `), "y".repeat(100), "los espacios de los lados no cuentan");
  assert.throws(() => validarNombre("x".repeat(101)), { codigo: "NOMBRE_DEMASIADO_LARGO", estado: 400, message: "El nombre no puede tener más de 100 caracteres." });
  assert.throws(() => validarNombre("😀".repeat(101)), { codigo: "NOMBRE_DEMASIADO_LARGO" });
});

test("un nombre con comillas, acentos, símbolos y emojis se conserva exactamente igual", () => {
  for (const nombre of ['App "Agua" ¡ya!', "Ñandú & Cía. <beta>", "Lectura · 100 % 😀", "O'Reilly / v2\\final", "Ünïcödé — ¿sí?"]) {
    assert.equal(validarNombre(nombre), nombre);
  }
});

test("nuevoIdProducto cumple la regla de ids de U3 y no repite en 1000 llamadas; la lectura de productos.json rechaza ids que U3 no aceptaría", () => {
  const ids = new Set();
  for (let i = 0; i < 1000; i += 1) {
    const id = nuevoIdProducto();
    assert.match(id, /^p-[0-9a-f]{12}$/);
    assert.match(id, PATRON_ID, "U3 acepta el id");
    ids.add(id);
  }
  assert.equal(ids.size, 1000);

  const valido = { version: 1, productos: [{ idProducto: "p-0123456789ab", nombre: "Uno", creadoEn: "x", actualizadoEn: "x", extra: true }] };
  assert.deepEqual(asegurarFormaCatalogo(valido), valido, "conserva lo que no conoce");
  for (const danado of [{}, { productos: {} }, { productos: [{ idProducto: "../fuera", nombre: "x" }] }, { productos: [{ idProducto: "p1" }] }, { productos: [{ idProducto: "p1", nombre: "a" }, { idProducto: "p1", nombre: "b" }] }]) {
    assert.throws(() => asegurarFormaCatalogo(danado), { codigo: "CATALOGO_DANADO", estado: 500 }, JSON.stringify(danado));
  }
});
