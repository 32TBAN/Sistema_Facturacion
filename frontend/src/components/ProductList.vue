<template>
  <div class="container mt-5 bg-white p-3">
    <h1 class="pb-3">Tu carrito</h1>
    <div
      class="container d-flex align-items-center justify-content-between p-2"
      style="background-color: "
    >
      <p class="my-auto">Nombre</p>
      <p class="my-auto">Cantidad</p>
      <p class="my-auto">Precio</p>
      <button class="btn btn-outline-danger me-2">Eliminar</button>
      <button class="btn btn-outline-dark">Editar</button>
    </div>
    <div class="container d-flex align-items-center justify-content-end p-2">
      <div class="m-5 p-2">
        <p class="text-primary">Total</p>
        <p>$ 0.00</p>
      </div>
      <button class="btn btn-primary">Comprar</button>
    </div>
  </div>
</template>

<script>
export default {

};
</script>

<style scoped></style>
