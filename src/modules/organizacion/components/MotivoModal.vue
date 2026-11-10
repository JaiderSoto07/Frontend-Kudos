<script setup>
import { ref, watch } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import { LIMITES_MOTIVO, validarMotivo } from '../utils/organizacionValidations'

const props = defineProps({
  abierto: { type: Boolean, required: true },
  titulo: { type: String, required: true },
  mensaje: { type: String, default: '' },
  confirmar: { type: Function, required: true },
})

const emit = defineEmits(['cerrar', 'hecho'])

const motivo = ref('')
const errorCampo = ref('')
const errorServidor = ref('')
const guardando = ref(false)

watch(
  () => props.abierto,
  () => {
    motivo.value = ''
    errorCampo.value = ''
    errorServidor.value = ''
  },
)

async function enviar() {
  errorServidor.value = ''
  errorCampo.value = validarMotivo(motivo.value)
  if (errorCampo.value) return

  guardando.value = true
  try {
    await props.confirmar(motivo.value)
    emit('hecho')
  } catch (e) {
    errorServidor.value = e.message
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <BaseModal :open="abierto" :title="titulo" :persistent="guardando" @close="emit('cerrar')">
    <form id="formulario-motivo" class="motivo" novalidate @submit.prevent="enviar">
      <p v-if="mensaje">{{ mensaje }}</p>
      <div>
        <label for="motivo-texto" class="field-label">Motivo</label>
        <textarea
          id="motivo-texto"
          v-model="motivo"
          class="input motivo__texto"
          rows="3"
          :maxlength="LIMITES_MOTIVO.maximo"
        />
        <p v-if="errorCampo" class="field-error">{{ errorCampo }}</p>
      </div>
      <p v-if="errorServidor" class="motivo__error" role="alert">{{ errorServidor }}</p>
    </form>
    <template #footer>
      <BaseButton variant="outline" :disabled="guardando" @click="emit('cerrar')"
        >Cancelar</BaseButton
      >
      <BaseButton type="submit" form="formulario-motivo" danger :loading="guardando"
        >Confirmar</BaseButton
      >
    </template>
  </BaseModal>
</template>

<style scoped>
.motivo {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.motivo__texto {
  height: auto;
  padding: var(--space-3);
  resize: vertical;
}

.motivo__error {
  font-size: var(--text-sm);
  color: var(--color-danger);
}
</style>
