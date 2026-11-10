import { http } from '@/api/http'
import { desdeDto, haciaDto, listaDesdeDto } from '@/api/adaptadores'

const RECURSO = '/solicitudes'

export const solicitudService = {
  listarPendientes: () => http.get(`${RECURSO}/pendientes`).then(listaDesdeDto(desdeDto.solicitud)),

  aprobar: async (id) => {
    await http.post(`${RECURSO}/${id}/aprobacion`)
  },

  rechazar: async (id, motivo) => {
    await http.post(`${RECURSO}/${id}/rechazo`, haciaDto.rechazo(motivo))
  },
}
