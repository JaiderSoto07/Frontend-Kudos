import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'

import App from '../App.vue'
import { protegerRutas, routes } from '../router'
import {
  MENSAJE_RANGO_FECHAS,
  cambioDeEstado,
  nombreAccion,
  nombreTipoObjeto,
  validarRangoFechas,
} from '../modules/auditoria/utils/auditoriaUtils'
import { destinoDe, textoContador } from '../modules/notificaciones/utils/notificacionUtils'
import {
  ID_KUDO,
  ID_NOTIFICACION,
  USUARIO_ACTIVO,
  USUARIO_COORDINADOR,
  USUARIO_ESTUDIANTE,
  iniciarServidorFalso,
  notificacionesGuardadas,
  peticiones,
} from './servidorFalso'

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

const menu = (wrapper) => wrapper.findAll('.sidebar nav li').map((li) => li.text())
const contador = (wrapper) => wrapper.find('.campana__contador')
const items = (wrapper) => wrapper.findAll('.campana__item')
const filas = (wrapper) => wrapper.findAll('tbody tr')
const lecturas = () => peticiones.filter((p) => p.metodo === 'POST' && p.ruta.includes('lectura'))

async function abrirCampana(wrapper) {
  await wrapper.find('.campana__boton').trigger('click')
  await esperar(() => items(wrapper).length === 3)
}

describe('Notificaciones (CU-039, RF-095, D-27)', () => {
  it('la campana cuenta las no leídas, las muestra primero y al abrir una la marca y lleva al Kudo', async () => {
    iniciarServidorFalso()
    const { wrapper, router } = await montarApp('/inicio')
    await esperar(() => contador(wrapper).exists())
    expect(contador(wrapper).text()).toBe('2')

    await abrirCampana(wrapper)
    expect(items(wrapper).map((i) => i.text())[0]).toContain('Marta Ruiz te dio un Kudo')
    expect(items(wrapper)[1].text()).toContain('Sofía Henao solicitó una cuenta')
    expect(items(wrapper)[2].classes()).not.toContain('campana__item--nueva')

    await items(wrapper)[0].trigger('click')
    await esperar(() => router.currentRoute.value.name === 'kudo-detalle')
    expect(router.currentRoute.value.params.id).toBe(ID_KUDO.segundo)
    expect(lecturas().at(-1).ruta).toBe(`/api/notificaciones/${ID_NOTIFICACION.kudo}/lectura`)
    await esperar(() => contador(wrapper).text() === '1')
    expect(wrapper.find('.campana__panel').exists()).toBe(false)
    wrapper.unmount()
  })

  it('marcar todas como leídas deja el contador en cero', async () => {
    iniciarServidorFalso()
    const { wrapper } = await montarApp('/inicio')
    await abrirCampana(wrapper)

    await wrapper.find('.campana__todas').trigger('click')
    await esperar(() => !contador(wrapper).exists())
    expect(lecturas().at(-1).ruta).toBe('/api/notificaciones/lectura')
    expect(notificacionesGuardadas().every((n) => n.leida)).toBe(true)
    expect(wrapper.find('.campana__todas').exists()).toBe(false)
    wrapper.unmount()
  })

  it('el aviso de solicitud lleva a Solicitudes; uno ya leído no se vuelve a marcar; se recarga al cambiar de pantalla', async () => {
    iniciarServidorFalso({ usuario: USUARIO_COORDINADOR })
    const { wrapper, router } = await montarApp('/inicio')
    await abrirCampana(wrapper)
    await items(wrapper)[1].trigger('click')
    await esperar(() => router.currentRoute.value.name === 'solicitudes')

    const consultasAntes = peticiones.filter((p) => p.ruta === '/api/notificaciones').length
    await abrirCampana(wrapper)
    const marcadasAntes = lecturas().length
    await items(wrapper)[2].trigger('click')
    await esperar(() => router.currentRoute.value.name === 'kudo-detalle')
    expect(lecturas()).toHaveLength(marcadasAntes)
    expect(router.currentRoute.value.params.id).toBe(ID_KUDO.primero)
    await esperar(
      () => peticiones.filter((p) => p.ruta === '/api/notificaciones').length > consultasAntes + 1,
    )
    wrapper.unmount()
  })
})

