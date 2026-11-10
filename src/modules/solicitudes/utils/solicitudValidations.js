export const LIMITES_MOTIVO = { minimo: 10, maximo: 250 }

export const MENSAJES_MOTIVO = {
  requerido: 'El motivo del rechazo es obligatorio.',
  longitud: `El motivo debe tener entre ${LIMITES_MOTIVO.minimo} y ${LIMITES_MOTIVO.maximo} caracteres.`,
}

export function validarMotivo(motivo) {
  const valor = String(motivo ?? '').trim()
  if (!valor) return MENSAJES_MOTIVO.requerido
  if (valor.length < LIMITES_MOTIVO.minimo || valor.length > LIMITES_MOTIVO.maximo) {
    return MENSAJES_MOTIVO.longitud
  }
  return ''
}

export const ambitoDe = (solicitud) =>
  solicitud.nombrePrograma || solicitud.nombreFacultad || 'Toda la universidad'

export function formatFecha(fecha) {
  if (!fecha) return ''
  const valor = new Date(fecha)
  if (Number.isNaN(valor.getTime())) return ''
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(valor)
}
