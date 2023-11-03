<template>

    <nav class="navbar navbar-expand-lg bg-body-tertiary">
      <div class="container d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center">
          <a class="navbar-brand" href="#">
            <img src="../assets/logo.png" alt="Inicio" width="30" height="24">
          </a>
          <p class="mb-0 ms-3">Facturación</p>
        </div>

        <form class="d-flex me-2" >
          <input v-model="search" class="form-control" type="search" placeholder="Buscar productos" aria-label="Search">
        </form>

        <button class="btn btn-outline-success me-2" @click="searchClient">Buscar clientes</button>
        <button class="btn btn-outline-success">Carrito</button>
      </div>
    </nav>
    
</template>

<script>
export default {
  
};
</script>
