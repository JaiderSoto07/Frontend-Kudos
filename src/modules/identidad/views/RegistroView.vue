<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '@/components/icons/AppIcon.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { RUTA_ESTADO_CUENTA } from '@/router/inicio'
import { useSesionStore } from '@/stores/sesionStore'
import RolAmbitoCampos from '../components/RolAmbitoCampos.vue'
import { identidadService } from '../services/identidadService'
import { LIMITES, validarRegistro } from '../utils/identidadValidations'

const sesion = useSesionStore()
const router = useRouter()

const formulario = reactive({
  nombres: sesion.usuario?.nombres ?? '',
  apellidos: sesion.usuario?.apellidos ?? '',
  celular: '',
  rol: '',
  idPrograma: '',
  idFacultad: '',
})
const opciones = ref({ roles: [], facultades: [], programas: [] })
const errores = ref({})
const errorServidor = ref('')
const cargando = ref(true)
const enviando = ref(false)
const saliendo = ref(false)

onMounted(async () => {
  try {
    opciones.value = await identidadService.consultarOpcionesRegistro()
  } catch (e) {
    errorServidor.value = e.message
  } finally {
    cargando.value = false
  }
})

async function registrar() {
  errorServidor.value = ''
  errores.value = validarRegistro(formulario)
  if (Object.keys(errores.value).length) return

  enviando.value = true
  try {
    await identidadService.registrar({ ...formulario })
    await sesion.cargarSesion()
    await router.replace(RUTA_ESTADO_CUENTA)
  } catch (e) {
    errorServidor.value = e.message
  } finally {
    enviando.value = false
  }
}

async function salir() {
  saliendo.value = true
  await sesion.cerrarSesion()
  saliendo.value = false
  await router.replace({ name: 'login' })
}
</script>

<template>
  <div class="registro">
    <section class="registro__card">
      <header class="registro__header">
        <span class="registro__badge"><AppIcon name="user" :size="22" /></span>
        <div>
          <h1 class="registro__title">Solicita tu cuenta</h1>
          <p class="registro__correo">{{ sesion.usuario?.correo }}</p>
        </div>
      </header>

      <p class="registro__intro">
        Google ya confirmó tu correo. Completa tus datos; la autoridad que te corresponde aprobará
        tu solicitud y tú verificarás tu celular con un código.
      </p>

      <form class="registro__form" novalidate @submit.prevent="registrar">
        <div class="registro__fila">
          <div>
            <label for="registro-nombres" class="field-label">Nombres</label>
            <input
              id="registro-nombres"
              v-model="formulario.nombres"
              class="input"
              :maxlength="LIMITES.nombres.maximo"
              :aria-invalid="errores.nombres ? 'true' : undefined"
            />
            <p v-if="errores.nombres" class="field-error">{{ errores.nombres }}</p>
          </div>
          <div>
            <label for="registro-apellidos" class="field-label">Apellidos</label>
            <input
              id="registro-apellidos"
              v-model="formulario.apellidos"
              class="input"
              :maxlength="LIMITES.apellidos.maximo"
              :aria-invalid="errores.apellidos ? 'true' : undefined"
            />
            <p v-if="errores.apellidos" class="field-error">{{ errores.apellidos }}</p>
          </div>
        </div>

        <div>
          <label for="registro-celular" class="field-label">Celular</label>
          <input
            id="registro-celular"
            v-model="formulario.celular"
            class="input"
            type="tel"
            inputmode="numeric"
            placeholder="3001234567"
            :maxlength="LIMITES.celular.longitud"
            :aria-invalid="errores.celular ? 'true' : undefined"
          />
          <p v-if="errores.celular" class="field-error">{{ errores.celular }}</p>
        </div>

        <RolAmbitoCampos
          v-model:rol="formulario.rol"
          v-model:id-programa="formulario.idPrograma"
          v-model:id-facultad="formulario.idFacultad"
          :opciones="opciones"
          :errores="errores"
          :disabled="cargando"
        />

        <p v-if="errorServidor" class="registro__error" role="alert">{{ errorServidor }}</p>

        <BaseButton type="submit" class="registro__enviar" :loading="enviando" :disabled="cargando">
          Enviar solicitud
        </BaseButton>
      </form>

      <BaseButton variant="outline" class="registro__salir" :loading="saliendo" @click="salir">
        <AppIcon name="logout" :size="18" /> Ingresar con otra cuenta
      </BaseButton>
    </section>
  </div>
</template>

<style scoped>
.registro {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: var(--space-8) var(--space-4);
  background: var(--color-bg);
}

.registro__card {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  width: 100%;
  max-width: 560px;
  padding: var(--space-8);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}

.registro__header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.registro__badge {
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

.registro__title {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-title-accent);
}

.registro__correo,
.registro__intro {
  font-size: var(--text-sm);
  color: var(--color-label);
}

.registro__intro {
  line-height: 1.5;
}

.registro__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.registro__fila {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

.registro__error {
  padding: var(--space-3);
  font-size: var(--text-sm);
  color: var(--color-danger);
  background: var(--color-primary-soft);
  border-radius: var(--radius-sm);
}

.registro__enviar,
.registro__salir {
  width: 100%;
}

@media (max-width: 560px) {
  .registro__fila {
    grid-template-columns: 1fr;
  }
}
</style>
