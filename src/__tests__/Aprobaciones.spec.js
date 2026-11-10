import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'

import App from '../App.vue'
import { protegerRutas, routes } from '../router'
import {
  MENSAJES_MOTIVO,
  validarMotivo,
  ambitoDe,
} from '../modules/solicitudes/utils/solicitudValidations'
import {
  ID_SOLICITUD,
  MENSAJES,
  MOTIVO_RECHAZO_PREVIO,
  OPCIONES_REGISTRO,
  USUARIO_COORDINADOR,
  USUARIO_DOCENTE,
  USUARIO_RECHAZADO,
  cuentaGuardada,
  iniciarServidorFalso,
  peticiones,
  solicitudesPendientes,
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

const menu = (wrapper) => wrapper.findAll('.sidebar nav li').map((li) => li.text())
const filas = () => document.body.querySelectorAll('tbody tr')
const botonDelDialogo = (texto) =>
  [...document.body.querySelectorAll('[role="dialog"] button')].find(
    (b) => b.textContent.trim() === texto,
  )

describe('Solicitudes de cuenta (CU-022 a CU-025)', () => {
  it('el coordinador ve "Solicitudes" en el menú y la lista de su ámbito', async () => {
    iniciarServidorFalso({ usuario: USUARIO_COORDINADOR })
    const { wrapper } = await montarApp('/solicitudes')
    await esperar(() => wrapper.text().includes('Sofía Henao'))

    expect(menu(wrapper)).toEqual([
      'Inicio',
      'Solicitudes',
      'Estructura',
      'Facultades',
      'Programas',
      'Mi cuenta',
    ])
    expect(wrapper.text()).toContain('Mateo Arango')
    expect(wrapper.text()).toContain('Estudiante')
    expect(wrapper.text()).toContain('Ingeniería de Sistemas')
    wrapper.unmount()
  })

  it('aprobar pide confirmación, avisa la sustitución y quita la solicitud de la lista', async () => {
    iniciarServidorFalso({ usuario: USUARIO_COORDINADOR })
    const { wrapper } = await montarApp('/solicitudes')
    await esperar(() => wrapper.find('.acciones__aprobar').exists())

    await wrapper.find('.acciones__aprobar').trigger('click')
    expect(document.body.textContent).toContain('¿Aprobar a Sofía Henao como Estudiante?')
    expect(document.body.textContent).toContain('será sustituido')
    botonDelDialogo('Aprobar').click()

    await esperar(() => wrapper.text().includes('quedó aprobada'))
    expect(
      peticiones.some((p) => p.ruta === `/api/solicitudes/${ID_SOLICITUD.sofia}/aprobacion`),
    ).toBe(true)
    expect(solicitudesPendientes().map((s) => s.nombreSolicitante)).toEqual(['Mateo Arango'])
    expect(filas()).toHaveLength(1)
    wrapper.unmount()
  })

  it('rechazar exige el motivo y lo envía al back-end', async () => {
    iniciarServidorFalso({ usuario: USUARIO_COORDINADOR })
    const { wrapper } = await montarApp('/solicitudes')
    await esperar(() => wrapper.find('.acciones__rechazar').exists())

    await wrapper.findAll('.acciones__rechazar')[1].trigger('click')
    await flushPromises()
    const formulario = document.body.querySelector('#formulario-rechazo')
    formulario.dispatchEvent(new Event('submit'))
    await flushPromises()
    expect(document.body.textContent).toContain(MENSAJES_MOTIVO.requerido)

    const motivo = document.body.querySelector('#motivo-rechazo')
    motivo.value = 'No dicta clases en el Programa.'
    motivo.dispatchEvent(new Event('input'))
    formulario.dispatchEvent(new Event('submit'))

    await esperar(() => wrapper.text().includes('quedó rechazada'))
    const rechazo = peticiones.find(
      (p) => p.ruta === `/api/solicitudes/${ID_SOLICITUD.mateo}/rechazo`,
    )
    expect(rechazo.cuerpo).toEqual({ motivo: 'No dicta clases en el Programa.' })
    expect(solicitudesPendientes()).toHaveLength(1)
    wrapper.unmount()
  })

  it('un docente no ve "Solicitudes" y si escribe la ruta vuelve al inicio', async () => {
    iniciarServidorFalso({ usuario: USUARIO_DOCENTE })
    const { wrapper, router } = await montarApp('/solicitudes')
    expect(router.currentRoute.value.name).toBe('inicio')
    expect(menu(wrapper)).not.toContain('Solicitudes')
    wrapper.unmount()
  })

  it('validaciones del motivo y del ámbito que se muestra', () => {
    expect(validarMotivo('')).toBe(MENSAJES_MOTIVO.requerido)
    expect(validarMotivo('Corto')).toBe(MENSAJES_MOTIVO.longitud)
    expect(validarMotivo('a'.repeat(251))).toBe(MENSAJES_MOTIVO.longitud)
    expect(validarMotivo('Motivo suficiente')).toBe('')
    expect(ambitoDe({ nombrePrograma: 'Sistemas', nombreFacultad: '' })).toBe('Sistemas')
    expect(ambitoDe({ nombrePrograma: '', nombreFacultad: 'Ingeniería' })).toBe('Ingeniería')
    expect(ambitoDe({ nombrePrograma: '', nombreFacultad: '' })).toBe('Toda la universidad')
  })
})

describe('Registrar Rector o Administrador (RF-039, RF-040)', () => {
  async function llenar(wrapper, rol) {
    await wrapper.find('.autoridad__rol select').setValue(rol)
    await wrapper.find('#autoridad-nombres').setValue('Laura')
    await wrapper.find('#autoridad-apellidos').setValue('Mejía')
    await wrapper.find('#autoridad-correo').setValue(' Laura.Mejia@Gmail.com ')
    await wrapper.find('#autoridad-celular').setValue('3184445566')
    await wrapper.find('.autoridad__form').trigger('submit')
  }

  it('el Administrador registra otro Administrador', async () => {
    const { wrapper } = await montarApp('/autoridades')
    await esperar(() => wrapper.find('.autoridad__form').exists())

    await wrapper.find('.autoridad__form').trigger('submit')
    expect(wrapper.text()).toContain('Elige el rol que solicitas.')

    await llenar(wrapper, 'ADMINISTRADOR')
    await esperar(() => wrapper.text().includes('quedó registrada'))
    expect(peticiones.find((p) => p.ruta === '/api/autoridades').cuerpo).toEqual({
      rol: 'ADMINISTRADOR',
      nombres: 'Laura',
      apellidos: 'Mejía',
      correoInstitucional: 'laura.mejia@gmail.com',
      numeroCelular: '3184445566',
    })
    expect(wrapper.find('#autoridad-nombres').element.value).toBe('')
    wrapper.unmount()
  })

  it('si ya hay Rector se muestra el mensaje del back-end', async () => {
    const { wrapper } = await montarApp('/autoridades')
    await esperar(() => wrapper.find('.autoridad__form').exists())

    await llenar(wrapper, 'RECTOR')
    await esperar(() => wrapper.find('.autoridad__mensaje--error').exists())
    expect(wrapper.find('.autoridad__mensaje--error').text()).toBe(MENSAJES.rectorExiste)
    wrapper.unmount()
  })

  it('solo el Administrador entra a registrar autoridades', async () => {
    iniciarServidorFalso({ usuario: USUARIO_COORDINADOR })
    const { wrapper, router } = await montarApp('/autoridades')
    expect(router.currentRoute.value.name).toBe('inicio')
    wrapper.unmount()
  })
})

describe('Nueva solicitud después de un rechazo (decisión a de M2)', () => {
  it('muestra el motivo y permite enviar una nueva solicitud con otro rol', async () => {
    iniciarServidorFalso({ usuario: USUARIO_RECHAZADO })
    const { wrapper } = await montarApp('/estado-cuenta')
    await esperar(() => wrapper.find('.nueva-solicitud').exists())

    expect(wrapper.text()).toContain('Tu solicitud fue rechazada')
    expect(wrapper.text()).toContain(MOTIVO_RECHAZO_PREVIO)

    await esperar(() => wrapper.findAll('.campo-rol option').length > 1)
    await wrapper.find('.nueva-solicitud').trigger('submit')
    expect(wrapper.text()).toContain('Elige el rol que solicitas.')

    await wrapper.find('.campo-rol select').setValue('DOCENTE')
    await wrapper.find('.campo-programa select').setValue(OPCIONES_REGISTRO.programas[0].id)
    await wrapper.find('.nueva-solicitud').trigger('submit')

    await esperar(() => !wrapper.find('.nueva-solicitud').exists())
    expect(
      peticiones.find((p) => p.ruta === '/api/registros/nueva-solicitud').cuerpo,
    ).toMatchObject({
      rolSolicitado: 'DOCENTE',
      idPrograma: OPCIONES_REGISTRO.programas[0].id,
    })
    expect(cuentaGuardada().estadoSolicitud).toBe('PENDIENTE')
    expect(wrapper.text()).toContain('Tu nueva solicitud quedó enviada')
    wrapper.unmount()
  })
})

describe('Respuestas del back-end para solicitudes', () => {
  it('sin rol aprobador el back-end responde 403 con su mensaje', async () => {
    iniciarServidorFalso({ usuario: USUARIO_DOCENTE })
    const { solicitudService } = await import('../modules/solicitudes/services/solicitudService')
    await expect(solicitudService.listarPendientes()).rejects.toThrow(
      MENSAJES.sinPermisoSolicitudes,
    )
  })
})
