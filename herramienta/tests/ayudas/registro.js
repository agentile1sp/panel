// Registro de consola falso: guarda los mensajes en lugar de escribirlos, para
// que las pruebas puedan comprobar qué se registró sin ensuciar la salida.

export function crearRegistroDePrueba() {
  const mensajes = { log: [], warn: [], error: [] };
  const guardar = (nivel) => (...partes) => {
    mensajes[nivel].push(partes.map(String).join(" "));
  };
  return {
    mensajes,
    log: guardar("log"),
    warn: guardar("warn"),
    error: guardar("error"),
  };
}
