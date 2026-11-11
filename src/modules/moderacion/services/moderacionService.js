import { http } from '@/api/http'
import { desdeDto, haciaDto, listaDesdeDto } from '@/api/adaptadores'
import { TIPO_CONTENIDO } from '../utils/moderacionUtils'

const segmento = (tipo) => (tipo === TIPO_CONTENIDO.KUDO ? 'kudos' : 'replicas')

export const moderacionService = {
  reportar: async (tipo, id, datos) => {
    await http.post(`/${segmento(tipo)}/${id}/reportes`, haciaDto.reporte(datos))
  },

  misReportes: () => http.get('/reportes/mios').then(listaDesdeDto(desdeDto.reporte)),

  bandeja: () => http.get('/moderacion/reportes').then(listaDesdeDto(desdeDto.contenidoReportado)),

  vetos: () => http.get('/moderacion/vetos').then(listaDesdeDto(desdeDto.veto)),

  iniciarRevision: async (tipo, id) => {
    await http.post(`/moderacion/${segmento(tipo)}/${id}/revision`)
  },

  vetar: async (tipo, id, motivo) => {
    await http.post(`/moderacion/${segmento(tipo)}/${id}/veto`, haciaDto.decision(motivo))
  },

  liberar: async (tipo, id, motivo) => {
    await http.post(`/moderacion/${segmento(tipo)}/${id}/liberacion`, haciaDto.decision(motivo))
  },
}
