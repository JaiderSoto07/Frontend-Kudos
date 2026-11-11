export function destinoDe(notificacion) {
  if (notificacion.tipoReferencia === 'Kudo' && notificacion.idReferencia) {
    return { name: 'kudo-detalle', params: { id: notificacion.idReferencia } }
  }
  if (notificacion.tipo === 'SOLICITUD_PENDIENTE') return { name: 'solicitudes' }
  if (notificacion.tipo === 'SOLICITUD_RECHAZADA') return { name: 'estado-cuenta' }
  if (notificacion.tipoReferencia === 'Usuario') return { name: 'mi-cuenta' }
  return { name: 'inicio' }
}

export const textoContador = (cantidad) => (cantidad > 99 ? '99+' : String(cantidad))
