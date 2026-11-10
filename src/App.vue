<template>
  <main class="portada">
    <h1 class="portada__titulo">UCO Kudos</h1>
    <p class="portada__texto">
      Plataforma de reconocimientos de la Universidad Católica de Oriente
    </p>
  </main>
</template>

<style scoped>
.portada {
  display: grid;
  place-content: center;
  gap: var(--space-2);
  min-height: 100vh;
  text-align: center;
}

.portada__titulo {
  font-size: var(--text-2xl);
  color: var(--color-primary);
}

.portada__texto {
  color: var(--color-text-muted);
}
</style>
