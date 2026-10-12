// Pruebas de las pantallas de U3 sin navegador: la lógica de pantalla en
// módulos puros (public/js/logica-*.js) y el HTML servido por la aplicación
// (español, JavaScript y CSS en archivos, sin <script> en línea y controles con
// etiqueta) (NFR2, NFR4, R-03).

import assert from "node:assert/strict";
import { before, test } from "node:test";
import { crearControlCampo } from "../../public/js/dom.js";
import {
  comprobarEnlace,
  contenidoAFormulario,
  controlAValor,
  controlDeCampo,
  formularioAContenido,
  nombreEnMinusculas,
  valorAControl,
} from "../../public/js/logica-paso.js";
import { leerParametros, textoEstado, textoFaltan, textoPasoActual, urlPaso } from "../../public/js/logica-recorrido.js";
import { arrancarAplicacion, cargarDefinicionReal } from "../ayudas/recorrido.js";

const PANTALLAS = ["recorrido.html", "paso.html", "registros.html"];

let definicion;
before(async () => {
  definicion = await cargarDefinicionReal();
});

test('el texto de cada estado es "Pendiente", "En curso" o "Completo", y un paso bloqueado produce "Falta completar: Walking skeleton"', () => {
  assert.equal(textoEstado("pendiente"), "Pendiente");
  assert.equal(textoEstado("en-curso"), "En curso");
  assert.equal(textoEstado("completo"), "Completo");
  assert.equal(textoEstado("otro"), "Estado desconocido");

  assert.equal(textoFaltan([{ id: "walking-skeleton", nombre: "Walking skeleton" }]), "Falta completar: Walking skeleton");
  assert.equal(textoFaltan([{ nombre: "Hipótesis" }, { nombre: "Línea base" }, { nombre: "Walking skeleton" }]), "Falta completar: Hipótesis, Línea base y Walking skeleton");
  assert.equal(textoFaltan([]), "", "un paso habilitado no muestra nada");
  assert.equal(textoPasoActual({ completo: false, nombre: "Mapa de piezas" }), "Paso actual: Mapa de piezas");
  assert.match(textoPasoActual({ completo: true, nombre: "Completo" }), /^Paso actual: Completo/);
  assert.deepEqual(leerParametros("?producto=p%201&paso=fichas"), { producto: "p 1", paso: "fichas", registro: null });
  assert.equal(urlPaso("p 1", "fichas"), "paso.html?producto=p+1&paso=fichas");
});

test("cada tipo de campo produce su control y la conversión del formulario al contenido y de vuelta conserva los datos, también los caracteres especiales", () => {
  const hipotesis = definicion.paso("hipotesis");
  const campo = (id) => hipotesis.campos.find((c) => c.id === id);
  assert.equal(controlDeCampo(campo("fecha")).control, "input", "texto: una línea");
  assert.equal(controlDeCampo(campo("creo-que")).control, "textarea", "texto largo: área de texto");
  const lista = controlDeCampo(campo("criterios-de-corte"));
  assert.equal(lista.control, "textarea");
  assert.equal(lista.esLista, true);
  assert.match(lista.ayuda, /una entrada por línea/);
  assert.equal(lista.etiqueta, "Paro o cambio de rumbo si");
  assert.deepEqual(controlAValor(campo("criterios-de-corte"), "uno\r\n\n  \ndos \"b\""), ["uno", 'dos "b"'], "las líneas vacías no cuentan");
  assert.equal(valorAControl(campo("criterios-de-corte"), ["a", "b"]), "a\nb");

  const especial = 'Dijo "sí"\ny <b>¡Ñandú!</b> & 100 % 😀';
  const fichas = definicion.paso("fichas");
  const contenidoFichas = {
    campos: {},
    elementos: {
      "ficha-capacidad": [{ id: "c1", campos: { nombre: especial, "criterios-de-aceptacion": ["Dado <x>", 'cuando "y"'] } }],
      "ficha-instancia": [{ id: "i1", campos: { nombre: "Agua" } }],
    },
  };
  const ida = formularioAContenido(fichas, contenidoAFormulario(fichas, contenidoFichas));
  assert.deepEqual(ida.problemas, []);
  assert.equal(ida.contenido.elementos["ficha-capacidad"][0].campos.nombre, especial);
  assert.deepEqual(ida.contenido.elementos["ficha-capacidad"][0].campos["criterios-de-aceptacion"], ["Dado <x>", 'cuando "y"']);
  assert.equal(ida.contenido.elementos["ficha-instancia"][0].id, "i1", "conserva el id de cada elemento");

  const userFlow = definicion.paso("user-flow");
  const visual = { checklist: { "momentos-en-el-flujo": true }, evidencia: { tipo: "adjunto", idAdjunto: "0123456789abcdef-flujo.png", nombre: "flujo.png" } };
  const vuelta = formularioAContenido(userFlow, contenidoAFormulario(userFlow, visual)).contenido;
  assert.deepEqual(vuelta.evidencia, visual.evidencia);
  assert.equal(vuelta.checklist["momentos-en-el-flujo"], true);
  assert.equal(vuelta.checklist["excepcion-por-momento"], false);
  const nuevoElemento = formularioAContenido(fichas, { elementos: { "ficha-capacidad": [{ id: null, campos: { nombre: "Nueva" } }] } });
  assert.equal("id" in nuevoElemento.contenido.elementos["ficha-capacidad"][0], false, "un elemento nuevo va sin id y lo pone la herramienta");
  assert.equal(nombreEnMinusculas("Ficha de capacidad"), "ficha de capacidad");
  assert.equal(nombreEnMinusculas("CRUD"), "CRUD");
});

