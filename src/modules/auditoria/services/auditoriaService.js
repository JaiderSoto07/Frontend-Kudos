import { http } from '@/api/http'
import { desdeDto } from '@/api/adaptadores'
import { consulta, primero } from '@/api/consultas'

export const auditoriaService = {
  consultar: ({
    desde = '',
    hasta = '',
    actor = '',
    accion = '',
    tipoObjeto = '',
    pagina = 1,
  } = {}) =>
    http
      .get(
        `/auditoria${consulta({ desde, hasta, actor: actor.trim(), accion, tipoObjeto, pagina })}`,
      )
      .then(primero('No fue posible consultar la auditoría.'))
      .then(desdeDto.paginaAuditoria),
}
