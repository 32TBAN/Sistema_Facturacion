<template>
  <nav class="navbar navbar-expand-lg bg-body-tertiary">
    <div class="container d-flex align-items-center justify-content-between">
      <div class="d-flex align-items-center">
        <router-link to="/productList" class="navbar-brand" href="#">
          <img src="./assets/logo.png" alt="Inicio" width="30" height="24" />
        </router-link>
        <p class="mb-0 ms-3">Facturación</p>
      </div>

      <form class="d-flex me-2">
        <router-link class="form-control"
          to="/productsSearch" 
          type="search"
          placeholder="Buscar productos"
          aria-label="Search">
        </router-link>
      </form>

      <button class="btn btn-outline-success me-2" @click="searchClient">
        Buscar clientes
      </button>
      <button class="btn btn-outline-success">Carrito</button>
    </div>
  </nav>
  <router-view/> 
</template>


<script setup>

</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  background-color: #f1f5f9;
}
</style>
