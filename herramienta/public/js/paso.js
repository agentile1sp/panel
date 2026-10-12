// Pantalla de un paso (U3): el formulario construido desde la definición del
// paso (campos, elementos que se añaden y se quitan, checklist, enlace o
// adjunto), el botón Guardar, que guarda sin marcar Completo (FR4.7), y el
// selector de estado. En un paso no habilitado todo es de solo lectura y se
// indica qué falta completar (FR3.4). Dirección: paso.html?producto=<id>&paso=<id>.

import { pedir, subirArchivo } from "./api.js";
import { crear, crearControlCampo, mostrarMensaje } from "./dom.js";
import { contenidoAFormulario, formularioAContenido, nombreEnMinusculas } from "./logica-paso.js";
import { claseEstado, leerParametros, rutaApiRecorrido, textoEstado, textoFaltan, tituloProducto, urlRecorrido } from "./logica-recorrido.js";

const $ = (id) => document.getElementById(id);
const zonaMensaje = $("mensaje");
const estado = { producto: null, definicion: null, adjunto: null, contador: 0 };

async function iniciar() {
  const { producto, paso } = leerParametros(window.location.search);
  if (producto === null || paso === null) {
    mostrarMensaje(zonaMensaje, "Falta indicar el producto o el paso. Abre el paso desde el recorrido.", "error");
    bloquearTodo();
    return;
  }
  estado.producto = producto;
  $("volver-recorrido").href = urlRecorrido(producto);
  try {
    const [proceso, vista] = await Promise.all([pedir("GET", "/api/proceso"), pedir("GET", rutaApiRecorrido(producto))]);
    estado.definicion = proceso.pasos.find((p) => p.id === paso) ?? null;
    if (estado.definicion === null) throw new Error(`El paso "${paso}" no existe en el proceso.`);
    pintarCabecera(vista);
    pintarFormulario(pasoDeVista(vista).contenido);
  } catch (error) {
    mostrarMensaje(zonaMensaje, error.message, "error");
    bloquearTodo();
    return;
  }
  $("form-contenido").addEventListener("submit", guardar);
  $("form-estado").addEventListener("submit", cambiarEstado);
  $("subir-adjunto").addEventListener("click", subirAdjunto);
}

const rutaPaso = () => `${rutaApiRecorrido(estado.producto)}/pasos/${encodeURIComponent(estado.definicion.id)}`;
const pasoDeVista = (vista) => vista.pasos.find((p) => p.id === estado.definicion.id);

// --- Cabecera y bloqueo ------------------------------------------------------

function pintarCabecera(vista) {
  const paso = pasoDeVista(vista);
  document.title = `${paso.nombre} · ${tituloProducto(vista)}`;
  $("producto").textContent = tituloProducto(vista);
  $("titulo").textContent = `${paso.orden}. ${paso.nombre}`;
  $("estado-actual").textContent = textoEstado(paso.estado);
  $("estado-actual").className = claseEstado(paso.estado);
  $("selector-estado").value = paso.estado;
  const bloqueado = !paso.habilitado;
  $("bloqueo").hidden = !bloqueado;
  $("bloqueo").textContent = bloqueado ? `Este paso es de solo lectura porque no está habilitado. ${textoFaltan(paso.faltan)}.` : "";
  $("grupo-estado").disabled = bloqueado;
  $("grupo-contenido").disabled = bloqueado;
  $("guardar").disabled = bloqueado;
}

function bloquearTodo() {
  $("grupo-estado").disabled = true;
  $("grupo-contenido").disabled = true;
  $("guardar").disabled = true;
}

// --- Formulario ---------------------------------------------------------------

function pintarFormulario(contenido) {
  const definicion = estado.definicion;
  const formulario = contenidoAFormulario(definicion, contenido);
  $("campos").replaceChildren(
    ...definicion.campos.map((campo) =>
      crearControlCampo(campo, { idControl: `campo-${campo.id}`, texto: formulario.campos[campo.id], testid: `paso-campo-${campo.id}` }),
    ),
  );
  $("elementos").replaceChildren(...(definicion.elementos ?? []).map((tipo) => seccionElementos(tipo, formulario.elementos[tipo.id])));
  pintarChecklist(definicion, formulario.checklist);
  pintarEvidencia(definicion, formulario.evidencia);
}

function seccionElementos(tipo, elementos) {
  const lista = crear("div", { class: "lista-elementos", dataset: { listaTipo: tipo.id } });
  for (const elemento of elementos) lista.append(fichaElemento(tipo, elemento));
  const anadir = crear("button", { type: "button", "data-testid": `paso-anadir-${tipo.id}`, texto: `Añadir ${nombreEnMinusculas(tipo.nombre)}` });
  anadir.addEventListener("click", () => {
    const nueva = fichaElemento(tipo, { id: null, campos: {} });
    lista.append(nueva);
    renumerar(lista, tipo);
    nueva.querySelector("input, textarea")?.focus();
  });
  renumerar(lista, tipo);
  return crear("fieldset", { "data-testid": `paso-elementos-${tipo.id}` }, [crear("legend", { texto: tipo.nombre }), lista, anadir]);
}

