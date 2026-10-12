// Pruebas de las reglas del recorrido (U3): paso actual (AC1.2), habilitación
// en cadena y bloqueo de dependientes (AC3.1 a AC3.3, ADR-004), estados
// válidos (FR3.1) y guardado de contenido (FR4.6, FR4.7).

import assert from "node:assert/strict";
import { before, test } from "node:test";
import { crearRecorridoVacio } from "../../src/recorrido/modelo.js";
import { cambiarEstado, estadoDePasos, guardarContenido, pasoActual } from "../../src/recorrido/reglas.js";
import { IDS_PASOS, cargarDefinicionReal } from "../ayudas/recorrido.js";

let definicion;
before(async () => {
  definicion = await cargarDefinicionReal();
});

/** Recorrido con los pasos indicados en Completo (en orden) y otros estados después. */
function recorridoCon(completos, otros = {}) {
  let recorrido = crearRecorridoVacio("p1", definicion);
  for (const id of completos) recorrido = cambiarEstado(recorrido, id, "completo", definicion);
  for (const [id, estado] of Object.entries(otros)) recorrido = cambiarEstado(recorrido, id, estado, definicion);
  return recorrido;
}

const pasoDe = (recorrido, id) => estadoDePasos(recorrido, definicion).find((p) => p.id === id);

test('con los pasos 1 a 3 en Completo y el 4 en En curso el paso actual es "Mapa de piezas" (AC1.2); con los 10 en Completo es "Completo"', () => {
  const aMedias = recorridoCon(IDS_PASOS.slice(0, 3), { "mapa-de-piezas": "en-curso" });
  assert.deepEqual(pasoActual(aMedias, definicion), { completo: false, id: "mapa-de-piezas", nombre: "Mapa de piezas" });

  const nuevo = crearRecorridoVacio("p2", definicion);
  assert.equal(pasoActual(nuevo, definicion).nombre, "Hipótesis");

  const terminado = recorridoCon(IDS_PASOS);
  assert.deepEqual(pasoActual(terminado, definicion), { completo: true, id: null, nombre: "Completo" });
});

test('con el paso 3 en En curso el paso 4 no se puede editar ni cambiar de estado y falta "Walking skeleton" (AC3.1)', () => {
  const recorrido = recorridoCon(["hipotesis", "linea-base"], { "walking-skeleton": "en-curso" });

  const paso4 = pasoDe(recorrido, "mapa-de-piezas");
  assert.equal(paso4.habilitado, false);
  assert.deepEqual(paso4.faltan, [{ id: "walking-skeleton", nombre: "Walking skeleton" }]);

  const esNoHabilitado = (error) => {
    assert.equal(error.name, "ErrorRecorrido");
    assert.equal(error.codigo, "PASO_NO_HABILITADO");
    assert.equal(error.estado, 409);
    assert.deepEqual(error.faltan.map((f) => f.nombre), ["Walking skeleton"]);
    assert.match(error.message, /Falta completar: Walking skeleton\./);
    return true;
  };
  assert.throws(() => guardarContenido(recorrido, "mapa-de-piezas", { campos: { pasada: "1" } }, definicion), esNoHabilitado);
  assert.throws(() => cambiarEstado(recorrido, "mapa-de-piezas", "en-curso", definicion), esNoHabilitado);
  assert.equal(pasoDe(recorrido, "hipotesis").habilitado, true, "el paso 1 siempre está habilitado");
});

test("con los pasos 1 a 3 en Completo el paso 4 se puede editar y cambiar de estado (AC3.2)", () => {
  const recorrido = recorridoCon(IDS_PASOS.slice(0, 3));
  assert.equal(pasoDe(recorrido, "mapa-de-piezas").habilitado, true);

  const conContenido = guardarContenido(recorrido, "mapa-de-piezas", { campos: { pasada: "1" }, elementos: { pieza: [{ id: "a", campos: { pieza: "Catálogo" } }] } }, definicion);
  const enCurso = cambiarEstado(conContenido, "mapa-de-piezas", "en-curso", definicion);

  assert.equal(enCurso.pasos["mapa-de-piezas"].estado, "en-curso");
  assert.equal(enCurso.pasos["mapa-de-piezas"].contenido.elementos.pieza[0].campos.pieza, "Catálogo");
  assert.equal(recorrido.pasos["mapa-de-piezas"].estado, "pendiente", "el recorrido anterior no cambia");
});

