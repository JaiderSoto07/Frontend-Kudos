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
