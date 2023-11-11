<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg bg-body-tertiary">
      <div class="container d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center">
          <router-link to="/inicio" class="navbar-brand" href="#">
            <img src="./assets/carrito.png" alt="Inicio" width="30" height="24" />
          </router-link>
          <p class="mb-0 ms-3">Facturación</p>
        </div>

        <form class="d-flex me-2">
          <router-link to="/productsSearch">
            <input
              class="form-control"
              type="search"
              placeholder="Buscar productos"
              aria-label="Search"
            />
          </router-link>
        </form>

        <router-link to="/clientsSearch" class="navbar-brand" href="#">
          <button class="btn btn-outline-success me-2">Buscar clientes</button>
        </router-link>

        <router-link to="/inicio" class="navbar-brand" href="#">
          <button class="btn btn-outline-success">Facturar</button>
        </router-link>

        <router-link to="/" class="navbar-brand" href="#">
          <button class="btn btn-outline-danger">Cerrar Sesión</button>
        </router-link>
      </div>
    </nav>

    <router-view />
  </div>
</template>

<script>
export default {

};
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