test("al devolver el paso 5 a En curso, el paso 6 conserva contenido y estado y queda bloqueado, y el bloqueo llega en cadena a los pasos 7 y 8 (AC3.3, ADR-004)", () => {
  let recorrido = recorridoCon(IDS_PASOS.slice(0, 5));
  recorrido = guardarContenido(recorrido, "user-flow", { checklist: { "momentos-en-el-flujo": true }, evidencia: { tipo: "enlace", url: "https://ejemplo.com/flujo" } }, definicion);
  recorrido = cambiarEstado(recorrido, "user-flow", "en-curso", definicion);
  const contenidoAntes = structuredClone(recorrido.pasos["user-flow"].contenido);

  const devuelto = cambiarEstado(recorrido, "fichas", "en-curso", definicion);

  assert.equal(devuelto.pasos["user-flow"].estado, "en-curso", "conserva su estado");
  assert.deepEqual(devuelto.pasos["user-flow"].contenido, contenidoAntes, "conserva su contenido");
  assert.equal(pasoDe(devuelto, "user-flow").habilitado, false);
  assert.deepEqual(pasoDe(devuelto, "user-flow").faltan.map((f) => f.id), ["fichas"]);
  assert.equal(pasoDe(devuelto, "story-map").habilitado, false, "el paso 7 también queda bloqueado");
  assert.ok(pasoDe(devuelto, "wireframes").faltan.some((f) => f.id === "fichas"), "el paso 8 depende del 5 solo de forma indirecta y también queda bloqueado");
  assert.throws(() => guardarContenido(devuelto, "user-flow", { checklist: {} }, definicion), { codigo: "PASO_NO_HABILITADO" });
});

test("un estado desconocido se rechaza", () => {
  const recorrido = crearRecorridoVacio("p1", definicion);
  for (const estado of ["terminado", "Completo", "", undefined, 3]) {
    assert.throws(() => cambiarEstado(recorrido, "hipotesis", estado, definicion), { codigo: "ESTADO_NO_VALIDO", estado: 400 }, `rechaza ${String(estado)}`);
  }
  assert.throws(() => cambiarEstado(recorrido, "paso-inventado", "completo", definicion), { codigo: "PASO_DESCONOCIDO", estado: 404 });
});

test("guardar contenido no cambia el estado del paso (FR4.7)", () => {
  const pendiente = crearRecorridoVacio("p1", definicion);
  const guardado = guardarContenido(pendiente, "hipotesis", { campos: { "creo-que": "algo" } }, definicion, "2026-10-12T10:00:00.000Z");

  assert.equal(guardado.pasos.hipotesis.estado, "pendiente");
  assert.equal(guardado.pasos.hipotesis.contenido.campos["creo-que"], "algo");
  assert.equal(guardado.pasos.hipotesis.actualizadoEn, "2026-10-12T10:00:00.000Z");

  const completo = cambiarEstado(pendiente, "hipotesis", "completo", definicion);
  assert.equal(guardarContenido(completo, "hipotesis", { campos: {} }, definicion).pasos.hipotesis.estado, "completo");
  assert.throws(() => guardarContenido(pendiente, "hipotesis", { campos: { inventado: "x" } }, definicion), { codigo: "CONTENIDO_NO_VALIDO", estado: 400 });
});

test("guardar el contenido de un paso no cambia ningún otro paso ni copia nada de ellos (FR4.6)", () => {
  let recorrido = recorridoCon(IDS_PASOS.slice(0, 6));
  recorrido = guardarContenido(recorrido, "fichas", { elementos: { "ficha-capacidad": [{ id: "c1", campos: { nombre: "Recordatorios" } }] } }, definicion);
  const otrosAntes = structuredClone(Object.fromEntries(Object.entries(recorrido.pasos).filter(([id]) => id !== "story-map")));

  const despues = guardarContenido(recorrido, "story-map", { elementos: { "fila-crud": [{ id: "f1", campos: { objeto: "Recordatorio" } }, { id: "f2", campos: { objeto: "Registro" } }] } }, definicion);

  const otrosDespues = Object.fromEntries(Object.entries(despues.pasos).filter(([id]) => id !== "story-map"));
  assert.deepEqual(otrosDespues, otrosAntes, "los demás pasos quedan exactamente igual");
  const storyMap = despues.pasos["story-map"].contenido;
  assert.equal(storyMap.elementos["fila-crud"].length, 2);
  assert.deepEqual(storyMap.elementos.historia, [], "no aparece nada copiado de las fichas (AC4.2)");
  assert.equal(storyMap.campos["leyenda-de-codigos"], "");
});
