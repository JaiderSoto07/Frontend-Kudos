import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'

import App from '../App.vue'
import { protegerRutas, routes } from '../router'
import ReplicaNodo from '../modules/kudos/components/ReplicaNodo.vue'
import {
  MENSAJE_REPLICA_VACIA,
  NIVEL_MAXIMO_SANGRIA,
  conSangria,
  porcentaje,
  validarReplica,
} from '../modules/kudos/utils/kudoUtils'
import {
  ID_KUDO,
  ID_REPLICA,
  iniciarServidorFalso,
  peticiones,
  replicasGuardadas,
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

async function abrirKudo(id) {
  const router = createRouter({ history: createMemoryHistory(), routes })
  protegerRutas(router)
  const pinia = createPinia()
  setActivePinia(pinia)
  router.push(`/kudos/${id}`)
  await router.isReady()
  const wrapper = mount(App, { attachTo: document.body, global: { plugins: [pinia, router] } })
  await esperar(
    () =>
      wrapper.find('.conversacion').exists() &&
      !wrapper.text().includes('Cargando la conversación'),
  )
  return wrapper
}

const ultimaPeticion = (metodo) => peticiones.filter((p) => p.metodo === metodo).at(-1)

describe('Conversación de un Kudo (CU-004 a CU-006, D-21, D-22)', () => {
  it('muestra el árbol: respuestas anidadas y una réplica vetada que conserva sus respuestas', async () => {
    const wrapper = await abrirKudo(ID_KUDO.segundo)

    expect(wrapper.text()).toContain('Conversación (4)')
    const raices = wrapper.findAll('.conversacion > .replica')
    expect(raices).toHaveLength(2)
    expect(raices[0].find('.replica__hijas').text()).toContain('Te lo merecías.')
    expect(raices[1].classes()).toContain('replica--vetada')
    expect(raices[1].find('.replica__contenido').text()).toBe('Contenido vetado por moderación')
    expect(raices[1].find('.replica__hijas').text()).toContain('Esta respuesta sigue visible.')
    expect(raices[1].find(':scope > .replica__pie .replica__responder').exists()).toBe(false)

    await raices[0].find('.replica__alternar').trigger('click')
    expect(raices[0].find('.replica__hijas').exists()).toBe(false)
    expect(raices[0].find('.replica__alternar').text()).toBe('Ver 1 respuesta')
    wrapper.unmount()
  })

  it('responde el Kudo: valida el texto vacío, publica y la réplica aparece en el árbol', async () => {
    const wrapper = await abrirKudo(ID_KUDO.segundo)
    const formulario = wrapper.find('.conversacion__responder')

    await formulario.trigger('submit')
    expect(formulario.text()).toContain(MENSAJE_REPLICA_VACIA)

    await formulario.find('textarea').setValue('  ¡Felicitaciones a los dos!  ')
    await formulario.trigger('submit')
    await esperar(() => wrapper.text().includes('Tu réplica quedó publicada'))

    expect(ultimaPeticion('POST')).toEqual({
      metodo: 'POST',
      ruta: `/api/kudos/${ID_KUDO.segundo}/replicas`,
      cuerpo: { contenido: '¡Felicitaciones a los dos!' },
    })
    expect(wrapper.text()).toContain('Conversación (5)')
    expect(wrapper.find('.conversacion__responder textarea').element.value).toBe('')
    wrapper.unmount()
  })

  it('responde una réplica y la respuesta queda debajo de ella', async () => {
    const wrapper = await abrirKudo(ID_KUDO.segundo)
    const primera = wrapper.findAll('.conversacion > .replica')[0]

    await primera.find('.replica__responder').trigger('click')
    const formulario = primera.find(':scope > .responder')
    await formulario.find('textarea').setValue('Gracias, Luis.')
    await formulario.trigger('submit')
    await esperar(() => wrapper.text().includes('Conversación (5)'))

    expect(ultimaPeticion('POST').ruta).toBe(`/api/replicas/${ID_REPLICA.luis}/respuestas`)
    expect(replicasGuardadas().at(-1).idReplicaPadre).toBe(ID_REPLICA.luis)
    expect(wrapper.findAll('.conversacion > .replica')[0].find('.replica__hijas').text()).toContain(
      'Gracias, Luis.',
    )
    expect(wrapper.find('.conversacion > .replica > .responder').exists()).toBe(false)
    wrapper.unmount()
  })
})

describe('Calificaciones y valoraciones (CU-007 a CU-009, RF-091, RF-092)', () => {
  it('califica el Kudo, vuelve a calificar para modificar y las valoraciones se actualizan', async () => {
    const wrapper = await abrirKudo(ID_KUDO.segundo)
    const valoraciones = () => wrapper.find('.detalle-kudo__valoraciones')

    expect(valoraciones().text()).toContain('4.5 de 5')
    expect(valoraciones().text()).toContain('(2 calificaciones)')
    expect(valoraciones().text()).toContain('Aún no calificas')

    await valoraciones().findAll('.estrellas__boton')[2].trigger('click')
    await esperar(() => valoraciones().text().includes('Tu calificación: 3 de 5'))
    expect(ultimaPeticion('PUT')).toEqual({
      metodo: 'PUT',
      ruta: `/api/kudos/${ID_KUDO.segundo}/calificacion`,
      cuerpo: { estrellas: 3 },
    })
    expect(valoraciones().text()).toContain('(3 calificaciones)')

    await valoraciones().findAll('.estrellas__boton')[4].trigger('click')
    await esperar(() => valoraciones().text().includes('Tu calificación: 5 de 5'))
    expect(valoraciones().text()).toContain('(3 calificaciones)')
    expect(valoraciones().findAll('.estrellas__boton--activa')).toHaveLength(5)
    wrapper.unmount()
  })

  it('en un Kudo propio no aparecen las estrellas, pero sí las valoraciones', async () => {
    const wrapper = await abrirKudo(ID_KUDO.primero)
    await esperar(() => wrapper.find('.detalle-kudo__valoraciones').exists())

    expect(wrapper.find('.detalle-kudo__valoraciones .estrellas').exists()).toBe(false)
    expect(wrapper.text()).toContain('No puedes calificar un Kudo que tú escribiste.')
    wrapper.unmount()
  })

  it('califica una réplica ajena y su promedio se recalcula', async () => {
    const wrapper = await abrirKudo(ID_KUDO.segundo)
    const primera = () => wrapper.findAll('.conversacion > .replica')[0]

    await primera().find('.replica__calificar').trigger('click')
    await esperar(() => primera().find('.estrellas').exists())
    expect(primera().find('.estrellas').text()).toContain('Aún no calificas')

    await primera().findAll('.estrellas__boton')[2].trigger('click')
    await esperar(() => primera().find(':scope > .replica__pie').text().includes('4.0 (2)'))
    expect(ultimaPeticion('PUT').ruta).toBe(`/api/replicas/${ID_REPLICA.luis}/calificacion`)
    expect(primera().find('.estrellas').text()).toContain('Tu calificación: 3 de 5')
    wrapper.unmount()
  })
})

describe('Conversaciones profundas y utilidades (RF-056)', () => {
  const nodo = (nivel, maximo) => ({
    id: `r${nivel}`,
    idAutor: `a${nivel}`,
    nombreAutor: `Persona ${nivel}`,
    contenido: `Nivel ${nivel}`,
    fechaCreacion: '',
    vetada: false,
    promedioCalificacion: 0,
    cantidadCalificaciones: 0,
    respuestas: nivel < maximo ? [nodo(nivel + 1, maximo)] : [],
  })

  it('la sangría llega hasta el nivel 5; más abajo se indica "en respuesta a"', () => {
    const wrapper = mount(ReplicaNodo, { props: { replica: nodo(0, 8) } })

    expect(wrapper.findAll('.replica')).toHaveLength(9)
    expect(wrapper.findAll('.replica__hijas--sangria')).toHaveLength(NIVEL_MAXIMO_SANGRIA)
    const indicaciones = wrapper.findAll('.replica__respuesta-a')
    expect(indicaciones).toHaveLength(3)
    expect(indicaciones[0].text()).toBe('en respuesta a Persona 5')
  })

  it('utilidades de la conversación', () => {
    expect(validarReplica('  ')).toBe(MENSAJE_REPLICA_VACIA)
    expect(validarReplica(null)).toBe(MENSAJE_REPLICA_VACIA)
    expect(validarReplica('Hola')).toBe('')
    expect(conSangria(4)).toBe(true)
    expect(conSangria(5)).toBe(false)
    expect(porcentaje(1, 4)).toBe(25)
    expect(porcentaje(0, 0)).toBe(0)
  })
})
