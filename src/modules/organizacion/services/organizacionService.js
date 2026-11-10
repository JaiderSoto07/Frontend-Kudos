import { ApiError, http } from '@/api/http'
import { desdeDto, haciaDto, listaDesdeDto } from '@/api/adaptadores'

const primero = (datos) => {
  if (!datos.length) throw new ApiError('No fue posible consultar el Programa.')
  return datos[0]
}

export const organizacionService = {
  listarFacultades: () => http.get('/facultades').then(listaDesdeDto(desdeDto.facultad)),

  registrarFacultad: async (datos) => {
    await http.post('/facultades', haciaDto.facultad(datos))
  },

  modificarFacultad: async (id, datos) => {
    await http.put(`/facultades/${id}`, haciaDto.facultad(datos))
  },

  inactivarFacultad: async (id) => {
    await http.post(`/facultades/${id}/inactivacion`)
  },

  coordinadoresDeFacultad: (id) =>
    http.get(`/facultades/${id}/coordinadores`).then(listaDesdeDto(desdeDto.cargo)),

  listarProgramas: () => http.get('/programas').then(listaDesdeDto(desdeDto.programa)),

  obtenerPrograma: (id) => http.get(`/programas/${id}`).then(primero).then(desdeDto.programa),

  registrarPrograma: async (datos) => {
    await http.post('/programas', haciaDto.programa(datos))
  },

  modificarPrograma: async (id, datos) => {
    await http.put(`/programas/${id}`, haciaDto.programa(datos))
  },

  inactivarPrograma: async (id) => {
    await http.post(`/programas/${id}/inactivacion`)
  },

  coordinadoresDePrograma: (id) =>
    http.get(`/programas/${id}/coordinadores`).then(listaDesdeDto(desdeDto.cargo)),

  vinculosDePrograma: (id) =>
    http.get(`/programas/${id}/vinculos`).then(listaDesdeDto(desdeDto.vinculo)),

  vincular: async (idPrograma, datos) => {
    await http.post(`/programas/${idPrograma}/vinculos`, haciaDto.vinculo(datos))
  },

  desvincular: async (idVinculo, motivo) => {
    await http.post(`/vinculos/${idVinculo}/desvinculacion`, haciaDto.rechazo(motivo))
  },

  misVinculos: () => http.get('/cuenta/vinculos').then(listaDesdeDto(desdeDto.vinculo)),

  estructura: () => http.get('/estructura').then(listaDesdeDto(desdeDto.cargo)),
}
