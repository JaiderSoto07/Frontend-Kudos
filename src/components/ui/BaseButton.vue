<script setup>
import AppIcon from '@/components/icons/AppIcon.vue'

defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'outline', 'icon'].includes(v),
  },
  icon: { type: String, default: '' },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  danger: { type: Boolean, default: false },
  label: { type: String, default: '' },
})
</script>

<template>
  <button
    :type="type"
    class="btn"
    :class="[`btn--${variant}`, { 'btn--danger': danger }]"
    :disabled="disabled || loading"
    :aria-label="variant === 'icon' ? label : undefined"
    :title="variant === 'icon' ? label : undefined"
  >
    <span v-if="loading" class="btn__spinner" aria-hidden="true" />
    <AppIcon v-else-if="icon" :name="icon" :size="variant === 'icon' ? 20 : 18" />
    <span v-if="variant !== 'icon'"><slot /></span>
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border-radius: var(--radius-sm);
  cursor: pointer;
  white-space: nowrap;
  transition:
    background-color 0.15s,
    border-color 0.15s,
    color 0.15s;
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.btn--primary {
  height: 48px;
  padding: 0 var(--space-6);
  font-size: var(--text-md);
  font-weight: 500;
  color: #fff;
  background: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.btn--primary:not(:disabled):hover {
  background: var(--color-primary-hover);
}

.btn--outline {
  height: 42px;
  padding: 0 var(--space-4);
  color: var(--color-text);
  background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
}

.btn--outline:not(:disabled):hover {
  background: var(--color-table-head);
}

.btn--icon {
  width: 34px;
  height: 34px;
  padding: 0;
  color: var(--color-label);
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
}

.btn--icon:not(:disabled):hover {
  background: var(--color-table-head);
  color: var(--color-text-strong);
}

.btn--icon.btn--danger {
  color: var(--color-danger);
}

.btn--icon.btn--danger:not(:disabled):hover {
  background: var(--color-primary-soft);
}

.btn__spinner {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
