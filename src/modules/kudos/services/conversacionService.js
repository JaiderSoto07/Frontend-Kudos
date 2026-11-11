import { http } from '@/api/http'
import { primero } from '@/api/consultas'
import { desdeDto, haciaDto, listaDesdeDto } from '@/api/adaptadores'

export const conversacionService = {
  conversacion: (idKudo) =>
    http.get(`/kudos/${idKudo}/conversacion`).then(listaDesdeDto(desdeDto.replica)),

  responderKudo: async (idKudo, contenido) => {
    await http.post(`/kudos/${idKudo}/replicas`, haciaDto.replica(contenido))
  },

  responderReplica: async (idReplica, contenido) => {
    await http.post(`/replicas/${idReplica}/respuestas`, haciaDto.replica(contenido))
  },

  calificarKudo: async (idKudo, estrellas) => {
    await http.put(`/kudos/${idKudo}/calificacion`, haciaDto.calificacion(estrellas))
  },

  calificarReplica: async (idReplica, estrellas) => {
    await http.put(`/replicas/${idReplica}/calificacion`, haciaDto.calificacion(estrellas))
  },

  valoracionesKudo: (idKudo) =>
    http
      .get(`/kudos/${idKudo}/valoraciones`)
      .then(primero('No fue posible consultar las valoraciones.'))
      .then(desdeDto.valoraciones),

  valoracionesReplica: (idReplica) =>
    http
      .get(`/replicas/${idReplica}/valoraciones`)
      .then(primero('No fue posible consultar las valoraciones.'))
      .then(desdeDto.valoraciones),
}
