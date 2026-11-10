import { http } from '@/api/http'
import { desdeDto, haciaDto, listaDesdeDto } from '@/api/adaptadores'

const RECURSO = '/categorias'

export const categoriaService = {
  listarTodas: () => http.get(`${RECURSO}/todas`).then(listaDesdeDto(desdeDto.categoria)),

  registrar: async (datos) => {
    await http.post(RECURSO, haciaDto.categoria(datos))
  },

  modificar: async (id, datos) => {
    await http.put(`${RECURSO}/${id}`, haciaDto.categoria(datos))
  },

  activar: async (id) => {
    await http.post(`${RECURSO}/${id}/activacion`)
  },

  desactivar: async (id) => {
    await http.post(`${RECURSO}/${id}/desactivacion`)
  },
}
