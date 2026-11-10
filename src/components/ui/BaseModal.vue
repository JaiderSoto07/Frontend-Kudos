<script setup>
import { nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'
import AppIcon from '@/components/icons/AppIcon.vue'

const props = defineProps({
  open: { type: Boolean, required: true },
  title: { type: String, required: true },
  size: { type: String, default: 'md', validator: (v) => ['sm', 'md', 'lg'].includes(v) },
  persistent: { type: Boolean, default: false },
})

const emit = defineEmits(['close'])

const titleId = useId()
const dialog = ref(null)
let focoPrevio = null

function cerrar() {
  if (!props.persistent) emit('close')
}

function onKeydown(e) {
  if (e.key === 'Escape') cerrar()
}

watch(
  () => props.open,
  async (abierto) => {
    if (abierto) {
      focoPrevio = document.activeElement
      document.addEventListener('keydown', onKeydown)
      await nextTick()
      dialog.value?.focus()
    } else {
      document.removeEventListener('keydown', onKeydown)
      focoPrevio?.focus?.()
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="overlay" @mousedown.self="cerrar">
      <div
        ref="dialog"
        class="modal"
        :class="`modal--${size}`"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        tabindex="-1"
      >
        <header class="modal__header">
          <div class="modal__title-wrap">
            <slot name="icon" />
            <h2 :id="titleId" class="modal__title">{{ title }}</h2>
          </div>
          <button
            type="button"
            class="modal__close"
            aria-label="Cerrar"
            :disabled="persistent"
            @click="cerrar"
          >
            <AppIcon name="x" />
          </button>
        </header>
        <div class="modal__body">
          <slot />
        </div>
        <footer v-if="$slots.footer" class="modal__footer">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  background: rgba(17, 24, 39, 0.45);
}

.modal {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: calc(100vh - 32px);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-modal);
  outline: none;
}

.modal--sm {
  max-width: 440px;
}

.modal--md {
  max-width: 640px;
}

.modal--lg {
  max-width: 860px;
}

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--color-border);
}

.modal__title-wrap {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.modal__title {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-title-accent);
}

.modal__close {
  display: inline-flex;
  padding: var(--space-1);
  color: var(--color-label);
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.modal__close:hover {
  background: var(--color-table-head);
}

.modal__body {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-6);
}

.modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--color-border);
}
</style>
