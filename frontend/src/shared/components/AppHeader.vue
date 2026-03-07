<template>
  <nav class="navbar navbar-expand-lg bg-body-tertiary">
    <div class="container d-flex align-items-center justify-content-between">
      <div class="d-flex align-items-center">
        <router-link to="/inicio" class="navbar-brand" href="#">
          <img src="../../assets/carrito.png" alt="Inicio" width="30" height="24" />
        </router-link>
        <p class="mb-0 ms-3">Facturacion</p>
      </div>

      <router-link to="/facturas" class="navbar-brand" href="#">
        <button class="btn btn-outline-info me-2">Facturas</button>
      </router-link>

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

      <router-link to="/inicio" class="navbar-brand" href="#">
        <button class="btn btn-outline-success">Facturar</button>
      </router-link>

      <router-link to="/" class="navbar-brand" href="#">
        <button class="btn btn-outline-danger">Cerrar sesion</button>
      </router-link>
    </div>
  </nav>
</template>

<script>
export default {};
</script>
