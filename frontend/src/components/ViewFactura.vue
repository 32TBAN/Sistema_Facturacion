<template>
  <div class="pop-up">
    <div class="pop-up-inner">
      <div class="pop-up-close" @click="close()">&times;</div>
      <h1>Factura #{{ order.orderID }}</h1>
      <div class="row mb-3">
        <div class="col-6"><strong>Cliente:</strong> {{ customer.name }}</div>
        <div class="col-6 text-end">
          <strong>Fecha:</strong> {{ formatDate(order.createdAt) }}
        </div>
      </div>
      <table class="table">
        <thead>
          <tr>
            <th scope="col">Producto</th>
            <th scope="col">Cantidad</th>
            <th scope="col">Precio Unitario</th>
            <th scope="col">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="detail in details" :key="detail.productID">
            <td>{{ detail.productname }}</td>
            <td>{{ detail.quantity }}</td>
            <td>{{ "$" + detail.unitPrice.toFixed(2) }}</td>
            <td>{{ "$" + (detail.quantity * detail.unitPrice).toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>
      <div class="text-end">
        <h4>Total: {{ "$" + calculateTotal().toFixed(2) }}</h4>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    numOrder: Number,
  },
  data() {
    return {
      details: [],
      order: [],
      baseUrl: "http://localhost:3000",
      customer: {},
    };
  },
  methods: {
    formatDate(dateString) {
      const date = new Date(dateString);
      return `${date.getDate()}/${
        date.getMonth() + 1
      }/${date.getFullYear()} -- ${date.getHours()}:${date.getMinutes()}`;
    },
    calculateTotal() {
      return this.details.reduce(
        (total, detail) => total + detail.quantity * detail.unitPrice,
        0
      );
    },
    close() {
      this.$emit("close");
    },
    async getDetailsOrder() {
      if (this.numOrder !== 0) {
        this.order = (
          await this.axios.get(`${this.baseUrl}/order/${this.numOrder}`)
        ).data;
        this.details = (
          await this.axios.get(
            `${this.baseUrl}/orderDetails/${this.order.orderID}`
          )
        ).data;

        this.customer = (
          await this.axios.get(
            `${this.baseUrl}/customer/${this.order.customerID}`
          )
        ).data;

        for (let index = 0; index < this.details.length; index++) {
          let productname = (
            await this.axios.get(
              `${this.baseUrl}/product/${this.details[index].productID}`
            )
          ).data;
          this.details[index].productname = productname[0].name;
        }
      }
    },
  },
  created() {
    this.getDetailsOrder();
  },
};
</script>

<style lang="scss">
.pop-up {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  padding: 32px 16px 120px;
  height: 100vh;
  widows: 100%;
  background-color: #52a07ed5;
  display: grid;
  place-items: center;

  &-close {
    position: absolute;
    height: 52px;
    widows: 52px;
    display: flex;
    justify-content: center;
    align-content: center;
    top: 0;
    right: 0;
    font-size: 3rem;
    color: #d6d6d6;
    cursor: pointer;
  }

  &-inner {
    background-color: #fff;
    color: #000;
    position: relative;
    widows: 60%;
    padding: 40px;
    border-radius: 8px;
    box-shadow: 0 5px 5px #000;
    transition: all 250ms ease-in-out;
  }
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
  .pop-up-inner {
    opacity: 0;
    transform: translateY(-32px);
  }
}
.fade-enter-active,
.fade-leave-active {
  transition: all 250ms ease-in-out;
}

.fade-leave-active {
  transition-delay: 250ms;
}
</style>
