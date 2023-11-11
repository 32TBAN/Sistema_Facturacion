<template>
  <div class="container mt-5 bg-white p-3">
    <h1 class="pb-3">Facturación</h1>

    <div class="productod">
      <BusquedaProducto
        v-show="verProductos"
        @close="verProductosClick"
      ></BusquedaProducto>
    </div>

    <div class="clientes">
      <BusquedaClientes
        v-show="verClientes"
        @close="verClientesClick"
      ></BusquedaClientes>
    </div>

    <transition name="fade">
      <pop-up
        :total="total"
        v-show="popup"
        @close="toglePopUP()"
        @comprar="limpiar()"
      />
    </transition>

    <div class="">
      <div class="col-1 m-5">Orden #{{ numOrden }}</div>
    </div>
    <div class="datoscliente row table-header pb-3">
      <div class="col-3">Id: {{customer._id}}</div>
      <div class="col-3">Nombre: {{customer.name}}</div>
      <div class="col-3">Email:{{customer.email}}</div>
      <button class="col-3 btn btn-success" @click="verClientesClick">
        Buscar cliente
      </button>
    </div>
    <button
      class="btn btn-success"
      @click="verProductosClick"
      style="margin: 10px"
    >
      Agregar Producto +
    </button>
    <div class="row table-header pb-3">
      <div class="col-3">Nombre</div>
      <div class="col-3">Cantidad</div>
      <div class="col-3">Precio</div>
    </div>

    <div
      class="row m-2 pt-2 rounded-corner"
      v-for="product in products"
      :key="product._id"
      style="background-color: #d9d9d9"
    >
      <div class="col-3">{{ product.name }}</div>
      <div class="col-3">
        <span v-if="!product.editMode">{{ product.quantity }}</span>
        <input
          v-else
          type="number"
          v-model="product.editQuantity"
          min="0"
          step="1"
          required
        />
      </div>
      <div class="col-3">{{ product.unitPrice }}</div>
      <div class="col-3 mb-2">
        <button
          class="btn btn-outline-danger me-2"
          @click="deleteProduct(product)"
        >
          Eliminar
        </button>
        <button class="btn btn-outline-dark" @click="editProduct(product)">
          Editar
        </button>
        <button
          class="btn btn-success"
          @click="saveProduct(product)"
          v-if="product.editMode"
        >
          Guardar
        </button>
        <button
          class="btn btn-danger"
          @click="cancelEdit(product)"
          v-if="product.editMode"
        >
          Cancelar
        </button>
      </div>
    </div>
    <div class="container d-flex align-items-center justify-content-end p-2">
      <div class="m-5 p-2">
        <p class="text-primary">Total</p>
        <p>{{ "$ " + total.toFixed(2) }}</p>
      </div>
      <button class="btn btn-primary" @click="toglePopUP()">Finalizar</button>
    </div>
  </div>
</template>

<script>
import PopUp from "./PopUp.vue";
import BusquedaProducto from "./ProductsSearch.vue";
import BusquedaClientes from "./ClienetsList.vue";

