<script setup>
import { ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { validarReplica } from '../utils/kudoUtils'

const props = defineProps({
  publicar: { type: Function, required: true },
  etiqueta: { type: String, default: 'Tu réplica' },
  cancelable: { type: Boolean, default: false },
})

const emit = defineEmits(['cancelar', 'publicado'])

const texto = ref('')
const error = ref('')
const guardando = ref(false)

async function enviar() {
  error.value = validarReplica(texto.value)
  if (error.value) return

  guardando.value = true
  try {
    await props.publicar(texto.value)
    texto.value = ''
    emit('publicado')
  } catch (e) {
    error.value = e.message
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <form class="responder" novalidate @submit.prevent="enviar">
    <label class="field-label">
      {{ etiqueta }}
      <textarea v-model="texto" class="input responder__texto" rows="3" />
    </label>
    <p v-if="error" class="responder__error" role="alert">{{ error }}</p>
    <div class="responder__acciones">
      <BaseButton
        v-if="cancelable"
        variant="outline"
        :disabled="guardando"
        @click="emit('cancelar')"
      >
        Cancelar
      </BaseButton>
      <BaseButton type="submit" class="responder__publicar" :loading="guardando"
        >Publicar</BaseButton
      >
    </div>
  </form>
</template>

<style scoped>
.responder {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.responder__texto {
  display: block;
  width: 100%;
  height: auto;
  margin-top: var(--space-1);
  padding: var(--space-3);
  resize: vertical;
}

.responder__error {
  font-size: var(--text-sm);
  color: var(--color-danger);
}

.responder__acciones {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
}
</style>
