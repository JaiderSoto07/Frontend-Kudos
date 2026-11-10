<script setup>
import { ref } from 'vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'

const menuAbierto = ref(false)
</script>

<template>
  <div class="layout">
    <AppSidebar :open="menuAbierto" @close="menuAbierto = false" />
    <div class="layout__main">
      <AppTopbar @toggle-menu="menuAbierto = !menuAbierto" />
      <main class="layout__content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout__main {
  min-height: 100vh;
  margin-left: var(--sidebar-width);
}

.layout__content {
  padding: var(--space-4) var(--space-8) var(--space-8) 44px;
}

@media (max-width: 960px) {
  .layout__main {
    margin-left: 0;
  }

  .layout__content {
    padding: var(--space-4);
  }
}
</style>
