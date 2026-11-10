<script setup>
import AppIcon from '@/components/icons/AppIcon.vue'

const model = defineModel({ type: String, default: '' })

defineProps({
  placeholder: { type: String, default: 'Buscar…' },
  label: { type: String, required: true },
})
</script>

<template>
  <label class="search">
    <span class="sr-only">{{ label }}</span>
    <AppIcon name="search" class="search__icon" />
    <input v-model="model" type="search" class="input search__input" :placeholder="placeholder" />
  </label>
</template>

<style scoped>
.search {
  position: relative;
  display: block;
}

.search__icon {
  position: absolute;
  top: 50%;
  left: var(--space-3);
  transform: translateY(-50%);
  color: var(--color-label);
  pointer-events: none;
}

.search__input {
  padding-left: 42px;
}
</style>
