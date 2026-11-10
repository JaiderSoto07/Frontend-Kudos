<script setup>
import { ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useCuentaStore } from '../stores/cuentaStore'
import { LIMITES, validarCelular } from '../utils/identidadValidations'

const emit = defineEmits(['cambiado'])

const store = useCuentaStore()
const celular = ref('')
const errorCampo = ref('')
const errorServidor = ref('')
const guardando = ref(false)

async function guardar() {
  errorServidor.value = ''
  errorCampo.value = validarCelular(celular.value, store.cuenta?.celular)
  if (errorCampo.value) return

  guardando.value = true
  try {
    await store.cambiarCelular(celular.value)
    celular.value = ''
    emit('cambiado')
  } catch (e) {
    errorServidor.value = e.message
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <form class="cambiar-celular" novalidate @submit.prevent="guardar">
    <label for="celular-nuevo" class="field-label">Celular nuevo</label>
    <div class="cambiar-celular__fila">
      <input
        id="celular-nuevo"
        v-model="celular"
        class="input"
        type="tel"
        inputmode="numeric"
        placeholder="3001234567"
        :maxlength="LIMITES.celular.longitud"
        :aria-invalid="errorCampo ? 'true' : undefined"
      />
      <BaseButton type="submit" class="cambiar-celular__guardar" :loading="guardando">
        Cambiar celular
      </BaseButton>
    </div>
    <p v-if="errorCampo" class="field-error">{{ errorCampo }}</p>
    <p v-if="errorServidor" class="cambiar-celular__error" role="alert">{{ errorServidor }}</p>
    <p class="cambiar-celular__ayuda">Te enviaremos un código para verificar el número nuevo.</p>
  </form>
</template>

<style scoped>
.cambiar-celular__fila {
  display: flex;
  gap: var(--space-2);
}

.cambiar-celular__fila .input {
  flex: 1;
}

.cambiar-celular__ayuda {
  margin-top: var(--space-1);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.cambiar-celular__error {
  margin-top: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-danger);
}
</style>
