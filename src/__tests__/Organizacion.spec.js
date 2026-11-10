import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'

import App from '../App.vue'
import { protegerRutas, routes } from '../router'
import {
  MENSAJES_ORGANIZACION,
  formatFecha,
  validarMotivo,
  validarNombre,
  validarVinculo,
} from '../modules/organizacion/utils/organizacionValidations'
import {
  ID_ORGANIZACION,
  MENSAJES,
  USUARIO_ACADEMICO,
  USUARIO_COORDINADOR,
  USUARIO_DOCENTE,
  USUARIO_ESTUDIANTE,
  iniciarServidorFalso,
  organizacionGuardada,
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
const escribir = async (elemento, valor) => {
  elemento.value = valor
  elemento.dispatchEvent(new Event('input'))
  elemento.dispatchEvent(new Event('change'))
  await flushPromises()
}
const enviar = async (formulario) => {
  formulario.dispatchEvent(new Event('submit'))
  await flushPromises()
}
const botonDelDialogo = (texto) =>
  [...document.body.querySelectorAll('[role="dialog"] button')].find(
    (b) => b.textContent.trim() === texto,
  )
const peticionA = (metodo, ruta) => peticiones.find((p) => p.metodo === metodo && p.ruta === ruta)

describe('Facultades (CU-028, CU-029)', () => {
  it('el Coordinador Académico crea una Facultad y valida el nombre repetido', async () => {
    iniciarServidorFalso({ usuario: USUARIO_ACADEMICO })
    const { wrapper } = await montarApp('/facultades')
    await esperar(() => wrapper.text().includes('Derecho'))
    expect(wrapper.text()).toContain('En conformación')
    expect(wrapper.text()).toContain('Luisa Ospina')

    await wrapper
      .findAll('button')
      .find((b) => b.text() === 'Nueva Facultad')
      .trigger('click')
    await flushPromises()
    await escribir(enDialogo('#organizacion-nombre'), 'ingeniería')
    await enviar(enDialogo('#formulario-organizacion'))
    expect(document.body.textContent).toContain(MENSAJES_ORGANIZACION.nombreRepetido)

    await escribir(enDialogo('#organizacion-nombre'), 'Ciencias Sociales')
    await enviar(enDialogo('#formulario-organizacion'))
    await esperar(() => wrapper.text().includes('quedó registrada en conformación'))
    expect(peticionA('POST', '/api/facultades').cuerpo).toEqual({ nombre: 'Ciencias Sociales' })
    expect(organizacionGuardada().facultades).toHaveLength(3)
    wrapper.unmount()
  })

  it('inactivar pide confirmación y muestra el rechazo si tiene Programas', async () => {
    iniciarServidorFalso({ usuario: USUARIO_ACADEMICO })
    const { wrapper } = await montarApp('/facultades')
    await esperar(() => wrapper.find('.acciones__inactivar').exists())

    await wrapper.findAll('.acciones__inactivar')[0].trigger('click')
    botonDelDialogo('Inactivar').click()
    await esperar(() => document.body.textContent.includes(MENSAJES.facultadConProgramas))

    botonDelDialogo('Cancelar').click()
    await flushPromises()
    await wrapper.findAll('.acciones__inactivar')[1].trigger('click')
    botonDelDialogo('Inactivar').click()
    await esperar(() => wrapper.text().includes('quedó inactiva'))
    expect(
      peticionA('POST', `/api/facultades/${ID_ORGANIZACION.derecho}/inactivacion`),
    ).toBeTruthy()
    wrapper.unmount()
  })

  it('el coordinador ve las Facultades pero no puede crear ni inactivar; ve el historial de coordinadores', async () => {
    iniciarServidorFalso({ usuario: USUARIO_COORDINADOR })
    const { wrapper } = await montarApp('/facultades')
    await esperar(() => wrapper.text().includes('Ingeniería'))

    expect(wrapper.text()).not.toContain('Nueva Facultad')
    expect(wrapper.find('.acciones__inactivar').exists()).toBe(false)
    await wrapper.find('.acciones__coordinadores').trigger('click')
    await esperar(() => document.body.textContent.includes('Coordinadores de Ingeniería'))
    await esperar(() => document.body.textContent.includes('Vigente'))
    wrapper.unmount()
  })
})

describe('Programas y vínculos (CU-030 a CU-033)', () => {
  it('el Coordinador Académico crea un Programa en Derecho, que pasa a activa', async () => {
    iniciarServidorFalso({ usuario: USUARIO_ACADEMICO })
    const { wrapper } = await montarApp('/programas')
    await esperar(() => wrapper.text().includes('Ingeniería de Sistemas'))

    await wrapper
      .findAll('button')
      .find((b) => b.text() === 'Nuevo Programa')
      .trigger('click')
    await flushPromises()
    await escribir(enDialogo('#organizacion-nombre'), 'Derecho Penal')
    await enviar(enDialogo('#formulario-organizacion'))
    expect(document.body.textContent).toContain(MENSAJES_ORGANIZACION.facultadRequerida)

    await escribir(enDialogo('.formulario__facultad select'), ID_ORGANIZACION.derecho)
    await enviar(enDialogo('#formulario-organizacion'))
    await esperar(() => wrapper.text().includes('El Programa quedó registrado.'))
    expect(peticionA('POST', '/api/programas').cuerpo).toEqual({
      nombre: 'Derecho Penal',
      idFacultad: ID_ORGANIZACION.derecho,
    })
    expect(organizacionGuardada().facultades.find((f) => f.nombre === 'Derecho').estado).toBe(
      'ACTIVA',
    )
    wrapper.unmount()
  })

  it('el coordinador del Programa vincula por correo y desvincula con motivo', async () => {
    iniciarServidorFalso({ usuario: USUARIO_COORDINADOR })
    const { wrapper } = await montarApp(`/programas/${ID_ORGANIZACION.sistemas}`)
    await esperar(() => wrapper.text().includes('Mateo Cardona'))
    expect(wrapper.text()).toContain('Ana Ruiz')
    expect(wrapper.text()).toContain('Terminó el semestre.')

    await wrapper.find('.vincular').trigger('submit')
    expect(wrapper.text()).toContain(MENSAJES_ORGANIZACION.correoRequerido)

    await wrapper.find('#vincular-correo').setValue('mateo@gmail.com')
    await wrapper.find('.vincular__tipo select').setValue('ESTUDIANTE')
    await wrapper.find('.vincular').trigger('submit')
    await esperar(() => wrapper.find('.vincular__error').exists())
    expect(wrapper.find('.vincular__error').text()).toBe(MENSAJES.rolNoCoincide)

    await wrapper.find('#vincular-correo').setValue('sofia@gmail.com')
    await wrapper.find('.vincular').trigger('submit')
    await esperar(() => wrapper.text().includes('quedó vinculada'))
    expect(peticionA('POST', `/api/programas/${ID_ORGANIZACION.sistemas}/vinculos`)).toBeTruthy()

    await wrapper.findAll('.detalle__desvincular')[0].trigger('click')
    await flushPromises()
    await escribir(enDialogo('#motivo-texto'), 'Dejó de dictar en el Programa.')
    await enviar(enDialogo('#formulario-motivo'))
    await esperar(() => wrapper.text().includes('quedó desvinculado'))
    expect(
      peticionA('POST', `/api/vinculos/${ID_ORGANIZACION.vinculoMateo}/desvinculacion`).cuerpo,
    ).toEqual({ motivo: 'Dejó de dictar en el Programa.' })
    wrapper.unmount()
  })
})

describe('Estructura y mis Programas (CU-034, RF-072 a RF-077)', () => {
  it('cualquier usuario activo ve los cargos vigentes; un docente no entra a Facultades', async () => {
    iniciarServidorFalso({ usuario: USUARIO_DOCENTE })
    const { wrapper, router } = await montarApp('/estructura')
    await esperar(() => wrapper.text().includes('María Fernanda Gómez'))
    expect(wrapper.text()).toContain('Carlos Restrepo')
    expect(wrapper.text()).toContain('Juan Pablo Zuluaga')

    await router.push('/facultades')
    expect(router.currentRoute.value.name).toBe('inicio')
    wrapper.unmount()
  })

  it('un estudiante ve sus Programas en Mi cuenta', async () => {
    iniciarServidorFalso({ usuario: USUARIO_ESTUDIANTE })
    const { wrapper } = await montarApp('/mi-cuenta')
    await esperar(() => wrapper.find('.perfil__programas').exists())
    await esperar(() =>
      wrapper.find('.perfil__programas').text().includes('Ingeniería de Sistemas'),
    )
    expect(wrapper.find('.perfil__programas').text()).toContain('Estudiante')
    expect(peticiones.some((p) => p.ruta === '/api/cuenta/vinculos')).toBe(true)
    wrapper.unmount()
  })

  it('validaciones del formulario y formato de fechas', () => {
    expect(validarNombre('', 'facultad')).toBe(MENSAJES_ORGANIZACION.nombreRequerido)
    expect(validarNombre('Ab', 'facultad')).toContain('entre 3 y 80')
    expect(validarNombre('a'.repeat(101), 'programa')).toContain('entre 3 y 100')
    expect(validarNombre('Sistemas', 'programa', [{ id: '1', nombre: 'sistemas' }], '1')).toBe('')
    expect(validarVinculo({ correo: '', tipoVinculo: '' })).toEqual({
      correo: MENSAJES_ORGANIZACION.correoRequerido,
      tipoVinculo: MENSAJES_ORGANIZACION.tipoRequerido,
    })
    expect(validarMotivo('corto')).toBe(MENSAJES_ORGANIZACION.motivoLongitud)
    expect(validarMotivo('')).toBe(MENSAJES_ORGANIZACION.motivoRequerido)
    expect(formatFecha('1000-01-01T00:00:00')).toBe('')
    expect(formatFecha('no es fecha')).toBe('')
    expect(formatFecha('2026-11-10T10:00:00')).not.toBe('')
  })
})
