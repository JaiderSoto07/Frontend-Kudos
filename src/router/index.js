import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import { alSesionVencida } from '@/api/http'
import { useSesionStore } from '@/stores/sesionStore'
import {
  ROLES_APROBADORES,
  ROLES_CONSULTAN_AUDITORIA,
  ROLES_CONSULTAN_ORGANIZACION,
  ROLES_GESTORES_CATEGORIAS,
  ROLES_MODERADORES,
  ROLES_QUE_REGISTRAN_AUTORIDADES,
} from '@/shared/domain/cuenta'
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
        component: () => import('@/modules/kudos/views/MuroView.vue'),
        meta: { title: 'Inicio' },
      },
      {
        path: 'categorias',
        name: 'categorias',
        component: () => import('@/modules/categorias/views/CategoriasView.vue'),
        meta: { title: 'Categorías', roles: ROLES_GESTORES_CATEGORIAS },
      },
      {
        path: 'solicitudes',
        name: 'solicitudes',
        component: () => import('@/modules/solicitudes/views/SolicitudesView.vue'),
        meta: { title: 'Solicitudes', roles: ROLES_APROBADORES },
      },
      {
        path: 'autoridades',
        name: 'autoridades',
        component: () => import('@/modules/autoridades/views/RegistrarAutoridadView.vue'),
        meta: { title: 'Registrar autoridad', roles: ROLES_QUE_REGISTRAN_AUTORIDADES },
      },
      {
        path: 'kudos/:id',
        name: 'kudo-detalle',
        component: () => import('@/modules/kudos/views/KudoDetalleView.vue'),
        props: true,
        meta: { title: 'Kudo' },
      },
      {
        path: 'personas/:id/kudos',
        name: 'historial-kudos',
        component: () => import('@/modules/kudos/views/HistorialKudosView.vue'),
        props: true,
        meta: { title: 'Kudos de la persona' },
      },
      {
        path: 'mis-kudos',
        name: 'mis-kudos',
        component: () => import('@/modules/kudos/views/HistorialKudosView.vue'),
        meta: { title: 'Mis Kudos' },
      },
      {
        path: 'mis-reportes',
        name: 'mis-reportes',
        component: () => import('@/modules/moderacion/views/MisReportesView.vue'),
        meta: { title: 'Mis reportes' },
      },
      {
        path: 'moderacion',
        name: 'moderacion',
        component: () => import('@/modules/moderacion/views/ModeracionView.vue'),
        meta: { title: 'Moderación', roles: ROLES_MODERADORES },
      },
      {
        path: 'auditoria',
        name: 'auditoria',
        component: () => import('@/modules/auditoria/views/AuditoriaView.vue'),
        meta: { title: 'Auditoría', roles: ROLES_CONSULTAN_AUDITORIA },
      },
      {
        path: 'estructura',
        name: 'estructura',
        component: () => import('@/modules/organizacion/views/EstructuraView.vue'),
        meta: { title: 'Estructura' },
      },
      {
        path: 'facultades',
        name: 'facultades',
        component: () => import('@/modules/organizacion/views/FacultadesView.vue'),
        meta: { title: 'Facultades', roles: ROLES_CONSULTAN_ORGANIZACION },
      },
      {
        path: 'programas',
        name: 'programas',
        component: () => import('@/modules/organizacion/views/ProgramasView.vue'),
        meta: { title: 'Programas', roles: ROLES_CONSULTAN_ORGANIZACION },
      },
      {
        path: 'programas/:id',
        name: 'programa-detalle',
        component: () => import('@/modules/organizacion/views/ProgramaDetalleView.vue'),
        props: true,
        meta: { title: 'Programa', roles: ROLES_CONSULTAN_ORGANIZACION },
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

  alSesionVencida(async (error) => {
    const sesion = useSesionStore()
    if (!sesion.autenticada) return
    sesion.olvidarSesion(error.message)
    await router.replace({ name: 'login' })
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
