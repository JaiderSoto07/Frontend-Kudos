import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'

import App from '../App.vue'
import { protegerRutas, routes } from '../router'
import {
  LIMITE_DESCRIPCION,
  MENSAJES_MODERACION,
  nombreEstadoContenido,
  nombreEstadoReporte,
  nombreMotivo,
  nombreTipo,
  nombreTipoEnFrase,
  validarDecision,
  validarReporte,
} from '../modules/moderacion/utils/moderacionUtils'
import {
  ID_KUDO,
  ID_REPLICA,
  USUARIO_ACADEMICO,
  USUARIO_ESTUDIANTE,
  iniciarServidorFalso,
  kudosGuardados,
  peticiones,
  reportesGuardados,
  vetosGuardados,
} from './servidorFalso'

const MOTIVO_VETO = 'Contiene burlas hacia la destinataria'

beforeEach(() => {
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

async function abrirKudo(id) {
  const { wrapper } = await montarApp(`/kudos/${id}`)
  await esperar(
    () =>
      wrapper.find('.conversacion').exists() &&
      !wrapper.text().includes('Cargando la conversación'),
  )
  return wrapper
}

const enDialogo = (selector) => document.body.querySelector(`[role="dialog"] ${selector}`)
const cambiar = async (elemento, valor) => {
  elemento.value = valor
  elemento.dispatchEvent(new Event('input'))
  elemento.dispatchEvent(new Event('change'))
  await flushPromises()
}
const enviar = async (formulario) => {
  enDialogo(formulario).dispatchEvent(new Event('submit'))
  await flushPromises()
}
const menu = (wrapper) => wrapper.findAll('.sidebar nav li').map((li) => li.text())
const ultimaPeticion = (metodo) => peticiones.filter((p) => p.metodo === metodo).at(-1)

describe('Reportar contenido (CU-010, CU-011, D-24)', () => {
  it('reporta un Kudo ajeno: valida el motivo y "Otro" sin descripción, y registra el reporte', async () => {
    iniciarServidorFalso({ usuario: USUARIO_ESTUDIANTE })
    const wrapper = await abrirKudo(ID_KUDO.segundo)
    expect(wrapper.find('.detalle-kudo__vetar').exists()).toBe(false)

    await wrapper.find('.detalle-kudo__reportar').trigger('click')
    await esperar(() => enDialogo('#formulario-reporte') != null)
    expect(document.body.textContent).toContain('Vas a reportar el contenido de Marta Ruiz')
    await enviar('#formulario-reporte')
    expect(document.body.textContent).toContain(MENSAJES_MODERACION.motivoRequerido)

    await cambiar(enDialogo('.reporte__motivo select'), 'OTRO')
    await enviar('#formulario-reporte')
    expect(document.body.textContent).toContain(MENSAJES_MODERACION.descripcionRequerida)

    await cambiar(enDialogo('#reporte-descripcion'), '  Se burla de Luis.  ')
    await enviar('#formulario-reporte')
    await esperar(() => wrapper.text().includes('Tu reporte quedó registrado'))
    expect(ultimaPeticion('POST')).toMatchObject({
      ruta: `/api/kudos/${ID_KUDO.segundo}/reportes`,
      cuerpo: { motivo: 'OTRO', descripcion: 'Se burla de Luis.' },
    })
    expect(reportesGuardados()).toHaveLength(1)
    expect(kudosGuardados().find((k) => k.id === ID_KUDO.segundo).estado).toBe('REPORTADO')

    await wrapper.find('.detalle-kudo__reportar').trigger('click')
    await esperar(() => enDialogo('#formulario-reporte') != null)
    await cambiar(enDialogo('.reporte__motivo select'), 'SPAM')
    await enviar('#formulario-reporte')
    await esperar(() => document.body.textContent.includes('Ya reportaste este contenido'))
    wrapper.unmount()
  })

  it('no se reporta un Kudo propio y se reporta una réplica ajena desde la conversación', async () => {
    iniciarServidorFalso({ usuario: USUARIO_ESTUDIANTE })
    const propio = await abrirKudo(ID_KUDO.primero)
    expect(propio.find('.detalle-kudo__reportar').exists()).toBe(false)
    expect(propio.find('.detalle-kudo__acciones').exists()).toBe(false)
    propio.unmount()

    const wrapper = await abrirKudo(ID_KUDO.segundo)
    expect(wrapper.findAll('.replica--vetada > .replica__pie .replica__reportar')).toHaveLength(0)
    await wrapper.find('.replica__reportar').trigger('click')
    await esperar(() => enDialogo('#formulario-reporte') != null)
    expect(document.body.textContent).toContain('Reportar réplica')
    await cambiar(enDialogo('.reporte__motivo select'), 'ACOSO')
    await enviar('#formulario-reporte')
    await esperar(() => wrapper.text().includes('Tu reporte quedó registrado'))
    expect(ultimaPeticion('POST')).toMatchObject({
      ruta: `/api/replicas/${ID_REPLICA.luis}/reportes`,
      cuerpo: { motivo: 'ACOSO', descripcion: '' },
    })
    wrapper.unmount()
  })

  it('"Mis reportes" está en el menú y muestra el estado de cada reporte', async () => {
    iniciarServidorFalso({ usuario: USUARIO_ESTUDIANTE })
    const vacio = await montarApp('/mis-reportes')
    await esperar(() => vacio.wrapper.text().includes('No has reportado contenido'))
    expect(menu(vacio.wrapper)).toContain('Mis reportes')
    expect(menu(vacio.wrapper)).not.toContain('Moderación')
    vacio.wrapper.unmount()

    const detalle = await abrirKudo(ID_KUDO.segundo)
    await detalle.find('.detalle-kudo__reportar').trigger('click')
    await esperar(() => enDialogo('#formulario-reporte') != null)
    await cambiar(enDialogo('.reporte__motivo select'), 'SPAM')
    await enviar('#formulario-reporte')
    await esperar(() => detalle.text().includes('Tu reporte quedó registrado'))
    detalle.unmount()

    const { wrapper } = await montarApp('/mis-reportes')
    await esperar(() => wrapper.findAll('.mis-reportes__item').length === 1)
    const item = wrapper.find('.mis-reportes__item')
    expect(item.text()).toContain('Kudo de Marta Ruiz')
    expect(item.text()).toContain('Pendiente')
    expect(item.text()).toContain('Spam')
    expect(item.find('a').attributes('href')).toBe(`/kudos/${ID_KUDO.segundo}`)
    wrapper.unmount()
  })
})

describe('Moderación (CU-012 a CU-015, CU-036, CU-037)', () => {
  it('un estudiante no ve "Moderación" y si escribe la ruta vuelve al inicio', async () => {
    iniciarServidorFalso({ usuario: USUARIO_ESTUDIANTE })
    const { wrapper, router } = await montarApp('/moderacion')
    await esperar(() => router.currentRoute.value.name === 'inicio')
    expect(menu(wrapper)).not.toContain('Moderación')
    wrapper.unmount()
  })

  it('la bandeja agrupa por contenido y filtra; revisar y liberar devuelven el contenido a visible', async () => {
    iniciarServidorFalso({ usuario: USUARIO_ACADEMICO, conReportes: true })
    const { wrapper } = await montarApp('/moderacion')
    await esperar(() => wrapper.findAll('.moderacion__item').length === 2)
    expect(menu(wrapper)).toContain('Moderación')
    const kudo = () => wrapper.findAll('.moderacion__item')[0]
    expect(kudo().text()).toContain('Kudo de Marta Ruiz')
    expect(kudo().text()).toContain('1 reporte')
    expect(kudo().text()).toContain('Lenguaje ofensivo')
    expect(kudo().find('.moderacion__liberar').exists()).toBe(false)

    await wrapper.find('.moderacion__filtro-tipo').setValue('REPLICA')
    expect(wrapper.findAll('.moderacion__item')).toHaveLength(1)
    expect(wrapper.find('.moderacion__item').text()).toContain('Se burla de Luis.')
    await wrapper.find('.moderacion__filtro-tipo').setValue('')

    await kudo().find('.moderacion__revisar').trigger('click')
    await esperar(() => wrapper.text().includes('La revisión quedó iniciada.'))
    expect(ultimaPeticion('POST').ruta).toBe(`/api/moderacion/kudos/${ID_KUDO.segundo}/revision`)
    expect(kudo().text()).toContain('En revisión')

    await kudo().find('.moderacion__liberar').trigger('click')
    await esperar(() => enDialogo('#formulario-decision') != null)
    expect(document.body.textContent).toContain('Liberar Kudo')
    await cambiar(enDialogo('#motivo-decision'), 'Corto')
    await enviar('#formulario-decision')
    expect(document.body.textContent).toContain(MENSAJES_MODERACION.decisionLongitud)
    await cambiar(enDialogo('#motivo-decision'), 'Revisado: no incumple las normas')
    await enviar('#formulario-decision')
    await esperar(() => wrapper.text().includes('El contenido quedó liberado'))
    expect(ultimaPeticion('POST')).toMatchObject({
      ruta: `/api/moderacion/kudos/${ID_KUDO.segundo}/liberacion`,
      cuerpo: { motivo: 'Revisado: no incumple las normas' },
    })
    expect(wrapper.findAll('.moderacion__item')).toHaveLength(1)
    expect(kudosGuardados().find((k) => k.id === ID_KUDO.segundo).estado).toBe('VISIBLE')
    wrapper.unmount()
  })

  it('vetar desde la bandeja y ver el veto en el histórico con el texto original', async () => {
    iniciarServidorFalso({ usuario: USUARIO_ACADEMICO, conReportes: true })
    const { wrapper } = await montarApp('/moderacion')
    await esperar(() => wrapper.findAll('.moderacion__item').length === 2)

    await wrapper.findAll('.moderacion__item')[1].find('.moderacion__vetar').trigger('click')
    await esperar(() => enDialogo('#formulario-decision') != null)
    expect(document.body.textContent).toContain('Esta decisión no se puede deshacer.')
    await enviar('#formulario-decision')
    expect(document.body.textContent).toContain(MENSAJES_MODERACION.decisionRequerida)
    await cambiar(enDialogo('#motivo-decision'), MOTIVO_VETO)
    await enviar('#formulario-decision')
    await esperar(() => wrapper.text().includes('El contenido quedó vetado'))
    expect(ultimaPeticion('POST').ruta).toBe(`/api/moderacion/replicas/${ID_REPLICA.marta}/veto`)
    expect(wrapper.findAll('.moderacion__item')).toHaveLength(1)

    await wrapper.find('.moderacion__pestana-vetos').trigger('click')
    const veto = wrapper.find('.moderacion__veto')
    expect(veto.text()).toContain('Réplica de Marta Ruiz')
    expect(veto.text()).toContain('Te lo merecías.')
    expect(veto.text()).toContain('Carlos Restrepo')
    expect(veto.text()).toContain(MOTIVO_VETO)
    expect(vetosGuardados()).toHaveLength(1)

    await wrapper.find('.moderacion__filtro-tipo').setValue('KUDO')
    expect(wrapper.text()).toContain('Aún no hay vetos')
    wrapper.unmount()
  })

  it('el moderador veta directamente un Kudo y una réplica desde el detalle (veto directo)', async () => {
    iniciarServidorFalso({ usuario: USUARIO_ACADEMICO })
    const wrapper = await abrirKudo(ID_KUDO.segundo)

    await wrapper.find('.replica__vetar').trigger('click')
    await esperar(() => enDialogo('#formulario-decision') != null)
    await cambiar(enDialogo('#motivo-decision'), MOTIVO_VETO)
    await enviar('#formulario-decision')
    await esperar(() => wrapper.text().includes('La réplica quedó vetada'))
    expect(ultimaPeticion('POST').ruta).toBe(`/api/moderacion/replicas/${ID_REPLICA.luis}/veto`)

    await wrapper.find('.detalle-kudo__vetar').trigger('click')
    await esperar(() => enDialogo('#formulario-decision') != null)
    expect(document.body.textContent).toContain('Vetar Kudo')
    await cambiar(enDialogo('#motivo-decision'), MOTIVO_VETO)
    await enviar('#formulario-decision')
    await esperar(() => wrapper.find('.detalle-kudo__vetado').exists())

    expect(ultimaPeticion('POST').ruta).toBe(`/api/moderacion/kudos/${ID_KUDO.segundo}/veto`)
    expect(wrapper.find('.detalle-kudo__contenido').text()).toBe('Contenido vetado por moderación')
    expect(wrapper.find('.detalle-kudo__acciones').exists()).toBe(false)
    expect(wrapper.find('.estrellas').exists()).toBe(false)
    expect(wrapper.text()).toContain('La conversación está cerrada')
    wrapper.unmount()
  })

  it('utilidades: validaciones y nombres para mostrar', () => {
    expect(validarReporte({ motivo: '', descripcion: '' })).toEqual({
      motivo: MENSAJES_MODERACION.motivoRequerido,
    })
    expect(validarReporte({ motivo: 'OTRO', descripcion: '  ' })).toEqual({
      descripcion: MENSAJES_MODERACION.descripcionRequerida,
    })
    expect(
      validarReporte({ motivo: 'SPAM', descripcion: 'a'.repeat(LIMITE_DESCRIPCION + 1) }),
    ).toEqual({
      descripcion: MENSAJES_MODERACION.descripcionLarga,
    })
    expect(validarReporte({ motivo: 'SPAM' })).toEqual({})
    expect(validarDecision('')).toBe(MENSAJES_MODERACION.decisionRequerida)
    expect(validarDecision('a'.repeat(501))).toBe(MENSAJES_MODERACION.decisionLongitud)
    expect(validarDecision('Motivo suficiente')).toBe('')
    expect(nombreMotivo('INFORMACION_FALSA')).toBe('Información falsa')
    expect(nombreMotivo('DESCONOCIDO')).toBe('DESCONOCIDO')
    expect(nombreEstadoReporte('RECHAZADO')).toContain('sigue visible')
    expect(nombreEstadoReporte('OTRO')).toBe('OTRO')
    expect(nombreEstadoContenido('EN_REVISION')).toBe('En revisión')
    expect(nombreEstadoContenido('VISIBLE')).toBe('VISIBLE')
    expect(nombreTipo('KUDO')).toBe('Kudo')
    expect(nombreTipo('REPLICA')).toBe('Réplica')
    expect(nombreTipoEnFrase('KUDO')).toBe('Kudo')
    expect(nombreTipoEnFrase('REPLICA')).toBe('réplica')
  })
})
