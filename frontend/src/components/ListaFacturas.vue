<template>
  <div class="factura">
    <transition name="fade">
      <ViewFactura
        v-show="verFactura"
        @close="ocultar()"
        :numOrder="this.numOrder"
        ref="myComponent"
      ></ViewFactura>
    </transition>
    <h4 class="pb-1">Facturas</h4>
    <div class="container bg-white p-3" style="max-height: 400px">
      <div class="row table-header pb-3">
        <div class="col-4">Order ID</div>
        <div class="col-4">Customer ID</div>
        <div class="col-4">Fecha</div>
      </div>

      <div
        class="row m-2 pt-2 rounded-corner"
        v-for="factura in displayFacturas"
        :key="factura._id"
        style="background-color: #d9d9d9; cursor: pointer"
        @click="obtenerFactura(factura.orderID)"
      >
        <div class="col-4">{{ factura.orderID }}</div>
        <div class="col-4">{{ factura.customerID }}</div>
        <div class="col-4">{{ formatDate(factura.updatedAt) }}</div>
      </div>

      <div class="btn-group col-md-2 off-set-md-5">
        <button
          type="button"
          v-if="page != 1"
          @click="page--"
          class="btn btn-sm btn-outline-secondary"
        >
          Before
        </button>
        <button
          type="button"
          v-for="pageNumber in pages.slice(page - 1, page + 2)"
          v-bind:key="pageNumber"
          class="btn btn-sm btn-outline-secondary"
          @click="page = pageNumber"
        >
          {{ pageNumber }}
        </button>
        <button
          type="button"
          @click="page++"
          v-if="page < pages.length"
          class="btn btn-sm btn-outline-secondary"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import ViewFactura from "./ViewFactura.vue";
export default {
  components: {
    ViewFactura,
  },
  data() {
    return {
      facturas: [],
      baseUrl: "http://localhost:3000",
      page: 1,
      perPage: 10,
      pages: [],
      verFactura: false,
      numOrder: 0,
    };
  },
  created() {
    this.getFacturas();
  },
  methods: {
    obtenerFactura(orderID) {
      this.numOrder = orderID;
      this.verFactura = !this.verFactura;
      this.$refs.myComponent.getDetailsOrder();
    },
    async getFacturas() {
      this.facturas = [];
      const res = (await this.axios.get(`${this.baseUrl}/orders`)).data;

      for (let index = 0; index < res.length; index++) {
        if (res[index].cerrada) {
          this.facturas.push(res[index]);
        }
      }
      this.facturas.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );
    },
    paginate(facturaE) {
      let page = this.page;
      let perPage = this.perPage;
      let from = page * perPage - perPage;
      let to = page * perPage;
      return facturaE.slice(from, to);
    },
    setFacturas() {
      let numberOfPages = Math.ceil(this.facturas.length / this.perPage);
      for (let index = 1; index < +numberOfPages; index++) {
        this.pages.push(index);
      }
    },
    ocultar() {
      this.verFactura = !this.verFactura
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear().toString().slice(2);
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");

      return `${day}/${month}/${year} -- ${hours}:${minutes}`;
    },
  },
  computed: {
    displayFacturas() {
      return this.paginate(this.facturas);
    },
  },
  watch: {
    facturas: "setFacturas",
  },
  mounted() {
    // this.getFacturas();
  },
};
</script>

<style></style>
