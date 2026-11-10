<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppIcon from '@/components/icons/AppIcon.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useSesionStore } from '@/stores/sesionStore'

const sesion = useSesionStore()
const route = useRoute()

const MENSAJE_ERROR_GOOGLE = 'No fue posible iniciar sesión con Google. Intenta de nuevo.'

const mensajeError = computed(() => ('error' in route.query ? MENSAJE_ERROR_GOOGLE : sesion.error))
</script>

<template>
  <div class="login">
    <section class="login__marca" aria-hidden="true">
      <p class="login__logo">UCO KUDOS</p>
      <p class="login__lema">Reconoce lo mejor de nuestra comunidad universitaria.</p>
    </section>

    <main class="login__contenido">
      <section class="login__card">
        <header class="login__header">
          <span class="login__badge"><AppIcon name="lock" :size="22" /></span>
          <div>
            <h1 class="login__title">Iniciar sesión</h1>
            <p class="login__subtitle">
              Ingresa con la cuenta de Google de tu correo institucional.
            </p>
          </div>
        </header>

        <p v-if="mensajeError" class="login__error" role="alert">
          <AppIcon name="alert" :size="18" /> {{ mensajeError }}
        </p>

        <BaseButton class="login__submit" @click="sesion.iniciarSesionConGoogle()">
          Iniciar sesión con Google
        </BaseButton>
      </section>
    </main>
  </div>
</template>

<style scoped>
.login {
  display: grid;
  grid-template-columns: minmax(280px, 2fr) 3fr;
  min-height: 100vh;
  background: var(--color-bg);
}

.login__marca {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-8);
  color: #fff;
  text-align: center;
  background: linear-gradient(180deg, var(--color-sidebar-from), var(--color-sidebar-to));
}

.login__logo {
  font-size: var(--text-2xl);
  font-weight: 700;
  letter-spacing: 0.02em;
}

.login__lema {
  font-size: var(--text-md);
  color: rgba(255, 255, 255, 0.8);
}

.login__contenido {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8) var(--space-4);
}

.login__card {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  width: 100%;
  max-width: 420px;
  padding: var(--space-8);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}

.login__header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.login__badge {
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

.login__title {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-title-accent);
}

.login__subtitle {
  font-size: var(--text-base);
  color: var(--color-label);
}

.login__error {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3);
  font-size: var(--text-sm);
  color: var(--color-danger);
  background: var(--color-primary-soft);
  border-radius: var(--radius-sm);
}

.login__submit {
  width: 100%;
}

@media (max-width: 768px) {
  .login {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto 1fr;
  }

  .login__marca {
    padding: var(--space-6) var(--space-4);
  }

  .login__logo {
    font-size: var(--text-xl);
  }

  .login__card {
    padding: var(--space-6);
  }
}
</style>
