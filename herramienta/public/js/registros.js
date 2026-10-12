// Pantalla de un registro transversal (U3): las entradas de cada tipo de
// elemento del registro (acuerdos; gaps y supuestos), con añadir, editar y
// quitar (FR4.5). Siempre está habilitada (FR2.4, AC3.4).
// Dirección: registros.html?producto=<id>&registro=<id>.

import { pedir } from "./api.js";
import { crear, crearControlCampo, mostrarMensaje } from "./dom.js";
import { camposAFormulario, formularioACampos, nombreEnMinusculas } from "./logica-paso.js";
import { leerParametros, rutaApiRecorrido, tituloProducto, urlRecorrido } from "./logica-recorrido.js";

const $ = (id) => document.getElementById(id);
const zonaMensaje = $("mensaje");
const estado = { producto: null, registro: null, contador: 0 };

async function iniciar() {
  const { producto, registro } = leerParametros(window.location.search);
  if (producto === null || registro === null) {
    mostrarMensaje(zonaMensaje, "Falta indicar el producto o el registro. Ábrelo desde el recorrido.", "error");
    return;
  }
  estado.producto = producto;
  $("volver-recorrido").href = urlRecorrido(producto);
  try {
    const [proceso, vista] = await Promise.all([pedir("GET", "/api/proceso"), pedir("GET", rutaApiRecorrido(producto))]);
    estado.registro = proceso.registros.find((r) => r.id === registro) ?? null;
    if (estado.registro === null) throw new Error(`El registro "${registro}" no existe en el proceso.`);
    document.title = `${estado.registro.nombre} · ${tituloProducto(vista)}`;
    $("producto").textContent = tituloProducto(vista);
    $("titulo").textContent = estado.registro.nombre;
    pintar(vista.registros[estado.registro.id]);
  } catch (error) {
    mostrarMensaje(zonaMensaje, error.message, "error");
  }
}

const rutaTipo = (tipo) => `${rutaApiRecorrido(estado.producto)}/registros/${encodeURIComponent(estado.registro.id)}/${encodeURIComponent(tipo.id)}`;

function pintar(entradasPorTipo) {
  $("tipos").replaceChildren(...estado.registro.elementos.map((tipo) => seccionTipo(tipo, entradasPorTipo?.[tipo.id] ?? [])));
}

function seccionTipo(tipo, entradas) {
  const idTitulo = `titulo-${tipo.id}`;
  const lista = crear("div", { "data-testid": `registros-lista-${tipo.id}` }, entradas.map((entrada, indice) => formularioEntrada(tipo, entrada, indice + 1)));
  return crear("section", { "aria-labelledby": idTitulo, "data-testid": `registros-tipo-${tipo.id}` }, [
    crear("h2", { id: idTitulo, texto: `${tipo.nombre} (${entradas.length})` }),
    entradas.length === 0 ? crear("p", { texto: `Todavía no hay ninguna entrada de tipo "${tipo.nombre}".` }) : null,
    lista,
    formularioNueva(tipo),
  ]);
}

function controlesCampos(tipo, campos, prefijo) {
  const textos = camposAFormulario(tipo.campos, campos);
  return tipo.campos.map((campo) =>
    crearControlCampo(campo, { idControl: `${prefijo}-${campo.id}`, texto: textos[campo.id], testid: `registros-${tipo.id}-campo-${campo.id}` }),
  );
}

function leerCampos(tipo, formulario) {
  const textos = Object.fromEntries(tipo.campos.map((campo) => [campo.id, formulario.querySelector(`[data-campo="${campo.id}"]`).value]));
  return formularioACampos(tipo.campos, textos);
}

function formularioEntrada(tipo, entrada, numero) {
  estado.contador += 1;
  const quitar = crear("button", { type: "button", "data-testid": "registros-entrada-quitar", texto: "Quitar esta entrada" });
  const formulario = crear("form", { "data-testid": "registros-entrada" }, [
    crear("fieldset", { class: "elemento" }, [
      crear("legend", { texto: `${tipo.nombre} ${numero}` }),
      ...controlesCampos(tipo, entrada.campos, `entrada-${estado.contador}`),
      crear("button", { type: "submit", "data-testid": "registros-entrada-guardar", texto: "Guardar cambios" }),
      quitar,
    ]),
  ]);
  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    await ejecutar(async () => {
      await pedir("PUT", `${rutaTipo(tipo)}/${encodeURIComponent(entrada.id)}`, { campos: leerCampos(tipo, formulario) });
      await recargar(`Cambios guardados en "${tipo.nombre} ${numero}".`);
    });
  });
  quitar.addEventListener("click", async () => {
    if (!window.confirm(`¿Quitar "${tipo.nombre} ${numero}"? No se puede deshacer.`)) return;
    await ejecutar(async () => {
      await pedir("DELETE", `${rutaTipo(tipo)}/${encodeURIComponent(entrada.id)}`);
      await recargar(`Se ha quitado "${tipo.nombre} ${numero}".`);
    });
  });
  return formulario;
}

function formularioNueva(tipo) {
  const formulario = crear("form", { "data-testid": `registros-nueva-${tipo.id}` }, [
    crear("fieldset", {}, [
      crear("legend", { texto: `Añadir ${nombreEnMinusculas(tipo.nombre)}` }),
      ...controlesCampos(tipo, {}, `nueva-${tipo.id}`),
      crear("button", { type: "submit", class: "principal", "data-testid": `registros-anadir-${tipo.id}`, texto: `Añadir ${nombreEnMinusculas(tipo.nombre)}` }),
    ]),
  ]);
  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    await ejecutar(async () => {
      await pedir("POST", rutaTipo(tipo), { campos: leerCampos(tipo, formulario) });
      await recargar(`Entrada "${tipo.nombre}" añadida.`);
    });
  });
  return formulario;
}

async function recargar(mensaje) {
  const vista = await pedir("GET", rutaApiRecorrido(estado.producto));
  pintar(vista.registros[estado.registro.id]);
  mostrarMensaje(zonaMensaje, mensaje, "exito");
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
