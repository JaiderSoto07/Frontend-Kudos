<script setup>
import BaseButton from './BaseButton.vue'
import BaseModal from './BaseModal.vue'

defineProps({
  open: { type: Boolean, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  confirmLabel: { type: String, default: 'Confirmar' },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
})

const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <BaseModal :open="open" :title="title" size="sm" :persistent="loading" @close="emit('cancel')">
    <p class="confirm__message">{{ message }}</p>
    <p v-if="error" class="confirm__error" role="alert">{{ error }}</p>
    <template #footer>
      <BaseButton variant="outline" :disabled="loading" @click="emit('cancel')"
        >Cancelar</BaseButton
      >
      <BaseButton :loading="loading" @click="emit('confirm')">{{ confirmLabel }}</BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped>
.confirm__message {
  line-height: 1.5;
}

.confirm__error {
  margin-top: var(--space-3);
  font-size: var(--text-sm);
  color: var(--color-danger);
}
</style>
