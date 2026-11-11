<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '@/components/icons/AppIcon.vue'
import CampanaNotificaciones from '@/modules/notificaciones/components/CampanaNotificaciones.vue'
import { useSesionStore } from '@/stores/sesionStore'

const emit = defineEmits(['toggle-menu'])

const sesion = useSesionStore()
const router = useRouter()
const menuUsuarioAbierto = ref(false)

function cerrarMenuUsuario() {
  menuUsuarioAbierto.value = false
}

async function cerrarSesion() {
  cerrarMenuUsuario()
  await sesion.cerrarSesion()
  await router.replace({ name: 'login' })
}
</script>

<template>
  <header class="topbar">
    <button type="button" class="topbar__menu" aria-label="Abrir menú" @click="emit('toggle-menu')">
      <AppIcon name="menu" />
    </button>

    <div class="topbar__right">
      <CampanaNotificaciones v-if="sesion.cuentaActiva" />
      <div v-if="sesion.usuario" class="topbar__user" @keydown.esc="cerrarMenuUsuario">
        <button
          type="button"
          class="topbar__user-btn"
          aria-haspopup="menu"
          :aria-expanded="menuUsuarioAbierto"
          aria-controls="menu-usuario"
          @click="menuUsuarioAbierto = !menuUsuarioAbierto"
        >
          <span class="topbar__avatar"><AppIcon name="user" :size="24" /></span>
          <span class="topbar__user-name">{{ sesion.nombreCompleto }}</span>
          <AppIcon name="chevron-down" :size="18" />
        </button>

        <div v-if="menuUsuarioAbierto" class="topbar__overlay" @click="cerrarMenuUsuario" />
        <div v-if="menuUsuarioAbierto" id="menu-usuario" class="topbar__menu-usuario" role="menu">
          <div class="topbar__menu-info">
            <p class="topbar__menu-usuario-nombre">{{ sesion.usuario.correo }}</p>
            <p class="topbar__menu-rol">{{ sesion.nombreDelRol }}</p>
          </div>
          <button type="button" class="topbar__menu-item" role="menuitem" @click="cerrarSesion">
            <AppIcon name="logout" :size="18" /> Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: var(--space-4);
  height: var(--topbar-height);
  padding: 0 var(--space-8) 0 44px;
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
}

.topbar__menu {
  display: none;
  padding: var(--space-2);
  color: var(--color-text);
  background: none;
  border: none;
  cursor: pointer;
}

.topbar__right {
  display: flex;
  align-items: center;
  gap: var(--space-8);
  margin-left: auto;
}

.topbar__user {
  position: relative;
}

.topbar__user-btn {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-1) var(--space-2);
  color: var(--color-text-strong);
  background: none;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
}

.topbar__user-btn:hover {
  background: var(--color-table-head);
}

.topbar__overlay {
  position: fixed;
  inset: 0;
  z-index: 1;
}

.topbar__menu-usuario {
  position: absolute;
  top: calc(100% + var(--space-2));
  right: 0;
  z-index: 2;
  min-width: 220px;
  padding: var(--space-2);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-modal);
}

.topbar__menu-info {
  padding: var(--space-2) var(--space-3) var(--space-3);
  border-bottom: 1px solid var(--color-border);
}

.topbar__menu-usuario-nombre {
  font-weight: 600;
  color: var(--color-text-strong);
}

.topbar__menu-rol {
  font-size: var(--text-sm);
  color: var(--color-label);
}

.topbar__menu-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  margin-top: var(--space-2);
  padding: var(--space-2) var(--space-3);
  color: var(--color-danger);
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.topbar__menu-item:hover {
  background: var(--color-primary-soft);
}

.topbar__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  color: #fff;
  background: #3d4658;
  border-radius: 50%;
}

.topbar__user-name {
  font-size: var(--text-lg);
}

@media (max-width: 960px) {
  .topbar {
    padding: 0 var(--space-4);
  }

  .topbar__menu {
    display: inline-flex;
  }
}

@media (max-width: 640px) {
  .topbar__user-name {
    display: none;
  }
}
</style>
