<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '@/components/icons/AppIcon.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import EstadoValidaciones from '@/modules/identidad/components/EstadoValidaciones.vue'
import NuevaSolicitudForm from '@/modules/identidad/components/NuevaSolicitudForm.vue'
import VerificacionCelular from '@/modules/identidad/components/VerificacionCelular.vue'
import { useCuentaStore } from '@/modules/identidad/stores/cuentaStore'
import { RUTA_INICIO } from '@/router/inicio'
import { useSesionStore } from '@/stores/sesionStore'
import { ESTADO_CUENTA, ESTADO_SOLICITUD, nombreEstadoCuenta } from '@/shared/domain/cuenta'

const MENSAJE_RECHAZO =
  'Tu solicitud fue rechazada. Revisa el motivo y, si quieres, envía una nueva solicitud.'
const MENSAJE_NUEVA_SOLICITUD =
  'Tu nueva solicitud quedó enviada a la autoridad que te corresponde.'

const sesion = useSesionStore()
const cuentaStore = useCuentaStore()
const router = useRouter()
const saliendo = ref(false)
const aviso = ref('')

const ESTADOS_SIN_VERIFICACION = [ESTADO_CUENTA.SUSPENDIDA, ESTADO_CUENTA.DESACTIVADA]

const titulo = computed(() =>
  sesion.registrado ? 'Tu cuenta aún no está activa' : 'Aún no tienes una cuenta',
)
const estado = computed(() => nombreEstadoCuenta(sesion.usuario?.estadoCuenta))
const puedeVerificarCelular = computed(
  () =>
    cuentaStore.cuenta &&
    !cuentaStore.cuenta.celularVerificado &&
    !ESTADOS_SIN_VERIFICACION.includes(cuentaStore.cuenta.estadoCuenta),
)
const solicitudRechazada = computed(
  () => cuentaStore.cuenta?.estadoSolicitud === ESTADO_SOLICITUD.RECHAZADA,
)
const mensaje = computed(() =>
  solicitudRechazada.value ? MENSAJE_RECHAZO : sesion.usuario?.mensajeEstado,
)

async function nuevaSolicitudEnviada() {
  await cuentaStore.recargar()
  aviso.value = MENSAJE_NUEVA_SOLICITUD
}

onMounted(async () => {
  if (sesion.registrado) await cuentaStore.cargar()
})

async function celularVerificado() {
  await sesion.cargarSesion()
  if (sesion.cuentaActiva) await router.replace(RUTA_INICIO)
  else await cuentaStore.recargar()
}

async function cerrarSesion() {
  saliendo.value = true
  await sesion.cerrarSesion()
  saliendo.value = false
  await router.replace({ name: 'login' })
}
</script>

<template>
  <div class="estado">
    <section class="estado__card">
      <header class="estado__header">
        <span class="estado__badge"><AppIcon name="alert" :size="22" /></span>
        <div>
          <h1 class="estado__title">{{ titulo }}</h1>
          <p class="estado__correo">{{ sesion.usuario?.correo }}</p>
        </div>
      </header>

      <p v-if="estado" class="estado__dato">
        Estado de la cuenta: <strong>{{ estado }}</strong>
      </p>
      <p class="estado__mensaje" role="status">{{ aviso || mensaje }}</p>

      <EstadoValidaciones v-if="cuentaStore.cuenta" :cuenta="cuentaStore.cuenta" />
      <p v-if="cuentaStore.error" class="estado__error" role="alert">{{ cuentaStore.error }}</p>
      <NuevaSolicitudForm v-if="solicitudRechazada" @enviada="nuevaSolicitudEnviada" />
      <VerificacionCelular v-if="puedeVerificarCelular" @verificado="celularVerificado" />

      <BaseButton variant="outline" class="estado__salir" :loading="saliendo" @click="cerrarSesion">
        <AppIcon name="logout" :size="18" /> Ingresar con otra cuenta
      </BaseButton>
    </section>
  </div>
</template>

<style scoped>
.estado {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: var(--space-8) var(--space-4);
  background: var(--color-bg);
}

.estado__card {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  width: 100%;
  max-width: 520px;
  padding: var(--space-8);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}

.estado__header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.estado__badge {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  color: #fff;
  background: var(--color-primary);
  border-radius: var(--radius);
}

.estado__title {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-title-accent);
}

.estado__correo {
  font-size: var(--text-sm);
  color: var(--color-label);
}

.estado__dato {
  font-size: var(--text-base);
}

.estado__mensaje {
  padding: var(--space-3);
  line-height: 1.5;
  background: var(--color-primary-soft);
  border-radius: var(--radius-sm);
}

.estado__salir {
  width: 100%;
}

.estado__error {
  font-size: var(--text-sm);
  color: var(--color-danger);
}
</style>
