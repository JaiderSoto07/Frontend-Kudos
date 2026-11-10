<script setup>
defineProps({
  label: { type: String, required: true },
  tone: { type: String, default: 'success', validator: (v) => ['success', 'muted'].includes(v) },
})
</script>

<template>
  <span class="status" :class="`status--${tone}`">
    <span class="status__dot" aria-hidden="true" />
    {{ label }}
  </span>
</template>

<style scoped>
.status {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  white-space: nowrap;
}

.status__dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status--success {
  color: var(--color-success);
}

.status--success .status__dot {
  background: var(--color-success);
}

.status--muted {
  color: var(--color-text-muted);
}

.status--muted .status__dot {
  background: var(--color-muted-dot);
}
</style>
