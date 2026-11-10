import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'

import App from '../App.vue'
import { protegerRutas, routes } from '../router'
import { MENSAJE_CORREO_CAMBIADO } from '../modules/identidad/utils/identidadValidations'
import {
  CELULAR_OCUPADO,
  MENSAJES,
  OPCIONES_REGISTRO,
  USUARIO_NO_REGISTRADO,
  USUARIO_PENDIENTE,
  USUARIO_PENDIENTE_VERIFICACION,
  cuentaGuardada,
  iniciarServidorFalso,
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

const USUARIO_GOOGLE = { ...USUARIO_NO_REGISTRADO, nombres: 'Sofía', apellidos: 'Henao' }
const ID_PROGRAMA = OPCIONES_REGISTRO.programas[0].id
const ID_FACULTAD = OPCIONES_REGISTRO.facultades[0].id
const peticionesA = (metodo, ruta) =>
  peticiones.filter((p) => p.metodo === metodo && p.ruta === ruta)

describe('Registro con el correo de Google (CU-016)', () => {
  it('trae el nombre de Google, pide el Programa según el rol y envía la solicitud', async () => {
    iniciarServidorFalso({ usuario: USUARIO_GOOGLE })
    const { wrapper, router } = await montarApp('/registro')
    await esperar(() => wrapper.findAll('.campo-rol option').length > 1)

    expect(wrapper.find('#registro-nombres').element.value).toBe('Sofía')
    expect(wrapper.find('#registro-apellidos').element.value).toBe('Henao')
    expect(wrapper.find('.campo-programa').exists()).toBe(false)

    await wrapper.find('.registro__form').trigger('submit')
    expect(wrapper.text()).toContain('El número celular es obligatorio.')
    expect(wrapper.text()).toContain('Elige el rol que solicitas.')
    expect(peticionesA('POST', '/api/registros')).toHaveLength(0)

    await wrapper.find('#registro-celular').setValue('3157654321')
    await wrapper.find('.campo-rol select').setValue('ESTUDIANTE')
    expect(wrapper.find('.campo-programa').text()).toContain('Ingeniería de Sistemas · Ingeniería')
    await wrapper.find('.campo-programa select').setValue(ID_PROGRAMA)
    await wrapper.find('.registro__form').trigger('submit')

    await esperar(() => router.currentRoute.value.name === 'estado-cuenta')
    expect(peticionesA('POST', '/api/registros')[0].cuerpo).toEqual({
      nombres: 'Sofía',
      apellidos: 'Henao',
      numeroCelular: '3157654321',
      rolSolicitado: 'ESTUDIANTE',
      idFacultad: null,
      idPrograma: ID_PROGRAMA,
    })
    await esperar(() => wrapper.text().includes('Modo demostración'))
    expect(wrapper.text()).toContain('Tu cuenta aún no está activa')
    expect(wrapper.text()).toContain('123456')
    wrapper.unmount()
  })

  it('el Coordinador de Facultad elige una Facultad y no un Programa', async () => {
    iniciarServidorFalso({ usuario: USUARIO_GOOGLE })
    const { wrapper } = await montarApp('/registro')
    await esperar(() => wrapper.findAll('.campo-rol option').length > 1)

    await wrapper.find('#registro-celular').setValue('3157654321')
    await wrapper.find('.campo-rol select').setValue('COORDINADOR_FACULTAD')
    expect(wrapper.find('.campo-programa').exists()).toBe(false)
    await wrapper.find('.campo-facultad select').setValue(ID_FACULTAD)
    await wrapper.find('.registro__form').trigger('submit')

    await esperar(() => peticionesA('POST', '/api/registros').length === 1)
    expect(peticionesA('POST', '/api/registros')[0].cuerpo).toMatchObject({
      rolSolicitado: 'COORDINADOR_FACULTAD',
      idFacultad: ID_FACULTAD,
      idPrograma: null,
    })
    wrapper.unmount()
  })

  it('si el back-end rechaza la solicitud se muestra su mensaje', async () => {
    iniciarServidorFalso({ usuario: USUARIO_GOOGLE })
    const { wrapper, router } = await montarApp('/registro')
    await esperar(() => wrapper.findAll('.campo-rol option').length > 1)

    await wrapper.find('#registro-celular').setValue(CELULAR_OCUPADO)
    await wrapper.find('.campo-rol select').setValue('COORDINADOR_ACADEMICO')
    await wrapper.find('.registro__form').trigger('submit')

    await esperar(() => wrapper.find('.registro__error').exists())
    expect(wrapper.find('.registro__error').text()).toBe(MENSAJES.celularRepetido)
    expect(router.currentRoute.value.name).toBe('registro')
    wrapper.unmount()
  })

  it('una cuenta ya registrada no vuelve a ver el formulario de registro', async () => {
    iniciarServidorFalso({ usuario: USUARIO_PENDIENTE })
    const { wrapper, router } = await montarApp('/registro')
    expect(router.currentRoute.value.name).toBe('estado-cuenta')
    wrapper.unmount()
  })
})

describe('Verificación del celular con código simulado (CU-017)', () => {
  it('un código errado muestra el error; reenviar cambia el código; el correcto activa la cuenta', async () => {
    iniciarServidorFalso({ usuario: USUARIO_PENDIENTE_VERIFICACION })
    const { wrapper, router } = await montarApp('/estado-cuenta')
    await esperar(() => wrapper.find('#codigo-verificacion').exists())
    expect(wrapper.text()).toContain('Celular 3001234567')

    await wrapper.find('#codigo-verificacion').setValue('12')
    await wrapper.find('.verificacion__form').trigger('submit')
    expect(wrapper.text()).toContain('El código tiene 6 dígitos.')

    await wrapper.find('#codigo-verificacion').setValue('000000')
    await wrapper.find('.verificacion__form').trigger('submit')
    await esperar(() => wrapper.find('.verificacion__mensaje--error').exists())
    expect(wrapper.find('.verificacion__mensaje--error').text()).toBe(MENSAJES.codigoIncorrecto)

    await wrapper.find('.verificacion__reenviar').trigger('click')
    await esperar(() => wrapper.text().includes('654321'))

    await wrapper.find('#codigo-verificacion').setValue('654321')
    await wrapper.find('.verificacion__form').trigger('submit')
    await esperar(() => router.currentRoute.value.name === 'inicio')
    wrapper.unmount()
  })

  it('si aún falta la aprobación, verificar el celular deja la cuenta pendiente', async () => {
    iniciarServidorFalso({ usuario: USUARIO_PENDIENTE })
    const { wrapper, router } = await montarApp('/estado-cuenta')
    await esperar(() => wrapper.find('#codigo-verificacion').exists())

    await wrapper.find('#codigo-verificacion').setValue('123456')
    await wrapper.find('.verificacion__form').trigger('submit')

    await esperar(() => !wrapper.find('#codigo-verificacion').exists())
    expect(cuentaGuardada().celularVerificado).toBe(true)
    expect(router.currentRoute.value.name).toBe('estado-cuenta')
    expect(wrapper.text()).toContain('Pendiente de aprobación')
    wrapper.unmount()
  })

  it('con el número equivocado se puede cambiar el celular y llega un código nuevo', async () => {
    iniciarServidorFalso({ usuario: USUARIO_PENDIENTE })
    const { wrapper } = await montarApp('/estado-cuenta')
    await esperar(() => wrapper.find('.verificacion__otro-celular').exists())

    await wrapper.find('.verificacion__otro-celular').trigger('click')
    await wrapper.find('#celular-nuevo').setValue('3112223344')
    await wrapper.find('.cambiar-celular').trigger('submit')

    await esperar(() => wrapper.text().includes('777777'))
    expect(peticionesA('PUT', '/api/cuenta/celular')[0].cuerpo).toEqual({
      numeroCelular: '3112223344',
    })
    expect(wrapper.text()).toContain('Celular 3112223344')
    wrapper.unmount()
  })
})

describe('Mi cuenta (CU-020)', () => {
  it('muestra los datos y actualiza nombres y apellidos', async () => {
    const { wrapper } = await montarApp('/mi-cuenta')
    await esperar(() => wrapper.find('#perfil-nombres').exists())
    expect(wrapper.text()).toContain('Administrador')
    expect(wrapper.find('#perfil-nombres').element.value).toBe('Andrea')

    await wrapper.find('#perfil-nombres').setValue('')
    await wrapper.findAll('.perfil__form')[0].trigger('submit')
    expect(wrapper.text()).toContain('Los nombres son obligatorios.')

    await wrapper.find('#perfil-nombres').setValue(' Andrea Lucía ')
    await wrapper.findAll('.perfil__form')[0].trigger('submit')
    await esperar(() => wrapper.text().includes('quedaron actualizados'))
    expect(peticionesA('PUT', '/api/cuenta/datos-personales')[0].cuerpo).toEqual({
      nombres: 'Andrea Lucía',
      apellidos: 'Ríos',
    })
    await esperar(() => wrapper.find('.topbar__user-name').text() === 'Andrea Lucía Ríos')
    wrapper.unmount()
  })

  it('cambiar el celular saca la cuenta de activa y lleva a verificarlo', async () => {
    const { wrapper, router } = await montarApp('/mi-cuenta')
    await esperar(() => wrapper.find('#celular-nuevo').exists())

    await wrapper.find('#celular-nuevo').setValue('3001234567')
    await wrapper.find('.cambiar-celular').trigger('submit')
    expect(wrapper.text()).toContain('El número nuevo es igual al que ya tienes.')

    await wrapper.find('#celular-nuevo').setValue('3112223344')
    await wrapper.find('.cambiar-celular').trigger('submit')

    await esperar(() => router.currentRoute.value.name === 'estado-cuenta')
    await esperar(() => wrapper.text().includes('777777'))
    expect(wrapper.text()).toContain('Pendiente de verificación')
    wrapper.unmount()
  })

  it('cambiar el correo cierra la sesión y pide entrar con el correo nuevo', async () => {
    const { wrapper, router } = await montarApp('/mi-cuenta')
    await esperar(() => wrapper.find('#perfil-correo').exists())

    await wrapper.find('#perfil-correo').setValue(' Andrea.Nueva@UCO.net.co ')
    await wrapper.findAll('.perfil__form')[1].trigger('submit')

    await esperar(() => router.currentRoute.value.name === 'login')
    expect(peticionesA('PUT', '/api/cuenta/correo')[0].cuerpo).toEqual({
      correoInstitucional: 'andrea.nueva@uco.net.co',
    })
    expect(peticiones.at(-1)).toMatchObject({ metodo: 'POST', ruta: '/api/autenticacion/salir' })
    await esperar(() => wrapper.find('[role="alert"]').exists())
    expect(wrapper.find('[role="alert"]').text()).toContain(MENSAJE_CORREO_CAMBIADO)
    wrapper.unmount()
  })
})
