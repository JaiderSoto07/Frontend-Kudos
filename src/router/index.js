import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import { alSesionVencida } from '@/api/http'
import { useSesionStore } from '@/stores/sesionStore'
import { ROLES_GESTORES_CATEGORIAS } from '@/shared/domain/cuenta'
import { RUTA_ESTADO_CUENTA, RUTA_INICIO, RUTA_REGISTRO } from './inicio'

export const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/modules/autenticacion/views/LoginView.vue'),
    meta: { title: 'Iniciar sesión', publica: true },
  },
  {
    path: '/registro',
    name: 'registro',
    component: () => import('@/modules/identidad/views/RegistroView.vue'),
    meta: { title: 'Solicitar cuenta', soloSinRegistro: true },
  },
  {
    path: '/estado-cuenta',
    name: 'estado-cuenta',
    component: () => import('@/modules/autenticacion/views/EstadoCuentaView.vue'),
    meta: { title: 'Estado de la cuenta', sinCuentaActiva: true },
  },
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', redirect: RUTA_INICIO },
      {
        path: 'inicio',
        name: 'inicio',
        component: () => import('@/modules/inicio/views/InicioView.vue'),
        meta: { title: 'Inicio' },
      },
      {
        path: 'categorias',
        name: 'categorias',
        component: () => import('@/modules/categorias/views/CategoriasView.vue'),
        meta: { title: 'Categorías', roles: ROLES_GESTORES_CATEGORIAS },
      },
      {
        path: 'mi-cuenta',
        name: 'mi-cuenta',
        component: () => import('@/modules/identidad/views/PerfilView.vue'),
        meta: { title: 'Mi cuenta' },
      },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: RUTA_INICIO },
]

export function protegerRutas(router) {
  router.beforeEach(async (to) => {
    const sesion = useSesionStore()
    if (!sesion.verificada) await sesion.cargarSesion()
    const publica = to.matched.some((r) => r.meta.publica)
    const sinCuentaActiva = to.matched.some((r) => r.meta.sinCuentaActiva)
    const soloSinRegistro = to.matched.some((r) => r.meta.soloSinRegistro)

    if (!sesion.autenticada) return publica ? true : { name: 'login' }
    if (!sesion.registrado) return soloSinRegistro ? true : RUTA_REGISTRO
    if (soloSinRegistro) return sesion.cuentaActiva ? RUTA_INICIO : RUTA_ESTADO_CUENTA
    if (!sesion.cuentaActiva) return sinCuentaActiva ? true : RUTA_ESTADO_CUENTA
    if (publica || sinCuentaActiva) return RUTA_INICIO

    const rolesPermitidos = to.matched.flatMap((r) => r.meta.roles ?? [])
    if (!sesion.tieneRol(rolesPermitidos)) return RUTA_INICIO
    return true
  })

  alSesionVencida((error) => {
    const sesion = useSesionStore()
    if (!sesion.autenticada) return
    sesion.olvidarSesion(error.message)
    router.replace({ name: 'login' })
  })
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

protegerRutas(router)

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · UCO Kudos` : 'UCO Kudos'
})

export default router
