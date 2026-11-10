export const ID_POR_DEFECTO_BACKEND = '00000000-0000-0000-0000-000000000000'

const idDe = (objeto) => (objeto?.id && objeto.id !== ID_POR_DEFECTO_BACKEND ? objeto.id : null)

export const desdeDto = {
  usuario: (dto) => ({
    id: idDe(dto),
    nombres: dto.nombres ?? '',
    apellidos: dto.apellidos ?? '',
    correo: dto.correoInstitucional ?? '',
    estadoCuenta: dto.estadoCuenta ?? '',
    rol: dto.rol ?? '',
    registrado: dto.registrado === true,
    mensajeEstado: dto.mensajeEstado ?? '',
  }),

  categoria: (dto) => ({
    id: idDe(dto),
    nombre: dto.nombre ?? '',
    descripcion: dto.descripcion ?? '',
    activa: dto.activa === true,
    fechaCreacion: dto.fechaCreacion ?? '',
  }),
}

export const listaDesdeDto = (adaptador) => (lista) => (lista ?? []).map(adaptador)

export const haciaDto = {
  categoria: (datos) => ({
    nombre: datos.nombre.trim(),
    descripcion: datos.descripcion.trim(),
  }),
}
