<template>
  <div class="container mt-5 bg-white p-3">
    <h1 class="pb-3">Facturación</h1>

    <transition name="fade">
      <BusquedaProducto
        v-show="verProductos"
        @close="verProductosClick"
        :numOrder="this.numOrden"
        ref="myComponent"
      ></BusquedaProducto>
    </transition>

    <transition name="fade">
      <BusquedaClientes
        v-show="verClientes"
        @close="verClientesClick"
        :numOrder="this.numOrden"
      ></BusquedaClientes>
    </transition>

    <transition name="fade">
      <pop-up
        :total="total"
        v-show="popup"
        @close="toglePopUP()"
        @comprar="finalizar()"
      />
    </transition>

    <div class="">
      <div class="col-1 ms-5">Orden #{{ numOrden }}</div>
    </div>

    <div class="row table-header pb-3">
      <div class="col-3">Id: {{ customer._id }}</div>
      <div class="col-3">Nombre: {{ customer.name }}</div>
      <div class="col-3">Email:{{ customer.email }}</div>
      <button class="col-3 btn btn-success" @click="verClientesClick">
        Buscar cliente
      </button>
    </div>

    <div class="row table-header">
      <div class="col-3">Nombre</div>
      <div class="col-3 text-end">Cantidad</div>
      <div class="col-3 text-end">Precio</div>
      <div class="col-3 text-end">
        <button class="btn btn-success" @click="verProductosClick">
          Agregar Producto +
        </button>
      </div>
    </div>

    <div
      class="row m-2 pt-2 rounded-corner"
      v-for="product in products"
      :key="product._id"
      style="background-color: #d9d9d9"
    >
      <div class="col-3 text-start">{{ product.name }}</div>
      <div class="col-3 text-end">
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
      <div class="col-3 text-end">{{ product.unitPrice }}</div>
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

    <div class="col-9 container d-flex align-items-center justify-content-end">
      <p class="text-primary">Total: {{ total.toFixed(2) + " $" }}</p>
      <button class="btn btn-primary ms-5" @click="toglePopUP()">
        Finalizar
      </button>
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
      order: { orderID: 0 },
      popup: false,
      verProductos: false,
      verClientes: false,
      numOrden: 0,
      customer: { _id: "No elegido", name: "No elegido", email: "No elegido" },
    };
  },
  created() {
    this.getNumOrder();
  },
  methods: {
    async getNumOrder() {
      let lastOrder = (await this.axios.get(`${this.baseUrl}/lastOrder`)).data;
      if (lastOrder == null || lastOrder[0].cerrada) {
        this.numOrden = lastOrder[0].orderID + 1;
      } else {
        this.numOrden = lastOrder[0].orderID;
      }
      this.order = (
        await this.axios.get(`${this.baseUrl}/order/${this.numOrden}`)
      ).data;

      if (this.order == null) {
        this.order = { orderID: 0 };
      }
      this.getProducts();
    },
    async finalizar() {
      if (this.order.customerID || this.products.length != 0) {
        this.order.cerrada = true;
        await this.axios.put(
          `${this.baseUrl}/orderUpdate/${this.order.orderID}`,
          this.order
        );
        this.popup = !this.popup;
        this.getNumOrder();
      } else {
        alert("No ha selecionado ningun cliente o ningun producto");
      }
    },
    toglePopUP() {
      this.popup = !this.popup;
    },
    async verProductosClick() {
      this.verProductos = !this.verProductos;
      this.products = [];
      await this.getNumOrder();

      this.$refs.myComponent.getProducts();
    },
    async verClientesClick() {
      this.products = [];
      await this.getNumOrder();
      this.verClientes = !this.verClientes;
    },
    async getProducts() {
      this.total = 0;
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
            unitPrice: producto[0].unitPrice + " $",
          });

          this.total += producto[0].unitPrice * details[index].quantity;
        }

        if (this.order.customerID) {
          this.customer = (
            await this.axios.get(
              `${this.baseUrl}/customer/${this.order.customerID}`
            )
          ).data;
        }
      } else {
        //si no hay una orden con el numero de orden crea una nueva
        let order = {
          orderID: this.numOrden,
          cerrada: false, //lo creo sin customerID por que luego lo agrego.
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

      let productoB = (
        await this.axios(`${this.baseUrl}/product/${product.productID}`)
      ).data;

      if (productoB[0].unitStock == 0) {
        if (product.quantity < product.editQuantity) {
          alert("Bajo stock");
          return;
        }
      } else if (
        productoB[0].unitStock + product.quantity <
        product.editQuantity
      ) {
        alert("Bajo stock");
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
      this.products = [];
      await this.getNumOrder();
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
