<script setup>
import BaseCard from '@/components/ui/BaseCard.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { useSesionStore } from '@/stores/sesionStore'

const sesion = useSesionStore()
</script>

<template>
  <section class="inicio">
    <PageHeader :title="`Hola, ${sesion.usuario?.nombres}`" :subtitle="sesion.nombreDelRol" />
    <BaseCard class="inicio__card">
      <p>
        Bienvenido a UCO Kudos, la plataforma para reconocer los logros y el buen ejemplo de la
        comunidad universitaria.
      </p>
      <p class="inicio__ayuda">Usa el menú de la izquierda para ir a las opciones de tu rol.</p>
    </BaseCard>
  </section>
</template>

<style scoped>
.inicio {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.inicio__card {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  line-height: 1.5;
}

.inicio__ayuda {
  color: var(--color-text-muted);
}
</style>
