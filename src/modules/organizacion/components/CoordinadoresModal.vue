<script setup>
import { ref, watch } from 'vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import HistorialCoordinadores from './HistorialCoordinadores.vue'

const props = defineProps({
  titulo: { type: String, default: '' },
  cargar: { type: Function, default: null },
})

const emit = defineEmits(['cerrar'])

const coordinadores = ref([])
const error = ref('')

watch(
  () => props.cargar,
  async (cargar) => {
    coordinadores.value = []
    error.value = ''
    if (!cargar) return
    try {
      coordinadores.value = await cargar()
    } catch (e) {
      error.value = e.message
    }
  },
)
</script>

<template>
  <BaseModal :open="cargar != null" :title="titulo" @close="emit('cerrar')">
    <p v-if="error" class="coordinadores__error" role="alert">{{ error }}</p>
    <HistorialCoordinadores v-else :coordinadores="coordinadores" />
  </BaseModal>
</template>

<style scoped>
.coordinadores__error {
  color: var(--color-danger);
}
</style>