export default {
  components: {
    PopUp,
    BusquedaProducto,
    BusquedaClientes,
  },
  data() {
    return {
      products: [],
      baseUrl: "http://localhost:3000",
      total: 0,
      order: [],
      popup: false,
      verProductos: false,
      verClientes: false,
      numOrden: 0,
      customer: 0
    };
  },
  created() {
    this.getNumOrder();
  },
  methods: {
    async getNumOrder() {
      let lastOrder = (await this.axios.get(`${this.baseUrl}/lastOrder`)).data;
      if (lastOrder[0].cerrada) {
        this.numOrden = lastOrder[0].orderID + 1;
      } else {
        this.numOrden = lastOrder[0].orderID;
      }
      this.order = (
        await this.axios.get(`${this.baseUrl}/order/${this.numOrden}`)
      ).data;
      this.getProducts();
    },
    async limpiar() {
      let eliminados = [];
      let numberDeletes = this.products.length;

      for (let index = 0; index < numberDeletes; index++) {
        eliminados.push(
          (
            await this.axios.delete(
              `${this.baseUrl}/orderDetailsDelete/${this.products[index].productID}`
            )
          ).data
        );

        if (eliminados.length == numberDeletes) {
          this.products = [];
          this.popup = false;
          this.total = 0;
        }
      }
    },
    toglePopUP() {
      this.popup = !this.popup;
    },
    async verProductosClick() {
      this.verProductos = !this.verProductos;
      this.products = [];
      await this.getProducts();
    },
    async verClientesClick() {
      this.verClientes = !this.verClientes;
      this.products = [];
      await this.getProducts();
    },
    async getProducts() {
      if (this.order != null) {
        const details = (
          await this.axios.get(
            `${this.baseUrl}/orderDetails/${this.order.orderID}`
          )
        ).data;

        for (let index = 0; index < details.length; index++) {
          const producto = (
            await this.axios.get(
              `${this.baseUrl}/product/${details[index].productID}`
            )
          ).data;
          this.products.push({
            productID: producto[0].productID,
            name: producto[0].name,
            quantity: details[index].quantity,
            unitPrice: "$ " + producto[0].unitPrice,
          });

          this.total += producto[0].unitPrice * details[index].quantity;
        }

        this.customer = (await this.axios.get(
            `${this.baseUrl}/customer/${this.order.customerID}`
          )
        ).data;
      } else {
        let order = {
          orderID: this.numOrden,
          customerID: "01",
          cerrada: false,
        };
        const openOrder = await this.axios.post(
          `${this.baseUrl}/openOrder`,
          order
        );
        if (openOrder.status === 200) {
          console.log("Orden abierta");
        } else {
          console.error("No se ha podido abrir la orden");
        }
      }
    },
    editProduct(product) {
      // Activa el modo de edición para el producto
      product.editMode = true;
      // Guarda la cantidad actual para poder restaurarla en caso de cancelación
      product.editQuantity = product.quantity;
    },
    async saveProduct(product) {
      if (
        isNaN(product.editQuantity) ||
        product.editQuantity <= 0 ||
        product.editQuantity % 1 != 0
      ) {
        alert("Ingresa una cantidad válida para agregar al carrito.");
        return;
      }

      let editQuantity = (
        await this.axios.get(`${this.baseUrl}/product/${product.productID}`)
      ).data;
      if (product.quantity < product.editQuantity)
        editQuantity[0].unitStock -= Math.abs(
          product.quantity - product.editQuantity
        );
      else
        editQuantity[0].unitStock += Math.abs(
          product.quantity - product.editQuantity
        );
      await this.axios.put(
        `${this.baseUrl}/productUpdate/${product.productID}`,
        editQuantity[0]
      );

      const detailsUpdate = {
        orderID: this.order.orderID,
        productID: product.productID,
        unitPrice: product.unitPrice.replace("$", ""),
        quantity: product.editQuantity,
      };
      await this.axios.put(
        `${this.baseUrl}/detailsUpdate/${product.productID}/${this.order.orderID}`,
        detailsUpdate
      );

      // Guarda la nueva cantidad y desactiva el modo de edición
      product.quantity = product.editQuantity;
      product.editMode = false;
    },
    cancelEdit(product) {
      // Cancela la edición y restaura la cantidad original
      product.editQuantity = product.quantity;
      product.editMode = false;
    },
    async deleteProduct(product) {
      let editQuantity = (
        await this.axios.get(`${this.baseUrl}/product/${product.productID}`)
      ).data;
      editQuantity[0].unitStock += product.quantity;
      await this.axios.put(
        `${this.baseUrl}/productUpdate/${product.productID}`,
        editQuantity[0]
      );

      await this.axios.delete(
        `${this.baseUrl}/orderDetailsDelete/${product.productID}`
      );

      this.products = [];
      await this.getProducts();
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
