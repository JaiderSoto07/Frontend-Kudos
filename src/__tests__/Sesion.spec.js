import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'

import App from '../App.vue'
import { protegerRutas, routes } from '../router'
import { http } from '../api/http'
import { autenticacionService } from '../services/autenticacionService'
import {
  USUARIO_ACTIVO,
  USUARIO_NO_REGISTRADO,
  USUARIO_PENDIENTE,
  apagarServidor,
  cerrarSesionFalsa,
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

const alerta = (wrapper) => wrapper.find('[role="alert"]')

describe('Inicio de sesión con Google', () => {
  it('sin sesión, una ruta privada lleva al login', async () => {
    iniciarServidorFalso({ conSesion: false })
    const { wrapper, router } = await montarApp('/inicio')
    expect(router.currentRoute.value.name).toBe('login')
    expect(wrapper.text()).toContain('Iniciar sesión con Google')
    expect(alerta(wrapper).exists()).toBe(false)
    wrapper.unmount()
  })

  it('el botón lleva al inicio de sesión de Google', async () => {
    iniciarServidorFalso({ conSesion: false })
    const espia = vi
      .spyOn(autenticacionService, 'iniciarSesionConGoogle')
      .mockImplementation(() => {})
    const { wrapper } = await montarApp('/login')
    await wrapper.find('.login__submit').trigger('click')
    expect(espia).toHaveBeenCalledOnce()
    wrapper.unmount()
  })

  it('si Google no completa el inicio de sesión (/login?error) se avisa', async () => {
    iniciarServidorFalso({ conSesion: false })
    const { wrapper } = await montarApp('/login?error')
    expect(alerta(wrapper).text()).toContain('No fue posible iniciar sesión con Google')
    wrapper.unmount()
  })

  it('con el back-end apagado se queda en el login y avisa que no hay conexión', async () => {
    apagarServidor()
    const { wrapper, router } = await montarApp('/inicio')
    expect(router.currentRoute.value.name).toBe('login')
    expect(alerta(wrapper).text()).toMatch(/backend esté encendido/)
    wrapper.unmount()
  })
})

describe('Estado de la cuenta (Google dice quién eres, la base decide si entras)', () => {
  it('con cuenta activa entra y muestra el nombre y el rol', async () => {
    const { wrapper, router } = await montarApp('/inicio')
    expect(router.currentRoute.value.name).toBe('inicio')
    await esperar(() => wrapper.find('.topbar__user-name').exists())
    expect(wrapper.find('.topbar__user-name').text()).toBe('Andrea Ríos')
    expect(wrapper.text()).toContain('Hola, Andrea')
    expect(wrapper.text()).toContain('Administrador')
    wrapper.unmount()
  })

  it('con cuenta activa, /login y /estado-cuenta llevan al inicio', async () => {
    const { wrapper, router } = await montarApp('/login')
    expect(router.currentRoute.value.name).toBe('inicio')
    await router.push('/estado-cuenta')
    expect(router.currentRoute.value.name).toBe('inicio')
    wrapper.unmount()
  })

  it('un correo sin registrar va al formulario de registro con su correo de Google', async () => {
    iniciarServidorFalso({ usuario: USUARIO_NO_REGISTRADO })
    const { wrapper, router } = await montarApp('/inicio')
    expect(router.currentRoute.value.name).toBe('registro')
    expect(wrapper.text()).toContain('Solicita tu cuenta')
    expect(wrapper.text()).toContain('nuevo@gmail.com')
    await router.push('/estado-cuenta')
    expect(router.currentRoute.value.name).toBe('registro')
    wrapper.unmount()
  })

  it('una cuenta pendiente de aprobación no entra a la plataforma', async () => {
    iniciarServidorFalso({ usuario: USUARIO_PENDIENTE })
    const { wrapper, router } = await montarApp('/inicio')
    expect(router.currentRoute.value.name).toBe('estado-cuenta')
    expect(wrapper.text()).toContain('Tu cuenta aún no está activa')
    expect(wrapper.text()).toContain('Pendiente de aprobación')
    expect(wrapper.find('[role="status"]').text()).toBe(USUARIO_PENDIENTE.mensajeEstado)
    expect(wrapper.find('.sidebar').exists()).toBe(false)
    wrapper.unmount()
  })

  it('desde la pantalla de estado se puede salir para ingresar con otra cuenta', async () => {
    iniciarServidorFalso({ usuario: USUARIO_PENDIENTE })
    const { wrapper, router } = await montarApp('/estado-cuenta')
    await wrapper.find('.estado__salir').trigger('click')
    await esperar(() => router.currentRoute.value.name === 'login')
    expect(peticiones.at(-1)).toMatchObject({ metodo: 'POST', ruta: '/api/autenticacion/salir' })
    wrapper.unmount()
  })
})

describe('Sesión dentro de la plataforma', () => {
  it('a la sesión se le pregunta al back-end una sola vez', async () => {
    const { wrapper, router } = await montarApp('/inicio')
    await router.push('/login')
    const consultas = peticiones.filter((p) => p.ruta === '/api/autenticacion')
    expect(consultas).toHaveLength(1)
    wrapper.unmount()
  })

  it('cerrar sesión avisa al back-end y vuelve al login', async () => {
    const { wrapper, router } = await montarApp('/inicio')
    await esperar(() => wrapper.find('.topbar__user-btn').exists())
    await wrapper.find('.topbar__user-btn').trigger('click')
    expect(wrapper.find('#menu-usuario').text()).toContain(USUARIO_ACTIVO.correoInstitucional)
    await wrapper.find('[role="menuitem"]').trigger('click')
    await esperar(() => router.currentRoute.value.name === 'login')

    expect(peticiones.at(-1)).toMatchObject({ metodo: 'POST', ruta: '/api/autenticacion/salir' })
    await router.push('/inicio')
    expect(router.currentRoute.value.name).toBe('login')
    wrapper.unmount()
  })

  it('si la sesión vence estando dentro, la siguiente petición lleva al login', async () => {
    const { wrapper, router } = await montarApp('/inicio')
    await esperar(() => wrapper.find('.topbar__user-name').exists())

    cerrarSesionFalsa()
    await http.get('/categorias').catch(() => {})
    await esperar(() => router.currentRoute.value.name === 'login')
    await esperar(() => alerta(wrapper).exists())
    expect(alerta(wrapper).text()).toContain('Tu sesión terminó')
    wrapper.unmount()
  })
})
