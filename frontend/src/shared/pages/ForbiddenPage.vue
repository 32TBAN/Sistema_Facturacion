<template>
  <section class="forbidden-page">
    <h1>403</h1>
    <p>No tienes permisos para acceder a esta seccion.</p>
    <router-link to="/inicio">Volver al inicio</router-link>
  </section>
</template>

<style scoped>
.forbidden-page {
  min-height: 60vh;
  display: grid;
  place-content: center;
  gap: 8px;
}
</style>
