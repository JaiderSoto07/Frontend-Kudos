<script setup>
import AppIcon from '@/components/icons/AppIcon.vue'

defineProps({
  icon: { type: String, default: 'list' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
})
</script>

<template>
  <div class="empty">
    <AppIcon :name="icon" :size="32" class="empty__icon" />
    <p class="empty__title">{{ title }}</p>
    <p v-if="description" class="empty__description">{{ description }}</p>
    <slot />
  </div>
</template>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-8) var(--space-4);
  text-align: center;
}

.empty__icon {
  color: var(--color-border-strong);
}

.empty__title {
  font-weight: 600;
  color: var(--color-text);
}

.empty__description {
  max-width: 320px;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}
</style>
