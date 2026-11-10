<script setup>
import { useId } from 'vue'

const model = defineModel({ type: [String, Number], default: '' })

defineProps({
  label: { type: String, default: '' },
  hideLabel: { type: Boolean, default: false },
  options: { type: Array, required: true },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  error: { type: String, default: '' },
})

const id = useId()
</script>

<template>
  <div class="select">
    <label v-if="label" :for="id" class="field-label" :class="{ 'sr-only': hideLabel }">
      {{ label }}
    </label>
    <select
      :id="id"
      v-model="model"
      class="input select__control"
      :disabled="disabled"
      :aria-invalid="error ? 'true' : undefined"
    >
      <option v-if="placeholder" value="">{{ placeholder }}</option>
      <option v-for="opt in options" :key="opt.value" :value="opt.value" :disabled="opt.disabled">
        {{ opt.label }}
      </option>
    </select>
    <p v-if="error" class="field-error">{{ error }}</p>
  </div>
</template>

<style scoped>
.select__control {
  appearance: none;
  padding-right: 40px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%231f2430' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  cursor: pointer;
}
</style>
