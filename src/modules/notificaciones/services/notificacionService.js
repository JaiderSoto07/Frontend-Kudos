import { http } from '@/api/http'
import { desdeDto, listaDesdeDto } from '@/api/adaptadores'

export const notificacionService = {
  mias: () => http.get('/notificaciones').then(listaDesdeDto(desdeDto.notificacion)),

  marcarLeida: async (id) => {
    await http.post(`/notificaciones/${id}/lectura`)
  },

  marcarTodas: async () => {
    await http.post('/notificaciones/lectura')
  },
}
