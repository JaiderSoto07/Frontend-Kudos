<script setup>
import AppIcon from '@/components/icons/AppIcon.vue'

defineProps({
  label: { type: String, required: true },
  icon: { type: String, required: true },
  to: { type: String, default: '' },
})
</script>

<template>
  <li>
    <RouterLink v-if="to" :to="to" class="item" active-class="is-active">
      <AppIcon :name="icon" :size="24" />
      <span>{{ label }}</span>
    </RouterLink>
    <span v-else class="item is-disabled" aria-disabled="true" title="Módulo en desarrollo">
      <AppIcon :name="icon" :size="24" />
      <span>{{ label }}</span>
    </span>
  </li>
</template>

<style scoped>
.item {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  height: 56px;
  padding: 0 var(--space-5);
  color: #fff;
  font-size: var(--text-md);
  text-decoration: none;
  border-radius: var(--radius);
  transition: background-color 0.15s;
}

a.item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.item.is-active {
  font-weight: 600;
  background: var(--color-sidebar-active);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.item.is-disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
