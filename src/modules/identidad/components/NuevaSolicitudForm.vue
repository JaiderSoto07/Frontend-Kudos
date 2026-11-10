<script setup>
import { onMounted, reactive, ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { identidadService } from '../services/identidadService'
import RolAmbitoCampos from './RolAmbitoCampos.vue'
import { validarAmbito } from '../utils/identidadValidations'

const emit = defineEmits(['enviada'])

const formulario = reactive({ rol: '', idPrograma: '', idFacultad: '' })
const opciones = ref({ roles: [], facultades: [], programas: [] })
const errores = ref({})
const errorServidor = ref('')
const cargando = ref(true)
const enviando = ref(false)

onMounted(async () => {
  try {
    opciones.value = await identidadService.consultarOpcionesRegistro()
  } catch (e) {
    errorServidor.value = e.message
  } finally {
    cargando.value = false
  }
})

async function enviar() {
  errorServidor.value = ''
  errores.value = validarAmbito(formulario)
  if (Object.keys(errores.value).length) return

  enviando.value = true
  try {
    await identidadService.enviarNuevaSolicitud({ ...formulario })
    emit('enviada')
  } catch (e) {
    errorServidor.value = e.message
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <form class="nueva-solicitud" novalidate @submit.prevent="enviar">
    <h2 class="nueva-solicitud__titulo">Enviar una nueva solicitud</h2>
    <RolAmbitoCampos
      v-model:rol="formulario.rol"
      v-model:id-programa="formulario.idPrograma"
      v-model:id-facultad="formulario.idFacultad"
      :opciones="opciones"
      :errores="errores"
      :disabled="cargando"
    />
    <p v-if="errorServidor" class="nueva-solicitud__error" role="alert">{{ errorServidor }}</p>
    <BaseButton
      type="submit"
      class="nueva-solicitud__enviar"
      :loading="enviando"
      :disabled="cargando"
    >
      Enviar solicitud
    </BaseButton>
  </form>
</template>

<style scoped>
.nueva-solicitud {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.nueva-solicitud__titulo {
  font-size: var(--text-lg);
  font-weight: 700;
}

.nueva-solicitud__error {
  font-size: var(--text-sm);
  color: var(--color-danger);
}
</style>
