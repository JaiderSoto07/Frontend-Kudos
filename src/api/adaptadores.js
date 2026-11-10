export const ID_POR_DEFECTO_BACKEND = '00000000-0000-0000-0000-000000000000'

const idValido = (id) => (id && id !== ID_POR_DEFECTO_BACKEND ? id : null)

const idDe = (objeto) => idValido(objeto?.id)

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

  facultad: (dto) => ({
    id: idDe(dto),
    nombre: dto.nombre ?? '',
    estado: dto.estado ?? '',
  }),

  programa: (dto) => ({
    id: idDe(dto),
    nombre: dto.nombre ?? '',
    idFacultad: idValido(dto.idFacultad),
    nombreFacultad: dto.nombreFacultad ?? '',
  }),

  opcionesRegistro: (dto) => ({
    roles: dto.roles ?? [],
    facultades: (dto.facultades ?? []).map(desdeDto.facultad),
    programas: (dto.programas ?? []).map(desdeDto.programa),
  }),

  solicitud: (dto) => ({
    id: idDe(dto),
    nombreSolicitante: dto.nombreSolicitante ?? '',
    correoSolicitante: dto.correoSolicitante ?? '',
    rolSolicitado: dto.rolSolicitado ?? '',
    nombreFacultad: dto.nombreFacultad ?? '',
    nombrePrograma: dto.nombrePrograma ?? '',
    estado: dto.estado ?? '',
    fechaSolicitud: dto.fechaSolicitud ?? '',
  }),

  cuenta: (dto) => ({
    id: idDe(dto),
    nombres: dto.nombres ?? '',
    apellidos: dto.apellidos ?? '',
    correo: dto.correoInstitucional ?? '',
    correoVerificado: dto.correoVerificado === true,
    celular: dto.numeroCelular ?? '',
    celularVerificado: dto.celularVerificado === true,
    aprobada: dto.aprobada === true,
    estadoCuenta: dto.estadoCuenta ?? '',
    mensajeEstado: dto.mensajeEstado ?? '',
    rol: dto.rol ?? '',
    rolSolicitado: dto.rolSolicitado ?? '',
    estadoSolicitud: dto.estadoSolicitud ?? '',
    motivoRechazo: dto.motivoRechazo ?? '',
    ultimoCodigoEnviado: dto.ultimoCodigoEnviado ?? '',
  }),
}

export const listaDesdeDto = (adaptador) => (lista) => (lista ?? []).map(adaptador)

const texto = (valor) => String(valor ?? '').trim()

export const haciaDto = {
  categoria: (datos) => ({
    nombre: datos.nombre.trim(),
    descripcion: datos.descripcion.trim(),
  }),

  registro: (datos) => ({
    nombres: texto(datos.nombres),
    apellidos: texto(datos.apellidos),
    numeroCelular: texto(datos.celular),
    rolSolicitado: datos.rol,
    idFacultad: datos.idFacultad || null,
    idPrograma: datos.idPrograma || null,
  }),

  datosPersonales: (datos) => ({
    nombres: texto(datos.nombres),
    apellidos: texto(datos.apellidos),
  }),

  celular: (celular) => ({ numeroCelular: texto(celular) }),

  correo: (correo) => ({ correoInstitucional: texto(correo).toLowerCase() }),

  codigo: (codigo) => ({ codigo: texto(codigo) }),

  rechazo: (motivo) => ({ motivo: texto(motivo) }),

  autoridad: (datos) => ({
    rol: datos.rol,
    nombres: texto(datos.nombres),
    apellidos: texto(datos.apellidos),
    correoInstitucional: texto(datos.correo).toLowerCase(),
    numeroCelular: texto(datos.celular),
  }),
}
