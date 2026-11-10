import { describe, it, expect } from 'vitest'
import { ID_POR_DEFECTO_BACKEND, desdeDto } from '../api/adaptadores'
import { menuSegunRol } from '../components/layout/menu'
import { ROL, nombreEstadoCuenta, nombreRol, tieneAlgunRol } from '../shared/domain/cuenta'
import { USUARIO_ACTIVO, USUARIO_NO_REGISTRADO } from './servidorFalso'

describe('adaptador del usuario actual', () => {
  it('UsuarioDto -> modelo con el correo y el estado de la cuenta', () => {
    expect(desdeDto.usuario(USUARIO_ACTIVO)).toEqual({
      id: USUARIO_ACTIVO.id,
      nombres: 'Andrea',
      apellidos: 'Ríos',
      correo: 'andrea.rios@uco.net.co',
      estadoCuenta: 'ACTIVA',
      rol: 'ADMINISTRADOR',
      registrado: true,
      mensajeEstado: '',
    })
  })

  it('un usuario sin registrar queda sin id y con registrado en false', () => {
    const usuario = desdeDto.usuario(USUARIO_NO_REGISTRADO)
    expect(USUARIO_NO_REGISTRADO.id).toBe(ID_POR_DEFECTO_BACKEND)
    expect(usuario.id).toBeNull()
    expect(usuario.registrado).toBe(false)
  })
})

describe('roles y estados de la cuenta', () => {
  it('muestra los nombres legibles de los roles y estados', () => {
    expect(nombreRol(ROL.COORDINADOR_ACADEMICO)).toBe('Coordinador Académico')
    expect(nombreRol('')).toBe('')
    expect(nombreEstadoCuenta('PENDIENTE_VERIFICACION')).toBe('Pendiente de verificación')
  })

  it('sin roles exigidos cualquier rol puede pasar; con roles, solo los permitidos', () => {
    expect(tieneAlgunRol(ROL.ESTUDIANTE, undefined)).toBe(true)
    expect(tieneAlgunRol(ROL.ESTUDIANTE, [])).toBe(true)
    expect(tieneAlgunRol(ROL.RECTOR, [ROL.ADMINISTRADOR, ROL.RECTOR])).toBe(true)
    expect(tieneAlgunRol(ROL.DOCENTE, [ROL.ADMINISTRADOR, ROL.RECTOR])).toBe(false)
  })

  it('el menú deja solo las opciones permitidas al rol', () => {
    const etiquetas = (grupos) => grupos.flat().map((item) => item.label)
    expect(etiquetas(menuSegunRol(() => true))).toContain('Inicio')
    expect(menuSegunRol(() => false)).toEqual([])
  })
})
