import { http } from '@/api/http'
import { haciaDto } from '@/api/adaptadores'

export const autoridadService = {
  registrar: async (datos) => {
    await http.post('/autoridades', haciaDto.autoridad(datos))
  },
}
