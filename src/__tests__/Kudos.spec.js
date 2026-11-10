import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'

import App from '../App.vue'
import { protegerRutas, routes } from '../router'
import {
  LIMITE_RESUMEN,
  MENSAJES_KUDO,
  esLargo,
  formatFechaHora,
  formatPromedio,
  resumen,
  validarKudo,
} from '../modules/kudos/utils/kudoUtils'
import {
  CATEGORIA_ACTIVA,
  ID_KUDO,
  PERSONAS,
  iniciarServidorFalso,
  kudosGuardados,
  peticiones,
} from './servidorFalso'

beforeEach(() => {
  iniciarServidorFalso()
  document.body.innerHTML = ''
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

async function esperar(condicion) {
  await vi.waitFor(async () => {
    await flushPromises()
    if (!condicion()) throw new Error('esperando')
  })
}

async function montarApp(ruta) {
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

const enDialogo = (selector) => document.body.querySelector(`[role="dialog"] ${selector}`)
const cambiar = async (elemento, valor) => {
  elemento.value = valor
  elemento.dispatchEvent(new Event('input'))
  elemento.dispatchEvent(new Event('change'))
  await flushPromises()
}

describe('Muro de Kudos (CU-042, RF-090)', () => {
  it('la pantalla de inicio es el muro, del más reciente al más antiguo, y filtra por categoría', async () => {
    const { wrapper } = await montarApp('/inicio')
    await esperar(() => wrapper.findAll('.kudo').length === 2)

    expect(wrapper.text()).toContain('Hola, Andrea')
    expect(wrapper.findAll('.kudo')[0].text()).toContain('Gracias por liderar el semillero.')
    expect(wrapper.text()).toContain('2 Kudos')

    await esperar(() => wrapper.findAll('.muro__filtro-categoria option').length > 1)
    await wrapper.find('.muro__filtro-categoria select').setValue(CATEGORIA_ACTIVA)
    await esperar(() => wrapper.findAll('.kudo').length === 1)
    expect(peticiones.at(-1).ruta).toBe(`/api/kudos?categoria=${CATEGORIA_ACTIVA}&pagina=1`)

    await wrapper.find('.muro__limpiar').trigger('click')
    await esperar(() => wrapper.findAll('.kudo').length === 2)
    wrapper.unmount()
  })

  it('un Kudo largo se recorta solo en pantalla y "Ver más" muestra el texto completo (RF-052)', async () => {
    const { wrapper } = await montarApp('/inicio')
    await esperar(() => wrapper.find('.kudo__ver-mas').exists())

    const segundo = wrapper.findAll('.kudo')[1]
    expect(segundo.find('.kudo__contenido').text().endsWith('…')).toBe(true)
    await segundo.find('.kudo__ver-mas').trigger('click')
    expect(segundo.find('.kudo__contenido').text()).toBe(kudosGuardados()[1].contenido)
    expect(segundo.find('.kudo__ver-mas').text()).toBe('Ver menos')
    wrapper.unmount()
  })
})

describe('Dar un Kudo (CU-001)', () => {
  it('valida los campos, publica y el Kudo aparece primero en el muro', async () => {
    const { wrapper } = await montarApp('/inicio')
    await esperar(() => wrapper.findAll('.kudo').length === 2)

    await wrapper.find('.muro__dar').trigger('click')
    await esperar(() => enDialogo('.kudo-form__destinatario option:nth-child(2)') != null)
    enDialogo('#formulario-kudo').dispatchEvent(new Event('submit'))
    await flushPromises()
    expect(document.body.textContent).toContain(MENSAJES_KUDO.destinatarioRequerido)
    expect(document.body.textContent).toContain(MENSAJES_KUDO.contenidoRequerido)

    await cambiar(enDialogo('.kudo-form__destinatario select'), PERSONAS[1].id)
    await cambiar(enDialogo('.kudo-form__categoria select'), CATEGORIA_ACTIVA)
    await cambiar(enDialogo('#kudo-contenido'), '  Gracias por compartir tus apuntes.  ')
    enDialogo('#formulario-kudo').dispatchEvent(new Event('submit'))

    await esperar(() => wrapper.text().includes('Tu Kudo quedó publicado'))
    expect(peticiones.find((p) => p.metodo === 'POST' && p.ruta === '/api/kudos').cuerpo).toEqual({
      idDestinatario: PERSONAS[1].id,
      idCategoria: CATEGORIA_ACTIVA,
      contenido: 'Gracias por compartir tus apuntes.',
    })
    await esperar(() => wrapper.findAll('.kudo').length === 3)
    expect(wrapper.findAll('.kudo')[0].text()).toContain('Marta Ruiz')
    wrapper.unmount()
  })
})

describe('Detalle e historial (CU-002, CU-003)', () => {
  it('abrir un Kudo de otra persona suma una visualización', async () => {
    const { wrapper } = await montarApp(`/kudos/${ID_KUDO.segundo}`)
    await esperar(() => wrapper.find('.detalle-kudo__tarjeta').exists())

    expect(wrapper.text()).toContain('Marta Ruiz')
    expect(wrapper.text()).toContain('Trabajo en equipo')
    expect(wrapper.find('.detalle-kudo__datos').text()).toContain('4')
    await esperar(() => wrapper.find('.detalle-kudo__valoraciones').exists())
    expect(wrapper.find('.detalle-kudo__valoraciones').text()).toContain('4.5 de 5')
    wrapper.unmount()
  })

  it('Mis Kudos muestra recibidos y emitidos; desde el muro se abre el historial de otra persona', async () => {
    const { wrapper, router } = await montarApp('/mis-kudos')
    await esperar(() => wrapper.text().includes('Mis Kudos'))
    await esperar(() => wrapper.text().includes('Sin Kudos recibidos'))

    await wrapper.find('.historial__pestana-emitidos').trigger('click')
    await esperar(() => wrapper.findAll('.kudo').length === 1)
    expect(wrapper.text()).toContain('Luis Gómez')

    await router.push(`/personas/${PERSONAS[0].id}/kudos`)
    await flushPromises()
    await esperar(() => wrapper.findAll('.kudo').length === 2)
    expect(wrapper.text()).toContain('Kudos de Luis Gómez')
    wrapper.unmount()
  })

  it('utilidades: validación, resumen y formatos', () => {
    expect(validarKudo({ idDestinatario: 'a', idCategoria: 'b', contenido: 'Hola' })).toEqual({})
    expect(validarKudo({})).toEqual({
      idDestinatario: MENSAJES_KUDO.destinatarioRequerido,
      idCategoria: MENSAJES_KUDO.categoriaRequerida,
      contenido: MENSAJES_KUDO.contenidoRequerido,
    })
    expect(esLargo('a'.repeat(LIMITE_RESUMEN))).toBe(false)
    expect(resumen('a'.repeat(LIMITE_RESUMEN + 1))).toHaveLength(LIMITE_RESUMEN + 1)
    expect(resumen('corto')).toBe('corto')
    expect(formatPromedio(4)).toBe('4.0')
    expect(formatFechaHora('')).toBe('')
    expect(formatFechaHora('no')).toBe('')
    expect(formatFechaHora('2026-11-10T10:00:00')).not.toBe('')
  })
})
