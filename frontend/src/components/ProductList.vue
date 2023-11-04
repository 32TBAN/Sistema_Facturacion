<template>
  <div class="container mt-5 bg-white p-3">

    <h1 class="pb-3">Tu carrito</h1>
    <div class="row table-header pb-3">
      <div class="col-3">Nombre</div>
      <div class="col-3">Cantidad</div>
      <div class="col-3">Precio</div>
    </div>

    <div class="row m-2 pt-2 rounded-corner" v-for="product in products" :key="product._id" style="background-color: #D9D9D9;">
      <div class="col-3">{{ product.name }}</div>
      <div class="col-3">{{ product.quantity }}</div>
      <div class="col-3">{{ product.unitPrice }}</div>
      <div class="col-3 mb-2">
        <button class="btn btn-outline-danger me-2">Eliminar</button>
        <button class="btn btn-outline-dark">Editar</button>
      </div>
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
  data() {
    return {
      products: [],
      baseUrl: "http://localhost:3000",
      perPage: 10,
      pages: [],
    };
  },
  created() {
    this.getProducts();
  },
  methods: {
    async getProducts() {
      const res = await this.axios.get(`${this.baseUrl}/product`);
      console.log(res);
      this.products = res.data;
    },
  },
};
</script>

<style scoped>
/* Define las clases CSS para el campo de búsqueda */
.rounded-corner {
  border-radius: 15px; /* Ajusta el valor según tus preferencias */
}
</style>