test("la comprobación de enlaces acepta https://... y rechaza javascript:... antes de enviar", () => {
  assert.equal(comprobarEnlace("https://www.figma.com/file/abc").valido, true);
  assert.equal(comprobarEnlace("  http://localhost:8080/flujo  ").valido, true, "los espacios de los bordes se quitan al enviar");
  for (const url of ["javascript:alert(1)", "file:///etc/passwd", "data:text/html,hola", "", "figma.com/file"]) {
    const resultado = comprobarEnlace(url);
    assert.equal(resultado.valido, false, `rechaza ${JSON.stringify(url)}`);
    assert.match(resultado.mensaje, /http:\/\/ o https:\/\//);
  }
  const userFlow = definicion.paso("user-flow");
  const conEnlaceMalo = formularioAContenido(userFlow, { evidencia: { tipo: "enlace", url: "javascript:alert(1)", adjunto: null } });
  assert.equal(conEnlaceMalo.problemas.length, 1, "no se envía un enlace que no sea http o https");
  const conEnlace = formularioAContenido(userFlow, { evidencia: { tipo: "enlace", url: " https://a.com/b ", adjunto: null } });
  assert.deepEqual(conEnlace.contenido.evidencia, { tipo: "enlace", url: "https://a.com/b" });
  assert.equal(formularioAContenido(userFlow, { evidencia: { tipo: "adjunto", url: "", adjunto: null } }).problemas.length, 1, "pide subir el adjunto antes");
});

test("las tres pantallas se sirven en español, cargan su JavaScript y su CSS desde archivos y no tienen script ni estilos en línea", async (t) => {
  const { aplicacion } = await arrancarAplicacion(t);
  for (const pantalla of PANTALLAS) {
    const respuesta = await fetch(`${aplicacion.direccion}/${pantalla}`);
    assert.equal(respuesta.status, 200, `${pantalla} se sirve`);
    assert.match(respuesta.headers.get("content-security-policy"), /default-src 'self'/);
    const html = await respuesta.text();
    assert.match(html, /<html lang="es">/, `${pantalla} está en español`);
    assert.match(html, /<link rel="stylesheet" href="\/css\/estilos\.css" \/>/);
    const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)];
    assert.ok(scripts.length > 0, `${pantalla} carga su JavaScript`);
    for (const [, atributos, cuerpo] of scripts) {
      assert.match(atributos, /src="\/js\/[a-z-]+\.js"/, `${pantalla}: el script viene de un archivo`);
      assert.equal(cuerpo.trim(), "", `${pantalla}: sin JavaScript en línea`);
    }
    assert.doesNotMatch(html, /<style\b|\sstyle="|\son[a-z]+="/i, `${pantalla}: sin estilos ni manejadores en línea`);
    for (const archivo of [...scripts.map(([, a]) => /src="([^"]+)"/.exec(a)[1]), "/css/estilos.css", "/js/api.js", "/js/dom.js", "/js/logica-paso.js", "/js/logica-recorrido.js"]) {
      assert.equal((await fetch(`${aplicacion.direccion}${archivo}`)).status, 200, `${archivo} se sirve`);
    }
  }
});

test("cada control de formulario de las tres pantallas tiene una etiqueta asociada, también los que se construyen desde la definición", async (t) => {
  const { aplicacion } = await arrancarAplicacion(t);
  let controles = 0;
  for (const pantalla of PANTALLAS) {
    const html = await (await fetch(`${aplicacion.direccion}/${pantalla}`)).text();
    const etiquetas = new Set([...html.matchAll(/<label\b[^>]*\bfor="([^"]+)"/g)].map((m) => m[1]));
    for (const [etiqueta] of html.matchAll(/<(input|select|textarea)\b[^>]*>/g)) {
      controles += 1;
      const id = /\bid="([^"]+)"/.exec(etiqueta)?.[1];
      assert.ok(id && etiquetas.has(id), `${pantalla}: el control ${etiqueta} tiene una etiqueta`);
      assert.match(etiqueta, /data-testid="[a-z0-9-]+"/, `${pantalla}: el control ${etiqueta} lleva data-testid`);
    }
    for (const [etiqueta] of html.matchAll(/<(a|button)\b[^>]*>/g)) {
      assert.match(etiqueta, /data-testid="[a-z0-9-]+"/, `${pantalla}: ${etiqueta} lleva data-testid`);
    }
  }
  assert.ok(controles >= 6, "la pantalla de paso tiene controles fijos (estado, evidencia, enlace y archivo)");

  // Los campos se construyen desde la definición con crearControlCampo: etiqueta ligada al control.
  const documentoAnterior = globalThis.document;
  globalThis.document = documentoFalso();
  t.after(() => {
    globalThis.document = documentoAnterior;
  });
  for (const campo of definicion.paso("hipotesis").campos) {
    const bloque = crearControlCampo(campo, { idControl: `campo-${campo.id}`, texto: "x", testid: `paso-campo-${campo.id}` });
    const label = bloque.hijos.find((h) => h.etiqueta === "label");
    const control = bloque.hijos.find((h) => h.etiqueta === "input" || h.etiqueta === "textarea");
    assert.equal(label.atributos.for, `campo-${campo.id}`);
    assert.equal(control.atributos.id, `campo-${campo.id}`);
    assert.equal(label.textContent, campo.nombre);
    assert.equal(control.atributos["data-testid"], `paso-campo-${campo.id}`);
    assert.equal(control.value, "x");
  }
});

/** Documento mínimo para construir elementos sin navegador. */
function documentoFalso() {
  return {
    createElement: (etiqueta) => ({
      etiqueta,
      atributos: {},
      hijos: [],
      dataset: {},
      textContent: "",
      value: "",
      setAttribute(nombre, valor) {
        this.atributos[nombre] = valor;
      },
      append(...hijos) {
        this.hijos.push(...hijos);
      },
    }),
  };
}
