// Pruebas del modelo del recorrido (U3): recorrido vacío (AC2.1) y validación
// del contenido de los pasos y de las entradas de registro contra la
// definición real del proceso (FR4.1 a FR4.5, AC4.1, AC4.3, AC4.4, R-03).

import assert from "node:assert/strict";
import { before, test } from "node:test";
import { crearRecorridoVacio, normalizarContenido, validarContenido, validarEntrada } from "../../src/recorrido/modelo.js";
import { IDS_PASOS, cargarDefinicionReal } from "../ayudas/recorrido.js";

let definicion;
before(async () => {
  definicion = await cargarDefinicionReal();
});

test("un recorrido nuevo tiene los 10 pasos en orden y en Pendiente, con el contenido vacío, y los registros vacíos (AC2.1)", () => {
  const recorrido = crearRecorridoVacio("p1", definicion);

  assert.equal(recorrido.idProducto, "p1");
  assert.deepEqual(Object.keys(recorrido.pasos), IDS_PASOS);
  for (const id of IDS_PASOS) {
    assert.equal(recorrido.pasos[id].estado, "pendiente", `el paso ${id} empieza en Pendiente`);
    assert.equal(recorrido.pasos[id].actualizadoEn, null);
    assert.equal(recorrido.pasos[id].contenido.evidencia, null);
  }
  assert.deepEqual(recorrido.pasos.hipotesis.contenido.campos["criterios-de-corte"], []);
  assert.equal(recorrido.pasos.hipotesis.contenido.campos["creo-que"], "");
  assert.deepEqual(recorrido.pasos.fichas.contenido.elementos, { "ficha-capacidad": [], "ficha-instancia": [] });
  assert.deepEqual(recorrido.pasos["user-flow"].contenido.checklist, {
    "pasos-terminan-en-pantalla": false,
    "momentos-en-el-flujo": false,
    "excepcion-por-momento": false,
  });
  assert.deepEqual(recorrido.registros, { acuerdos: { acuerdo: [] }, "gaps-y-supuestos": { gap: [], supuesto: [] } });
});

test("un contenido con los campos de la plantilla del paso se acepta, y uno con un campo desconocido se rechaza nombrándolo", () => {
  const hipotesis = definicion.paso("hipotesis");
  const valido = { campos: { fecha: "2026-10-12", "creo-que": "La persona lo usará a diario", "criterios-de-corte": ["Si nadie lo abre en una semana"] } };

  assert.deepEqual(validarContenido(hipotesis, valido), []);

  const problemas = validarContenido(hipotesis, { campos: { fecha: "2026-10-12", "campo-inventado": "x", duracion: 3 } });
  assert.equal(problemas.length, 2, "devuelve todos los problemas juntos");
  assert.ok(problemas.some((p) => p.includes('"campo-inventado"')), "nombra el campo desconocido");
  assert.ok(problemas.some((p) => p.includes('"Duración"') && p.includes("un texto")), "nombra el campo con el tipo equivocado");
  assert.deepEqual(validarContenido(hipotesis, { campos: { "criterios-de-corte": "no es una lista" } }).length, 1);
  assert.deepEqual(validarContenido(hipotesis, "texto suelto"), ["El contenido debe ser un objeto."]);
  assert.equal(validarContenido(hipotesis, { otraCosa: {} }).length, 1, "rechaza partes desconocidas del contenido");
});

