import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'

import App from '../App.vue'
import { protegerRutas, routes } from '../router'
import { MENSAJES_FORMULARIO } from '../modules/categorias/utils/categoriaValidations'
import {
  ID,
  MENSAJES,
  USUARIO_DOCENTE,
  categoriasGuardadas,
  iniciarServidorFalso,
  peticiones,
} from './servidorFalso'

const DESCRIPCION = 'Reconoce ideas nuevas que mejoran la vida universitaria.'

beforeEach(() => {
  iniciarServidorFalso()
  document.body.innerHTML = ''
})
afterEach(() => vi.unstubAllGlobals())

async function esperar(condicion) {
  await vi.waitFor(async () => {
    await flushPromises()
    if (!condicion()) throw new Error('esperando')
  })
}

async function montarApp(ruta = '/categorias') {
  const router = createRouter({ history: createMemoryHistory(), routes })
  protegerRutas(router)
  const pinia = createPinia()
  setActivePinia(pinia)
  router.push(ruta)
  await router.isReady()
  const wrapper = mount(App, { attachTo: document.body, global: { plugins: [pinia, router] } })
  await flushPromises()
  return { wrapper, router }
}

async function montarCategorias() {
  const resultado = await montarApp('/categorias')
  await esperar(() => resultado.wrapper.text().includes('Trabajo en equipo'))
  return resultado
}

const botonEn = (raiz, texto) =>
  [...raiz.querySelectorAll('button')].find((b) => b.textContent.trim() === texto)

const modal = () => document.body.querySelector('.modal')

function escribir(selector, valor) {
  const campo = modal().querySelector(selector)
  campo.value = valor
  campo.dispatchEvent(new Event('input'))
}

const escrituras = () => peticiones.filter((p) => p.metodo !== 'GET')

describe('Categorías: acceso por rol', () => {
  it('un gestor ve la opción en el menú y la lista con activas e inactivas', async () => {
    const { wrapper } = await montarCategorias()
    const menu = wrapper.findAll('.sidebar nav li').map((li) => li.text())
    expect(menu).toEqual(['Inicio', 'Categorías'])
    expect(wrapper.text()).toContain('Liderazgo')
    expect(wrapper.text()).toContain('Servicio a la comunidad')
    expect(wrapper.text()).toContain('3 categorías · 2 activas')
    expect(peticiones.some((p) => p.ruta === '/api/categorias/todas')).toBe(true)
    wrapper.unmount()
  })

  it('un docente no ve la opción y si escribe la ruta vuelve al inicio', async () => {
    iniciarServidorFalso({ usuario: USUARIO_DOCENTE })
    const { wrapper, router } = await montarApp('/categorias')
    expect(router.currentRoute.value.name).toBe('inicio')
    const menu = wrapper.findAll('.sidebar nav li').map((li) => li.text())
    expect(menu).toEqual(['Inicio'])
    expect(peticiones.some((p) => p.ruta === '/api/categorias/todas')).toBe(false)
    wrapper.unmount()
  })
})

describe('Categorías: filtros', () => {
  it('filtra por estado y por texto', async () => {
    const { wrapper } = await montarCategorias()
    const filas = () => wrapper.findAll('tbody tr').map((tr) => tr.find('td').text())

    await wrapper.find('select').setValue('inactiva')
    expect(filas()).toEqual(['Servicio a la comunidad'])

    await wrapper.find('select').setValue('')
    await wrapper.find('input[type="search"]').setValue('equipo')
    expect(filas()).toEqual(['Trabajo en equipo'])

    await wrapper.find('input[type="search"]').setValue('deporte')
    expect(wrapper.text()).toContain('No hay categorías para mostrar')
    wrapper.unmount()
  })
})

