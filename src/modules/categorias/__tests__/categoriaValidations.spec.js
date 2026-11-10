import { describe, it, expect } from 'vitest'
import {
  MENSAJES_FORMULARIO,
  coincideBusqueda,
  formatFecha,
  validarCategoria,
} from '../utils/categoriaValidations'

const DESCRIPCION_VALIDA = 'Reconoce ideas nuevas que mejoran la vida universitaria.'
const existentes = [{ id: 'a', nombre: 'Liderazgo', descripcion: DESCRIPCION_VALIDA }]

describe('validarCategoria (mismos límites que las reglas del back-end)', () => {
  it('unos datos válidos no tienen errores', () => {
    expect(validarCategoria({ nombre: 'Innovación', descripcion: DESCRIPCION_VALIDA })).toEqual({})
  })

  it('nombre y descripción son obligatorios', () => {
    expect(validarCategoria({ nombre: '   ', descripcion: '' })).toEqual({
      nombre: MENSAJES_FORMULARIO.nombreRequerido,
      descripcion: MENSAJES_FORMULARIO.descripcionRequerida,
    })
  })

  it.each([
    ['ab', MENSAJES_FORMULARIO.nombreLongitud],
    ['a'.repeat(51), MENSAJES_FORMULARIO.nombreLongitud],
    ['abc', undefined],
    ['a'.repeat(50), undefined],
  ])('nombre "%s" -> %s', (nombre, esperado) => {
    expect(validarCategoria({ nombre, descripcion: DESCRIPCION_VALIDA }).nombre).toBe(esperado)
  })

  it.each([
    ['corta', MENSAJES_FORMULARIO.descripcionLongitud],
    ['d'.repeat(251), MENSAJES_FORMULARIO.descripcionLongitud],
    ['d'.repeat(10), undefined],
    ['d'.repeat(250), undefined],
  ])('descripción de %#', (descripcion, esperado) => {
    expect(validarCategoria({ nombre: 'Innovación', descripcion }).descripcion).toBe(esperado)
  })

  it('no permite repetir el nombre de otra categoría (sin importar mayúsculas ni tildes)', () => {
    const datos = { nombre: '  LIDERÁZGO ', descripcion: DESCRIPCION_VALIDA }
    expect(validarCategoria(datos, existentes).nombre).toBe(MENSAJES_FORMULARIO.nombreRepetido)
  })

  it('al editar, la misma categoría puede conservar su nombre', () => {
    const datos = { id: 'a', nombre: 'Liderazgo', descripcion: DESCRIPCION_VALIDA }
    expect(validarCategoria(datos, existentes)).toEqual({})
  })
})

describe('utilidades de la pantalla', () => {
  it('busca por nombre o descripción sin importar tildes', () => {
    const categoria = { nombre: 'Excelencia académica', descripcion: 'Logros sobresalientes' }
    expect(coincideBusqueda(categoria, 'academica')).toBe(true)
    expect(coincideBusqueda(categoria, 'SOBRESAL')).toBe(true)
    expect(coincideBusqueda(categoria, 'deporte')).toBe(false)
    expect(coincideBusqueda(categoria, '')).toBe(true)
  })

  it('muestra la fecha de creación y tolera valores vacíos', () => {
    expect(formatFecha('2026-11-09T11:03:20')).toMatch(/2026/)
    expect(formatFecha('')).toBe('')
    expect(formatFecha('no es fecha')).toBe('')
  })
})