describe('Auditoría (CU-038, RF-070)', () => {
  it('un estudiante no ve "Auditoría" y si escribe la ruta vuelve al inicio', async () => {
    iniciarServidorFalso({ usuario: USUARIO_ESTUDIANTE })
    const { wrapper, router } = await montarApp('/auditoria')
    await esperar(() => router.currentRoute.value.name === 'inicio')
    expect(menu(wrapper)).not.toContain('Auditoría')
    wrapper.unmount()
  })

  it('lista paginada con acciones en español, filtros por acción, actor sin tildes y fechas, y limpiar', async () => {
    iniciarServidorFalso({ usuario: USUARIO_ACTIVO })
    const { wrapper } = await montarApp('/auditoria')
    await esperar(() => filas(wrapper).length === 20)
    expect(menu(wrapper)).toContain('Auditoría')
    expect(wrapper.text()).toContain('25 registros')
    expect(filas(wrapper)[0].text()).toContain('Kudo vetado')
    expect(filas(wrapper)[0].text()).toContain('EN_REVISION → VETADO')
    expect(filas(wrapper)[0].text()).toContain('María Gómez')

    await wrapper.find('.pagination__btn[aria-label="Página siguiente"]').trigger('click')
    await esperar(() => filas(wrapper).length === 5)

    await wrapper.find('.auditoria__accion select').setValue('KudoVetado')
    await wrapper.find('.auditoria__filtros').trigger('submit')
    await esperar(() => filas(wrapper).length === 1)
    expect(peticiones.at(-1).ruta).toContain('accion=KudoVetado')

    await wrapper.find('.auditoria__accion select').setValue('')
    await wrapper.find('.auditoria__actor').setValue('  GOMEZ ')
    await wrapper.find('.auditoria__filtros').trigger('submit')
    await esperar(() => wrapper.text().includes('24 registros'))

    await wrapper.find('.auditoria__actor').setValue('')
    await wrapper.find('.auditoria__desde').setValue('2026-11-30')
    await wrapper.find('.auditoria__hasta').setValue('2026-11-01')
    const antes = peticiones.length
    await wrapper.find('.auditoria__filtros').trigger('submit')
    expect(wrapper.text()).toContain(MENSAJE_RANGO_FECHAS)
    expect(peticiones).toHaveLength(antes)

    await wrapper.find('.auditoria__desde').setValue('2026-10-01')
    await wrapper.find('.auditoria__hasta').setValue('2026-10-01')
    await wrapper.find('.auditoria__tipo select').setValue('SolicitudRegistro')
    await wrapper.find('.auditoria__filtros').trigger('submit')
    await esperar(() => filas(wrapper).length === 1)
    expect(filas(wrapper)[0].text()).toContain('Solicitud aprobada')
    expect(filas(wrapper)[0].text()).toContain('Solicitud de registro')

    await wrapper.find('.auditoria__tipo select').setValue('Calificacion')
    await wrapper.find('.auditoria__filtros').trigger('submit')
    await esperar(() => wrapper.text().includes('No hay registros con esos filtros'))

    await wrapper.find('.auditoria__limpiar').trigger('click')
    await esperar(() => wrapper.text().includes('25 registros'))
    wrapper.unmount()
  })

  it('utilidades de auditoría y notificaciones', () => {
    expect(nombreAccion('ReplicaPublicada')).toBe('Réplica publicada')
    expect(nombreAccion('RevisionIniciada')).toBe('Revisión iniciada')
    expect(nombreAccion('CalificacionActualizada')).toBe('Calificación actualizada')
    expect(nombreAccion('DatosPersonalesActualizados')).toBe('Datos personales actualizados')
    expect(nombreAccion('')).toBe('')
    expect(nombreTipoObjeto('VinculacionPrograma')).toBe('Vínculo con un Programa')
    expect(nombreTipoObjeto('Otro')).toBe('Otro')
    expect(cambioDeEstado({ estadoAnterior: '', estadoNuevo: 'VISIBLE' })).toBe('— → VISIBLE')
    expect(cambioDeEstado({ estadoAnterior: 'ACTIVA', estadoNuevo: '' })).toBe('ACTIVA → —')
    expect(cambioDeEstado({ estadoAnterior: '', estadoNuevo: '' })).toBe('')
    expect(validarRangoFechas('2026-11-02', '2026-11-01')).toBe(MENSAJE_RANGO_FECHAS)
    expect(validarRangoFechas('2026-11-01', '')).toBe('')
    expect(destinoDe({ tipoReferencia: 'Kudo', idReferencia: 'x' })).toEqual({
      name: 'kudo-detalle',
      params: { id: 'x' },
    })
    expect(destinoDe({ tipo: 'SOLICITUD_PENDIENTE' })).toEqual({ name: 'solicitudes' })
    expect(destinoDe({ tipo: 'SOLICITUD_RECHAZADA' })).toEqual({ name: 'estado-cuenta' })
    expect(destinoDe({ tipo: 'CUENTA_REACTIVADA', tipoReferencia: 'Usuario' })).toEqual({
      name: 'mi-cuenta',
    })
    expect(destinoDe({ tipo: 'SOLICITUD_APROBADA', tipoReferencia: 'SolicitudRegistro' })).toEqual({
      name: 'inicio',
    })
    expect(textoContador(7)).toBe('7')
    expect(textoContador(150)).toBe('99+')
  })
})