function fichaElemento(tipo, elemento) {
  estado.contador += 1;
  const prefijo = `elemento-${tipo.id}-${estado.contador}`;
  const quitar = crear("button", { type: "button", "data-testid": `paso-quitar-${tipo.id}`, texto: `Quitar este elemento` });
  const ficha = crear("fieldset", { class: "elemento", dataset: { idElemento: elemento.id ?? "" } }, [
    crear("legend", { texto: tipo.nombre }),
    ...tipo.campos.map((campo) =>
      crearControlCampo(campo, { idControl: `${prefijo}-${campo.id}`, texto: elemento.campos[campo.id] ?? "", testid: `paso-${tipo.id}-campo-${campo.id}` }),
    ),
    quitar,
  ]);
  quitar.addEventListener("click", () => {
    const lista = ficha.parentElement;
    ficha.remove();
    renumerar(lista, tipo);
    mostrarMensaje(zonaMensaje, `Se ha quitado un elemento "${tipo.nombre}". Pulsa Guardar para guardar el cambio.`, "info");
  });
  return ficha;
}

function renumerar(lista, tipo) {
  [...lista.children].forEach((ficha, indice) => {
    ficha.querySelector("legend").textContent = `${tipo.nombre} ${indice + 1}`;
  });
}

function pintarChecklist(definicion, checklist) {
  const puntos = definicion.checklist ?? [];
  $("seccion-checklist").hidden = puntos.length === 0;
  $("checklist").replaceChildren(
    ...puntos.map((punto) => {
      const casilla = crear("input", { type: "checkbox", id: `punto-${punto.id}`, name: `punto-${punto.id}`, "data-testid": `paso-checklist-${punto.id}` });
      casilla.checked = checklist[punto.id] === true;
      return crear("span", { class: "opcion" }, [casilla, " ", crear("label", { for: `punto-${punto.id}`, texto: punto.texto })]);
    }),
  );
}

function pintarEvidencia(definicion, evidencia) {
  const admite = definicion.evidencia !== undefined;
  $("seccion-evidencia").hidden = !admite;
  if (!admite) return;
  $(`evidencia-${evidencia.tipo}`).checked = true;
  $("evidencia-url").value = evidencia.url;
  pintarAdjunto(evidencia.adjunto);
}

function pintarAdjunto(adjunto) {
  estado.adjunto = adjunto;
  const zona = $("adjunto-actual");
  if (adjunto === null) {
    zona.textContent = "Todavía no hay ningún archivo adjunto.";
    return;
  }
  zona.replaceChildren(
    "Archivo adjunto: ",
    crear("a", { href: `${rutaPaso()}/adjunto`, download: adjunto.nombre, "data-testid": "paso-descargar-adjunto", texto: adjunto.nombre }),
  );
}

function leerFormulario() {
  const definicion = estado.definicion;
  const textoDe = (contenedor, idCampo) => contenedor.querySelector(`[data-campo="${idCampo}"]`).value;
  return {
    campos: Object.fromEntries(definicion.campos.map((campo) => [campo.id, textoDe($("campos"), campo.id)])),
    elementos: Object.fromEntries(
      (definicion.elementos ?? []).map((tipo) => {
        const fichas = document.querySelectorAll(`[data-lista-tipo="${tipo.id}"] > fieldset.elemento`);
        return [tipo.id, [...fichas].map((ficha) => ({ id: ficha.dataset.idElemento || null, campos: Object.fromEntries(tipo.campos.map((c) => [c.id, textoDe(ficha, c.id)])) }))];
      }),
    ),
    checklist: Object.fromEntries((definicion.checklist ?? []).map((punto) => [punto.id, $(`punto-${punto.id}`).checked])),
    evidencia: {
      tipo: document.querySelector('input[name="evidencia-tipo"]:checked')?.value ?? "ninguna",
      url: $("evidencia-url").value,
      adjunto: estado.adjunto,
    },
  };
}

// --- Acciones -------------------------------------------------------------------

async function guardar(evento) {
  evento.preventDefault();
  const { contenido, problemas } = formularioAContenido(estado.definicion, leerFormulario());
  if (problemas.length > 0) {
    mostrarMensaje(zonaMensaje, `No se ha guardado. ${problemas.join(" ")}`, "error");
    return;
  }
  await ejecutar(async () => {
    const vista = await pedir("PUT", `${rutaPaso()}/contenido`, contenido);
    pintarCabecera(vista);
    pintarFormulario(pasoDeVista(vista).contenido);
    mostrarMensaje(zonaMensaje, "Contenido guardado. El estado del paso no ha cambiado.", "exito");
  });
}

async function cambiarEstado(evento) {
  evento.preventDefault();
  const nuevo = $("selector-estado").value;
  await ejecutar(async () => {
    const vista = await pedir("PUT", `${rutaPaso()}/estado`, { estado: nuevo });
    pintarCabecera(vista);
    mostrarMensaje(zonaMensaje, `Estado cambiado a "${textoEstado(nuevo)}".`, "exito");
  });
}

async function subirAdjunto() {
  const archivo = $("evidencia-archivo").files?.[0];
  if (!archivo) {
    mostrarMensaje(zonaMensaje, "Elige primero un archivo para adjuntar.", "error");
    $("evidencia-archivo").focus();
    return;
  }
  await ejecutar(async () => {
    const vista = await subirArchivo(`${rutaPaso()}/adjunto?${new URLSearchParams({ nombre: archivo.name })}`, archivo);
    const evidencia = pasoDeVista(vista).contenido.evidencia;
    pintarAdjunto({ idAdjunto: evidencia.idAdjunto, nombre: evidencia.nombre });
    $("evidencia-adjunto").checked = true;
    $("evidencia-archivo").value = "";
    mostrarMensaje(zonaMensaje, `Archivo "${evidencia.nombre}" adjuntado y guardado.`, "exito");
  });
}

/** Ejecuta una acción mostrando el error en español si falla. */
async function ejecutar(accion) {
  try {
    await accion();
  } catch (error) {
    mostrarMensaje(zonaMensaje, error.message, "error");
  }
}

iniciar();
