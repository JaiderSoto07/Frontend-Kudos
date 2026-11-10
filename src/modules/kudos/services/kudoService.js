import { ApiError, http } from '@/api/http'
import { desdeDto, haciaDto, listaDesdeDto } from '@/api/adaptadores'

const primero = (mensaje) => (datos) => {
  if (!datos.length) throw new ApiError(mensaje)
  return datos[0]
}

function consulta(parametros) {
  const busqueda = new URLSearchParams()
  for (const [clave, valor] of Object.entries(parametros)) {
    if (valor) busqueda.set(clave, valor)
  }
  const texto = busqueda.toString()
  return texto ? `?${texto}` : ''
}

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