test("un paso estructurado acepta dos fichas de capacidad y una de instancia (AC4.1) y rechaza un tipo de elemento desconocido", () => {
  const fichas = definicion.paso("fichas");
  const contenido = {
    elementos: {
      "ficha-capacidad": [
        { id: "c1", campos: { nombre: "Recordatorios", "criterios-de-aceptacion": ["Dado X, cuando Y, entonces Z"] } },
        { id: "c2", campos: { nombre: "Registro diario" } },
      ],
      "ficha-instancia": [{ id: "i1", campos: { nombre: "Recordatorio de agua", capacidad: "Recordatorios" } }],
    },
  };

  assert.deepEqual(validarContenido(fichas, contenido), []);
  const normalizado = normalizarContenido(fichas, contenido);
  assert.equal(normalizado.elementos["ficha-capacidad"].length, 2);
  assert.equal(normalizado.elementos["ficha-instancia"].length, 1);
  assert.equal(normalizado.elementos["ficha-capacidad"][1].campos["job-story"], "", "los campos que faltan quedan vacíos");

  const desconocido = validarContenido(fichas, { elementos: { "ficha-inventada": [] } });
  assert.equal(desconocido.length, 1);
  assert.match(desconocido[0], /no admite elementos de tipo "ficha-inventada"/);
  const repetido = validarContenido(fichas, { elementos: { "ficha-capacidad": [{ id: "c1" }, { id: "c1" }] } });
  assert.ok(repetido.some((p) => p.includes('repite el id "c1"')));
  assert.equal(validarContenido(definicion.paso("hipotesis"), { elementos: { pieza: [] } }).length, 1, "un paso de texto no admite elementos");
});

test("un paso visual acepta su checklist y un enlace https, y rechaza enlaces javascript: o file: (AC4.3, R-03)", () => {
  const userFlow = definicion.paso("user-flow");
  const checklist = { "pasos-terminan-en-pantalla": true, "momentos-en-el-flujo": false };

  assert.deepEqual(validarContenido(userFlow, { checklist, evidencia: { tipo: "enlace", url: "https://www.figma.com/file/abc" } }), []);
  assert.deepEqual(validarContenido(userFlow, { evidencia: { tipo: "enlace", url: "http://localhost/flujo" } }), []);

  for (const url of ["javascript:alert(1)", "file:///etc/passwd", "ftp://servidor/flujo", "no es una url", " https://espacios.com"]) {
    const problemas = validarContenido(userFlow, { evidencia: { tipo: "enlace", url } });
    assert.equal(problemas.length, 1, `rechaza ${url}`);
    assert.match(problemas[0], /http:\/\/ o https:\/\//);
  }
  assert.equal(validarContenido(userFlow, { checklist: { "casilla-inventada": true } }).length, 1);
  assert.equal(validarContenido(userFlow, { checklist: { "momentos-en-el-flujo": "sí" } }).length, 1);
  assert.equal(validarContenido(definicion.paso("fichas"), { evidencia: { tipo: "enlace", url: "https://a.com" } }).length, 1, "un paso no visual no admite enlace");
});

test("un texto con comillas, saltos de línea y caracteres especiales pasa sin cambios (AC4.4)", () => {
  const hipotesis = definicion.paso("hipotesis");
  const texto = 'Dijo "sí" y luego\nescribió: <b>¡Ñandú!</b> 100 % & más… \\ \t 😀';
  const contenido = { campos: { "creo-que": texto, "criterios-de-corte": ["línea con \"comillas\"", "otra <línea> & más"] } };

  assert.deepEqual(validarContenido(hipotesis, contenido), []);
  const normalizado = normalizarContenido(hipotesis, contenido);
  assert.equal(normalizado.campos["creo-que"], texto);
  assert.deepEqual(normalizado.campos["criterios-de-corte"], contenido.campos["criterios-de-corte"]);
  assert.deepEqual(JSON.parse(JSON.stringify(normalizado)).campos["creo-que"], texto, "sobrevive al paso por JSON");
});

test("una entrada de registro con un tipo de elemento desconocido o campos ajenos se rechaza", () => {
  const acuerdos = definicion.registro("acuerdos");
  const gaps = definicion.registro("gaps-y-supuestos");

  assert.deepEqual(validarEntrada(acuerdos, "acuerdo", { codigo: "A1", decision: "Todo se introduce a mano" }), []);
  assert.deepEqual(validarEntrada(gaps, "supuesto", { supuesto: "La persona tiene Node instalado" }), []);

  const tipoDesconocido = validarEntrada(acuerdos, "gap", { gap: "x" });
  assert.equal(tipoDesconocido.length, 1);
  assert.match(tipoDesconocido[0], /no tiene entradas de tipo "gap"/);
  assert.ok(validarEntrada(gaps, "gap", { decision: "x" })[0].includes('"decision"'), "nombra el campo que no es del tipo");
  assert.equal(validarEntrada(acuerdos, "acuerdo", ["no", "objeto"]).length, 1);
});