describe('Categorías: registrar y modificar', () => {
  it('registra una categoría nueva y la muestra en la lista', async () => {
    const { wrapper } = await montarCategorias()
    botonEn(document.body, 'Nueva categoría').click()
    await flushPromises()

    escribir('#categoria-nombre', '  Innovación ')
    escribir('#categoria-descripcion', DESCRIPCION)
    botonEn(modal(), 'Guardar').click()
    await esperar(() => !modal())

    expect(escrituras()).toEqual([
      {
        metodo: 'POST',
        ruta: '/api/categorias',
        cuerpo: { nombre: 'Innovación', descripcion: DESCRIPCION },
      },
    ])
    await esperar(() => wrapper.text().includes('Innovación'))
    expect(wrapper.text()).toContain('4 categorías · 3 activas')
    wrapper.unmount()
  })

  it('no envía nada si el formulario tiene errores', async () => {
    const { wrapper } = await montarCategorias()
    botonEn(document.body, 'Nueva categoría').click()
    await flushPromises()

    escribir('#categoria-nombre', 'ab')
    escribir('#categoria-descripcion', 'corta')
    botonEn(modal(), 'Guardar').click()
    await flushPromises()

    const errores = [...modal().querySelectorAll('.field-error')].map((e) => e.textContent.trim())
    expect(errores).toEqual([
      MENSAJES_FORMULARIO.nombreLongitud,
      MENSAJES_FORMULARIO.descripcionLongitud,
    ])
    expect(escrituras()).toEqual([])
    wrapper.unmount()
  })

  it('si el back-end rechaza la operación, muestra su mensaje dentro del modal', async () => {
    const { wrapper } = await montarCategorias()
    categoriasGuardadas().push({
      id: 'otra',
      nombre: 'Innovación',
      descripcion: DESCRIPCION,
      activa: true,
      fechaCreacion: '',
    })
    botonEn(document.body, 'Nueva categoría').click()
    await flushPromises()

    escribir('#categoria-nombre', 'Innovación')
    escribir('#categoria-descripcion', DESCRIPCION)
    botonEn(modal(), 'Guardar').click()
    await esperar(() => modal()?.querySelector('[role="alert"]'))

    expect(modal().querySelector('[role="alert"]').textContent).toContain(MENSAJES.nombreRepetido)
    wrapper.unmount()
  })

  it('edita una categoría con sus datos cargados en el formulario', async () => {
    const { wrapper } = await montarCategorias()
    await wrapper.find('[aria-label="Editar Liderazgo"]').trigger('click')
    await flushPromises()

    expect(modal().querySelector('#categoria-nombre').value).toBe('Liderazgo')
    escribir('#categoria-descripcion', 'Reconoce a quien guía a su equipo con el ejemplo.')
    botonEn(modal(), 'Guardar').click()
    await esperar(() => !modal())

    expect(escrituras()).toEqual([
      {
        metodo: 'PUT',
        ruta: `/api/categorias/${ID.categoria.liderazgo}`,
        cuerpo: {
          nombre: 'Liderazgo',
          descripcion: 'Reconoce a quien guía a su equipo con el ejemplo.',
        },
      },
    ])
    await esperar(() => wrapper.text().includes('guía a su equipo'))
    wrapper.unmount()
  })
})

describe('Categorías: activar y desactivar', () => {
  it('desactiva una categoría activa después de confirmar', async () => {
    const { wrapper } = await montarCategorias()
    await wrapper.find('[aria-label="Desactivar Liderazgo"]').trigger('click')
    await flushPromises()
    expect(modal().textContent).toContain('¿Desactivar la categoría «Liderazgo»?')

    botonEn(modal(), 'Desactivar').click()
    await esperar(() => !modal())

    expect(escrituras()).toEqual([
      {
        metodo: 'POST',
        ruta: `/api/categorias/${ID.categoria.liderazgo}/desactivacion`,
        cuerpo: undefined,
      },
    ])
    await esperar(() => wrapper.text().includes('3 categorías · 1 activa'))
    wrapper.unmount()
  })

  it('activa una categoría inactiva', async () => {
    const { wrapper } = await montarCategorias()
    await wrapper.find('[aria-label="Activar Servicio a la comunidad"]').trigger('click')
    await flushPromises()
    botonEn(modal(), 'Activar').click()
    await esperar(() => !modal())

    expect(escrituras().at(-1).ruta).toBe(`/api/categorias/${ID.categoria.servicio}/activacion`)
    await esperar(() => wrapper.text().includes('3 categorías · 3 activas'))
    wrapper.unmount()
  })

  it('cancelar la confirmación no envía nada', async () => {
    const { wrapper } = await montarCategorias()
    await wrapper.find('[aria-label="Desactivar Liderazgo"]').trigger('click')
    await flushPromises()
    botonEn(modal(), 'Cancelar').click()
    await esperar(() => !modal())
    expect(escrituras()).toEqual([])
    wrapper.unmount()
  })
})
