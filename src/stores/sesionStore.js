import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { ESTADO_SIN_SESION } from '@/api/http'
import { autenticacionService } from '@/services/autenticacionService'
import { ESTADO_CUENTA, nombreRol, tieneAlgunRol } from '@/shared/domain/cuenta'

const continuarAunqueElBackendFalle = () => {}

export const useSesionStore = defineStore('sesion', () => {
  const usuario = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const verificada = ref(false)

  const autenticada = computed(() => usuario.value != null)
  const registrado = computed(() => usuario.value?.registrado === true)
  const cuentaActiva = computed(
    () => registrado.value && usuario.value.estadoCuenta === ESTADO_CUENTA.ACTIVA,
  )
  const rol = computed(() => usuario.value?.rol ?? '')
  const nombreDelRol = computed(() => nombreRol(rol.value))
  const nombreCompleto = computed(() =>
    [usuario.value?.nombres, usuario.value?.apellidos].filter(Boolean).join(' '),
  )

  function tieneRol(rolesPermitidos) {
    return cuentaActiva.value && tieneAlgunRol(rol.value, rolesPermitidos)
  }

  async function cargarSesion() {
    loading.value = true
    error.value = null
    try {
      usuario.value = await autenticacionService.obtenerUsuarioActual()
    } catch (e) {
      usuario.value = null
      if (e.status !== ESTADO_SIN_SESION) error.value = e.message
    } finally {
      loading.value = false
      verificada.value = true
    }
  }

  function iniciarSesionConGoogle() {
    autenticacionService.iniciarSesionConGoogle()
  }

  async function cerrarSesion() {
    await autenticacionService.cerrarSesion().catch(continuarAunqueElBackendFalle)
    olvidarSesion()
  }

  function olvidarSesion(mensaje = null) {
    usuario.value = null
    error.value = mensaje
  }

  return {
    usuario,
    loading,
    error,
    verificada,
    autenticada,
    registrado,
    cuentaActiva,
    rol,
    nombreDelRol,
    nombreCompleto,
    tieneRol,
    cargarSesion,
    iniciarSesionConGoogle,
    cerrarSesion,
    olvidarSesion,
  }
})
