export const LIMITE_RESUMEN = 280

export const MENSAJES_KUDO = {
  destinatarioRequerido: 'Elige a la persona que quieres reconocer.',
  categoriaRequerida: 'Elige la categoría del Kudo.',
  contenidoRequerido: 'Escribe el mensaje del reconocimiento.',
}

export function validarKudo(datos) {
  const errores = {}
  if (!datos.idDestinatario) errores.idDestinatario = MENSAJES_KUDO.destinatarioRequerido
  if (!datos.idCategoria) errores.idCategoria = MENSAJES_KUDO.categoriaRequerida
  if (!String(datos.contenido ?? '').trim()) errores.contenido = MENSAJES_KUDO.contenidoRequerido
  return errores
}

export const esLargo = (contenido) => String(contenido ?? '').length > LIMITE_RESUMEN

export const resumen = (contenido) => {
  const texto = String(contenido ?? '')
  return esLargo(texto) ? `${texto.slice(0, LIMITE_RESUMEN).trimEnd()}…` : texto
}

export function formatFechaHora(fecha) {
  if (!fecha) return ''
  const valor = new Date(fecha)
  if (Number.isNaN(valor.getTime())) return ''
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(valor)
}

export const formatPromedio = (promedio) => Number(promedio ?? 0).toFixed(1)

export const NIVEL_MAXIMO_SANGRIA = 5

export const ESTRELLAS = [1, 2, 3, 4, 5]

export const MENSAJE_REPLICA_VACIA = 'Escribe tu réplica antes de publicar.'

export const validarReplica = (contenido) =>
  String(contenido ?? '').trim() ? '' : MENSAJE_REPLICA_VACIA

export const conSangria = (nivel) => nivel < NIVEL_MAXIMO_SANGRIA

export const porcentaje = (cantidad, total) => (total ? Math.round((cantidad * 100) / total) : 0)
