import { describe, it, expect } from 'vitest'
import {
  MENSAJES_FORMULARIO,
  codigoValido,
  necesitaFacultad,
  necesitaPrograma,
  validarCelular,
  validarCorreo,
  validarDatosPersonales,
  validarRegistro,
} from '../utils/identidadValidations'

describe('validaciones de identidad (iguales a las reglas del back-end)', () => {
  it('nombres y apellidos: obligatorios y de máximo 60 caracteres', () => {
    expect(validarDatosPersonales({ nombres: 'Ana', apellidos: 'Pérez' })).toEqual({})
    expect(validarDatosPersonales({ nombres: '  ', apellidos: '' })).toEqual({
      nombres: MENSAJES_FORMULARIO.nombresRequeridos,
      apellidos: MENSAJES_FORMULARIO.apellidosRequeridos,
    })
    expect(validarDatosPersonales({ nombres: 'a'.repeat(61), apellidos: 'b'.repeat(61) })).toEqual({
      nombres: MENSAJES_FORMULARIO.nombresLongitud,
      apellidos: MENSAJES_FORMULARIO.apellidosLongitud,
    })
  })

  it('celular colombiano: 10 dígitos que empiezan por 3 y distinto al actual', () => {
    expect(validarCelular(' 3001234567 ')).toBe('')
    expect(validarCelular('')).toBe(MENSAJES_FORMULARIO.celularRequerido)
    expect(validarCelular('2001234567')).toBe(MENSAJES_FORMULARIO.celularFormato)
    expect(validarCelular('300123456')).toBe(MENSAJES_FORMULARIO.celularFormato)
    expect(validarCelular('3001234567', '3001234567')).toBe(MENSAJES_FORMULARIO.celularIgual)
  })

  it('correo: formato válido y distinto al actual sin importar mayúsculas', () => {
    expect(validarCorreo('ana@uco.net.co')).toBe('')
    expect(validarCorreo('')).toBe(MENSAJES_FORMULARIO.correoRequerido)
    expect(validarCorreo('ana@')).toBe(MENSAJES_FORMULARIO.correoFormato)
    expect(validarCorreo('ANA@gmail.com', 'ana@gmail.com')).toBe(MENSAJES_FORMULARIO.correoIgual)
  })

  it('el ámbito depende del rol: Programa, Facultad o ninguno', () => {
    expect(necesitaPrograma('ESTUDIANTE')).toBe(true)
    expect(necesitaPrograma('COORDINADOR_ACADEMICO')).toBe(false)
    expect(necesitaFacultad('COORDINADOR_FACULTAD')).toBe(true)

    const base = { nombres: 'Ana', apellidos: 'Pérez', celular: '3001234567' }
    expect(validarRegistro({ ...base, rol: '' })).toEqual({ rol: MENSAJES_FORMULARIO.rolRequerido })
    expect(validarRegistro({ ...base, rol: 'DOCENTE' })).toEqual({
      idPrograma: MENSAJES_FORMULARIO.programaRequerido,
    })
    expect(validarRegistro({ ...base, rol: 'COORDINADOR_FACULTAD' })).toEqual({
      idFacultad: MENSAJES_FORMULARIO.facultadRequerida,
    })
    expect(validarRegistro({ ...base, rol: 'COORDINADOR_ACADEMICO' })).toEqual({})
    expect(validarRegistro({ ...base, celular: '12', rol: 'ESTUDIANTE', idPrograma: 'x' })).toEqual(
      {
        celular: MENSAJES_FORMULARIO.celularFormato,
      },
    )
  })

  it('el código de verificación tiene 6 dígitos', () => {
    expect(codigoValido(' 123456 ')).toBe(true)
    expect(codigoValido('12345')).toBe(false)
    expect(codigoValido('12345a')).toBe(false)
  })
})
