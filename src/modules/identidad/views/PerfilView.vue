<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { RUTA_ESTADO_CUENTA } from '@/router/inicio'
import { nombreRol } from '@/shared/domain/cuenta'
import { useSesionStore } from '@/stores/sesionStore'
import CambiarCelularForm from '../components/CambiarCelularForm.vue'
import EstadoValidaciones from '../components/EstadoValidaciones.vue'
import { useCuentaStore } from '../stores/cuentaStore'
import {
  LIMITES,
  MENSAJE_CORREO_CAMBIADO,
  validarCorreo,
  validarDatosPersonales,
} from '../utils/identidadValidations'

const store = useCuentaStore()
const sesion = useSesionStore()
const router = useRouter()

const datos = reactive({ nombres: '', apellidos: '' })
const errores = ref({})
const mensajeDatos = ref({ texto: '', error: false })
const guardandoDatos = ref(false)

const correo = ref('')
const errorCorreo = ref('')
const errorServidorCorreo = ref('')
const guardandoCorreo = ref(false)

onMounted(async () => {
  await store.cargar()
  datos.nombres = store.cuenta?.nombres ?? ''
  datos.apellidos = store.cuenta?.apellidos ?? ''
})

async function guardarDatos() {
  mensajeDatos.value = { texto: '', error: false }
  errores.value = validarDatosPersonales(datos)
  if (Object.keys(errores.value).length) return

  guardandoDatos.value = true
  try {
    await store.actualizarDatosPersonales({ ...datos })
    await sesion.cargarSesion()
    mensajeDatos.value = { texto: 'Tus nombres y apellidos quedaron actualizados.', error: false }
  } catch (e) {
    mensajeDatos.value = { texto: e.message, error: true }
  } finally {
    guardandoDatos.value = false
  }
}

async function celularCambiado() {
  await sesion.cargarSesion()
  router.replace(RUTA_ESTADO_CUENTA)
}

async function cambiarCorreo() {
  errorServidorCorreo.value = ''
  errorCorreo.value = validarCorreo(correo.value, store.cuenta?.correo)
  if (errorCorreo.value) return

  guardandoCorreo.value = true
  try {
    await store.cambiarCorreo(correo.value)
    await sesion.cerrarSesion()
    sesion.olvidarSesion(MENSAJE_CORREO_CAMBIADO)
    router.replace({ name: 'login' })
  } catch (e) {
    errorServidorCorreo.value = e.message
  } finally {
    guardandoCorreo.value = false
  }
}
</script>

<template>
  <div class="perfil">
    <PageHeader
      title="Mi cuenta"
      subtitle="Consulta y actualiza tus datos personales y de contacto."
    />

    <p v-if="store.error" class="perfil__error" role="alert">{{ store.error }}</p>

    <div v-if="store.cuenta" class="perfil__grid">
      <BaseCard>
        <h2 class="perfil__titulo">Mis datos</h2>
        <dl class="perfil__datos">
          <dt>Rol</dt>
          <dd>{{ nombreRol(store.cuenta.rol) || 'Sin rol vigente' }}</dd>
          <dt>Correo</dt>
          <dd>{{ store.cuenta.correo }}</dd>
        </dl>
        <EstadoValidaciones :cuenta="store.cuenta" />
      </BaseCard>

      <BaseCard>
        <h2 class="perfil__titulo">Nombres y apellidos</h2>
        <form class="perfil__form" novalidate @submit.prevent="guardarDatos">
          <div>
            <label for="perfil-nombres" class="field-label">Nombres</label>
            <input
              id="perfil-nombres"
              v-model="datos.nombres"
              class="input"
              :maxlength="LIMITES.nombres.maximo"
              :aria-invalid="errores.nombres ? 'true' : undefined"
            />
            <p v-if="errores.nombres" class="field-error">{{ errores.nombres }}</p>
          </div>
          <div>
            <label for="perfil-apellidos" class="field-label">Apellidos</label>
            <input
              id="perfil-apellidos"
              v-model="datos.apellidos"
              class="input"
              :maxlength="LIMITES.apellidos.maximo"
              :aria-invalid="errores.apellidos ? 'true' : undefined"
            />
            <p v-if="errores.apellidos" class="field-error">{{ errores.apellidos }}</p>
          </div>
          <p
            v-if="mensajeDatos.texto"
            class="perfil__mensaje"
            :class="{ 'perfil__mensaje--error': mensajeDatos.error }"
            :role="mensajeDatos.error ? 'alert' : 'status'"
          >
            {{ mensajeDatos.texto }}
          </p>
          <BaseButton type="submit" class="perfil__guardar-datos" :loading="guardandoDatos">
            Guardar
          </BaseButton>
        </form>
      </BaseCard>

      <BaseCard>
        <h2 class="perfil__titulo">Celular</h2>
        <p class="perfil__aviso">
          Al cambiarlo, tu cuenta queda pendiente hasta que verifiques el número nuevo.
        </p>
        <CambiarCelularForm @cambiado="celularCambiado" />
      </BaseCard>

      <BaseCard>
        <h2 class="perfil__titulo">Correo</h2>
        <p class="perfil__aviso">
          Al cambiarlo se cerrará tu sesión. Para verificarlo, entra con Google usando el correo
          nuevo.
        </p>
        <form class="perfil__form" novalidate @submit.prevent="cambiarCorreo">
          <div>
            <label for="perfil-correo" class="field-label">Correo nuevo</label>
            <input
              id="perfil-correo"
              v-model="correo"
              class="input"
              type="email"
              :aria-invalid="errorCorreo ? 'true' : undefined"
            />
            <p v-if="errorCorreo" class="field-error">{{ errorCorreo }}</p>
          </div>
          <p v-if="errorServidorCorreo" class="perfil__mensaje perfil__mensaje--error" role="alert">
            {{ errorServidorCorreo }}
          </p>
          <BaseButton type="submit" class="perfil__cambiar-correo" :loading="guardandoCorreo">
            Cambiar correo
          </BaseButton>
        </form>
      </BaseCard>
    </div>
  </div>
</template>

<style scoped>
.perfil {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.perfil__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--space-4);
}

.perfil__titulo {
  margin-bottom: var(--space-3);
  font-size: var(--text-lg);
  font-weight: 700;
}

.perfil__datos {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--space-1) var(--space-3);
  margin-bottom: var(--space-3);
}

.perfil__datos dt {
  font-weight: 600;
  color: var(--color-label);
}

.perfil__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.perfil__aviso {
  margin-bottom: var(--space-3);
  font-size: var(--text-sm);
  color: var(--color-label);
}

.perfil__mensaje {
  font-size: var(--text-sm);
  color: var(--color-success);
}

.perfil__mensaje--error,
.perfil__error {
  color: var(--color-danger);
}
</style>
