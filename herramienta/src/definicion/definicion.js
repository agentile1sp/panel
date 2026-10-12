// Consultas sobre la definición del proceso (U2).
//
// `crearDefinicion` recibe datos ya validados (ver validar.js) y devuelve un
// objeto de solo lectura (FR5.2): todo está congelado en profundidad y no hay
// ninguna operación para agregar, mover, cambiar o eliminar pasos. U3 lo usa
// para conocer el orden de los pasos, sus campos y sus orígenes directos e
// indirectos, con los que aplica la habilitación en cadena (ADR-004, FR3.3).

import { ErrorDefinicion } from "../base/errores.js";

/**
 * @typedef {{ id: string, nombre: string, tipo: "texto" | "texto-largo" | "lista", ayuda?: string }} DefinicionCampo
 * @typedef {{ id: string, nombre: string, plantilla: string, campos: readonly DefinicionCampo[] }} DefinicionElemento
 * @typedef {{ id: string, texto: string }} PuntoChecklist
 * @typedef {{
 *   id: string, orden: number, nombre: string, tipo: "texto" | "estructurado" | "visual",
 *   origenes: readonly string[], plantilla: string, campos: readonly DefinicionCampo[],
 *   elementos?: readonly DefinicionElemento[], checklist?: readonly PuntoChecklist[], evidencia?: "enlace-o-adjunto"
 * }} DefinicionPaso
 * @typedef {{ id: string, nombre: string, plantilla: string, campos: readonly DefinicionCampo[], elementos: readonly DefinicionElemento[] }} DefinicionRegistro
 * @typedef {Readonly<{
 *   pasos: () => readonly DefinicionPaso[],
 *   paso: (id: string) => DefinicionPaso,
 *   registros: () => readonly DefinicionRegistro[],
 *   registro: (id: string) => DefinicionRegistro,
 *   origenesDirectos: (id: string) => readonly string[],
 *   origenesTodos: (id: string) => readonly string[],
 * }>} Definicion
 */

/**
 * Crea la definición de solo lectura a partir de datos ya validados.
 * @param {any} datos datos validados con validarDefinicion
 * @returns {Definicion}
 */
export function crearDefinicion(datos) {
  const copia = structuredClone(datos);
  const pasos = congelar([...copia.pasos].sort((a, b) => a.orden - b.orden));
  const registros = congelar([...copia.registros]);
  const pasoPorId = new Map(pasos.map((paso) => [paso.id, paso]));
  const registroPorId = new Map(registros.map((registro) => [registro.id, registro]));
  const origenesTodosPorId = new Map(pasos.map((paso) => [paso.id, congelar(resolverOrigenes(paso, pasoPorId))]));

  const buscarPaso = (id) => {
    const paso = pasoPorId.get(id);
    if (paso === undefined) {
      throw new ErrorDefinicion("PASO_DESCONOCIDO", `El paso ${JSON.stringify(id)} no existe en la definición del proceso.`);
    }
    return paso;
  };

  return Object.freeze({
    pasos: () => pasos,
    paso: buscarPaso,
    registros: () => registros,
    registro: (id) => {
      const registro = registroPorId.get(id);
      if (registro === undefined) {
        throw new ErrorDefinicion("REGISTRO_DESCONOCIDO", `El registro ${JSON.stringify(id)} no existe en la definición del proceso.`);
      }
      return registro;
    },
    origenesDirectos: (id) => buscarPaso(id).origenes,
    origenesTodos: (id) => {
      buscarPaso(id);
      return origenesTodosPorId.get(id);
    },
  });
}

/**
 * Orígenes directos e indirectos de un paso, sin repetidos y en el orden del
 * proceso. Los datos validados garantizan que cada origen es anterior a su
 * paso, así que no hay ciclos; aun así, cada paso se visita una sola vez.
 */
function resolverOrigenes(paso, pasoPorId) {
  const vistos = new Set();
  const pendientes = [...paso.origenes];
  while (pendientes.length > 0) {
    const id = pendientes.pop();
    if (vistos.has(id)) continue;
    vistos.add(id);
    pendientes.push(...pasoPorId.get(id).origenes);
  }
  return [...vistos].sort((a, b) => pasoPorId.get(a).orden - pasoPorId.get(b).orden);
}

function congelar(valor) {
  if (typeof valor === "object" && valor !== null && !Object.isFrozen(valor)) {
    Object.freeze(valor);
    for (const hijo of Object.values(valor)) congelar(hijo);
  }
  return valor;
}
