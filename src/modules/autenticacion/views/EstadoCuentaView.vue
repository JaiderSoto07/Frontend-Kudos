<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '@/components/icons/AppIcon.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useSesionStore } from '@/stores/sesionStore'
import { nombreEstadoCuenta } from '@/shared/domain/cuenta'

const sesion = useSesionStore()
const router = useRouter()
const saliendo = ref(false)

const titulo = computed(() =>
  sesion.registrado ? 'Tu cuenta aún no está activa' : 'Aún no tienes una cuenta',
)
const estado = computed(() => nombreEstadoCuenta(sesion.usuario?.estadoCuenta))

async function cerrarSesion() {
  saliendo.value = true
  await sesion.cerrarSesion()
  saliendo.value = false
  router.replace({ name: 'login' })
}
</script>

<template>
  <div class="estado">
    <section class="estado__card">
      <header class="estado__header">
        <span class="estado__badge"><AppIcon name="alert" :size="22" /></span>
        <div>
          <h1 class="estado__title">{{ titulo }}</h1>
          <p class="estado__correo">{{ sesion.usuario?.correo }}</p>
        </div>
      </header>

      <p v-if="estado" class="estado__dato">
        Estado de la cuenta: <strong>{{ estado }}</strong>
      </p>
      <p class="estado__mensaje" role="status">{{ sesion.usuario?.mensajeEstado }}</p>

      <BaseButton variant="outline" class="estado__salir" :loading="saliendo" @click="cerrarSesion">
        <AppIcon name="logout" :size="18" /> Ingresar con otra cuenta
      </BaseButton>
    </section>
  </div>
</template>

<style scoped>
.estado {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: var(--space-8) var(--space-4);
  background: var(--color-bg);
}

.estado__card {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  width: 100%;
  max-width: 480px;
  padding: var(--space-8);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}

.estado__header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.estado__badge {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  color: #fff;
  background: var(--color-primary);
  border-radius: var(--radius);
}

.estado__title {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-title-accent);
}

.estado__correo {
  font-size: var(--text-sm);
  color: var(--color-label);
}

.estado__dato {
  font-size: var(--text-base);
}

.estado__mensaje {
  padding: var(--space-3);
  line-height: 1.5;
  background: var(--color-primary-soft);
  border-radius: var(--radius-sm);
}

.estado__salir {
  width: 100%;
}
</style>
