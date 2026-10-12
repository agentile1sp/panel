// Pruebas de las consultas de la definición del proceso (FR5, FR5.2 y soporte
// a FR3.3): pasos en orden, orígenes directos e indirectos (ADR-004), ids
// desconocidos y solo lectura. Usan la definición real a través del punto de
// entrada público de U2.

import assert from "node:assert/strict";
import { test } from "node:test";
import { CARPETA_PLANTILLAS, RUTA_DEFINICION_POR_DEFECTO } from "../../src/base/config.js";
import { ErrorDefinicion } from "../../src/base/errores.js";
import { cargarDefinicion } from "../../src/definicion/index.js";
import { crearDefinicion } from "../../src/definicion/definicion.js";
import { leerDefinicionReal } from "../ayudas/definicion-temporal.js";

const IDS_EN_ORDEN = [
  "hipotesis",
  "linea-base",
  "walking-skeleton",
  "mapa-de-piezas",
  "fichas",
  "user-flow",
  "story-map",
  "wireframes",
  "cierre-del-alcance",
  "mockups",
];

const cargarReal = () => cargarDefinicion({ rutaDefinicion: RUTA_DEFINICION_POR_DEFECTO, carpetaPlantillas: CARPETA_PLANTILLAS });

test("pasos() devuelve los 10 pasos en orden y paso(\"story-map\") devuelve el paso 7", async () => {
  const definicion = await cargarReal();
  const desordenada = await leerDefinicionReal();
  desordenada.pasos.reverse();

  assert.deepEqual(definicion.pasos().map((p) => p.id), IDS_EN_ORDEN);
  assert.deepEqual(definicion.pasos().map((p) => p.orden), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.equal(definicion.paso("story-map").orden, 7);
  assert.equal(definicion.paso("story-map").nombre, "Story map");
  assert.deepEqual(crearDefinicion(desordenada).pasos().map((p) => p.id), IDS_EN_ORDEN, "ordena por orden aunque el archivo venga desordenado");
  assert.deepEqual(definicion.registros().map((r) => r.id), ["acuerdos", "gaps-y-supuestos"]);
  assert.equal(definicion.registro("gaps-y-supuestos").nombre, "Gaps y supuestos");
});

test("origenesDirectos(\"story-map\") es mapa de piezas, fichas y user flow; origenesTodos(\"story-map\") son los pasos 1 a 6", async () => {
  const definicion = await cargarReal();

  assert.deepEqual(definicion.origenesDirectos("story-map"), ["mapa-de-piezas", "fichas", "user-flow"]);
  assert.deepEqual(definicion.origenesTodos("story-map"), IDS_EN_ORDEN.slice(0, 6));
  assert.deepEqual(definicion.origenesTodos("user-flow"), IDS_EN_ORDEN.slice(0, 5), "user flow solo toma de fichas, pero depende en cadena de los pasos 1 a 5");
});

test("origenesTodos(\"hipotesis\") está vacío y origenesTodos(\"mockups\") son los pasos 1 a 9", async () => {
  const definicion = await cargarReal();

  assert.deepEqual(definicion.origenesDirectos("hipotesis"), []);
  assert.deepEqual(definicion.origenesTodos("hipotesis"), []);
  assert.deepEqual(definicion.origenesDirectos("mockups"), ["wireframes", "cierre-del-alcance"]);
  assert.deepEqual(definicion.origenesTodos("mockups"), IDS_EN_ORDEN.slice(0, 9));
});

test("un id de paso o de registro desconocido lanza ErrorDefinicion", async () => {
  const definicion = await cargarReal();

  for (const consulta of ["paso", "origenesDirectos", "origenesTodos"]) {
    assert.throws(() => definicion[consulta]("idea-escogida"), (error) => {
      assert.ok(error instanceof ErrorDefinicion);
      assert.equal(error.codigo, "PASO_DESCONOCIDO");
      assert.match(error.message, /"idea-escogida"/);
      return true;
    }, consulta);
  }
  assert.throws(() => definicion.registro("acuerdo"), { name: "ErrorDefinicion", codigo: "REGISTRO_DESCONOCIDO" });
  assert.throws(() => definicion.paso(undefined), { codigo: "PASO_DESCONOCIDO" });
});

test("la definición no se puede modificar y no tiene ninguna operación de cambio (FR5.2, AC5.2 en código)", async () => {
  const definicion = await cargarReal();
  const paso = definicion.paso("fichas");

  // Los módulos ES se ejecutan en modo estricto: cambiar un objeto congelado lanza TypeError.
  assert.throws(() => {
    paso.nombre = "Otro nombre";
  }, TypeError);
  assert.throws(() => {
    paso.elementos[0].campos.push({ id: "nuevo", nombre: "Nuevo", tipo: "texto" });
  }, TypeError);
  assert.throws(() => definicion.pasos().push({ id: "nuevo-paso" }), TypeError);
  assert.throws(() => definicion.pasos().reverse(), TypeError);
  assert.throws(() => definicion.origenesTodos("mockups").pop(), TypeError);
  assert.throws(() => {
    definicion.agregarPaso = () => undefined;
  }, TypeError);
  assert.throws(() => {
    delete definicion.registros().at(0).elementos;
  }, TypeError);
  assert.deepEqual(Object.keys(definicion).sort(), ["origenesDirectos", "origenesTodos", "paso", "pasos", "registro", "registros"]);
  assert.equal(definicion.paso("fichas").nombre, "Fichas");
  assert.equal(definicion.pasos().length, 10);
});
