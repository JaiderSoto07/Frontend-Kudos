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
    cantidadProgramas: dto.cantidadProgramas ?? 0,
    nombreCoordinador: dto.nombreCoordinador ?? '',
  }),

  programa: (dto) => ({
    id: idDe(dto),
    nombre: dto.nombre ?? '',
    idFacultad: idValido(dto.idFacultad),
    nombreFacultad: dto.nombreFacultad ?? '',
    activo: dto.activo !== false,
    nombreCoordinador: dto.nombreCoordinador ?? '',
  }),

  cargo: (dto) => ({
    idUsuario: idValido(dto.idUsuario),
    nombrePersona: dto.nombrePersona ?? '',
    correo: dto.correo ?? '',
    rol: dto.rol ?? '',
    nombreFacultad: dto.nombreFacultad ?? '',
    nombrePrograma: dto.nombrePrograma ?? '',
    fechaInicio: dto.fechaInicio ?? '',
    fechaFin: dto.fechaFin ?? '',
    motivoFin: dto.motivoFin ?? '',
    vigente: dto.vigente === true,
  }),

  vinculo: (dto) => ({
    id: idDe(dto),
    nombrePersona: dto.nombrePersona ?? '',
    correo: dto.correo ?? '',
    tipoVinculo: dto.tipoVinculo ?? '',
    nombrePrograma: dto.nombrePrograma ?? '',
    fechaInicio: dto.fechaInicio ?? '',
    fechaFin: dto.fechaFin ?? '',
    motivoDesvinculacion: dto.motivoDesvinculacion ?? '',
    vigente: dto.vigente === true,
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

  kudo: (dto) => ({
    id: idDe(dto),
    idAutor: idValido(dto.idAutor),
    nombreAutor: dto.nombreAutor ?? '',
    idDestinatario: idValido(dto.idDestinatario),
    nombreDestinatario: dto.nombreDestinatario ?? '',
    nombreCategoria: dto.nombreCategoria ?? '',
    contenido: dto.contenido ?? '',
    fechaCreacion: dto.fechaCreacion ?? '',
    estado: dto.estado ?? '',
    cantidadVisualizaciones: dto.cantidadVisualizaciones ?? 0,
    promedioCalificacion: Number(dto.promedioCalificacion ?? 0),
    cantidadCalificaciones: dto.cantidadCalificaciones ?? 0,
  }),

  paginaKudos: (dto) => ({
    kudos: (dto.kudos ?? []).map(desdeDto.kudo),
    pagina: dto.pagina ?? 1,
    totalPaginas: dto.totalPaginas ?? 0,
    totalKudos: dto.totalKudos ?? 0,
  }),

  persona: (dto) => ({
    id: idDe(dto),
    nombre: dto.nombre ?? '',
    correo: dto.correo ?? '',
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

  kudo: (datos) => ({
    idDestinatario: datos.idDestinatario || null,
    idCategoria: datos.idCategoria || null,
    contenido: texto(datos.contenido),
  }),

  facultad: (datos) => ({ nombre: texto(datos.nombre) }),

  programa: (datos) => ({ nombre: texto(datos.nombre), idFacultad: datos.idFacultad || null }),

  vinculo: (datos) => ({
    correo: texto(datos.correo).toLowerCase(),
    tipoVinculo: datos.tipoVinculo,
  }),

  autoridad: (datos) => ({
    rol: datos.rol,
    nombres: texto(datos.nombres),
    apellidos: texto(datos.apellidos),
    correoInstitucional: texto(datos.correo).toLowerCase(),
    numeroCelular: texto(datos.celular),
  }),
}
