import { http } from '@/api/http'
import { consulta, primero } from '@/api/consultas'
import { desdeDto, haciaDto, listaDesdeDto } from '@/api/adaptadores'

export const kudoService = {
  muro: ({ categoria = '', persona = '', pagina = 1 } = {}) =>
    http
      .get(`/kudos${consulta({ categoria, persona, pagina })}`)
      .then(primero('No fue posible consultar el muro.'))
      .then(desdeDto.paginaKudos),

  obtener: (id) =>
    http.get(`/kudos/${id}`).then(primero('No fue posible consultar el Kudo.')).then(desdeDto.kudo),

  crear: async (datos) => {
    await http.post('/kudos', haciaDto.kudo(datos))
  },

  historial: (idPersona, tipo = '') =>
    http
      .get(`/usuarios/${idPersona}/kudos${consulta({ tipo })}`)
      .then(listaDesdeDto(desdeDto.kudo)),

  buscarPersonas: (texto = '') =>
    http.get(`/personas${consulta({ texto })}`).then(listaDesdeDto(desdeDto.persona)),

  categoriasActivas: () => http.get('/categorias').then(listaDesdeDto(desdeDto.categoria)),
}
