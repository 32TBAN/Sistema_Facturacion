<template>
  <div class="pop-up">
    <div class="pop-up-close" @click="close()">&times;</div>
    <h4 class="pb-1">Buscar cliente</h4>

    <div class="container d-flex flex-column align-items-center">
      <form class="d-flex me-2 mb-3">
        <input
          class="form-control"
          type="search"
          placeholder="Ingrese un valor"
          aria-label="Search"
          v-model="nameSearch"
          @input="searchByTags"
        />
      </form>

      <div class="d-flex flex-column align-items-center" ref="tagsContainer">
        <p
          class="bg-body-tertiary rounded-corner black-border p-1"
          @click="toggleArrowIcon"
        >
          Tags
          <font-awesome-icon
            :icon="isArrowUp ? 'chevron-up' : 'chevron-down'"
          />
        </p>

        <div v-if="showTags" class="tags-container">
          <!-- Contenido de etiquetas -->
          <div v-for="tag in allTags" v-bind:key="tag">
            <input
              type="checkbox"
              :id="tag"
              :value="tag"
              v-model="searchTags"
              @change="searchByTags"
            />
            <label class="p-2" :for="tag">{{ tag }}</label>
          </div>
        </div>
      </div>
    </div>
    <div class="container mt-1 bg-white p-3">
      <div class="row table-header pb-3">
        <div class="col-3">id</div>
        <div class="col-3">Nombre</div>
        <div class="col-3">Email</div>
        <div class="col-3">Ciudad</div>
      </div>

      <div
        class="row m-2 p-3 rounded-corner"
        v-for="customer in displayCustomers"
        :key="customer._id"
        style="background-color: #d9d9d9; cursor: pointer;"
        @click="addClient(customer)"
      >
        <div class="col-3">{{ customer._id }}</div>
        <div class="col-3">{{ customer.name }}</div>
        <div class="col-3">{{ customer.email }}</div>
        <div class="col-3">{{ customer.country }}</div>
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
export default {
  data() {
    return {
      customers: [],
      allTags: ["id", "nombre", "email", "pais"],
      isArrowUp: false,
      showTags: false,
      baseUrl: "http://localhost:3000",
      page: 1,
      perPage: 5,
      pages: [],
      nameSearch: "",
      searchTags: [],
      originalCustomers: [],
      customer: 0
    };
  },
  created() {
    this.getCustomers();
    window.addEventListener("click", this.handleClickOutside);
  },props:{
        numOrder: Number
    },
  methods: {
    close() {
      this.$emit("close");
    },
    searchByTags() {
      // Filtrar productos por etiquetas seleccionadas
      let filteredCustomers = [...this.originalCustomers];

      if (this.searchTags.length > 0) {
        // Filtra por etiquetas seleccionadas
        filteredCustomers = this.customers.filter((customer) => {
          return this.searchTags.includes("id")
            ? customer._id.includes(this.nameSearch)
            : false || this.searchTags.includes("nombre")
            ? customer.name
                .toLowerCase()
                .includes(this.nameSearch.toLowerCase())
            : false || this.searchTags.includes("email")
            ? customer.email
                .toLowerCase()
                .includes(this.nameSearch.toLowerCase())
            : false || this.searchTags.includes("pais")
            ? customer.country
                .toLowerCase()
                .includes(this.nameSearch.toLowerCase())
            : false;
        });
      }

      // Si no se han seleccionado etiquetas, realiza la búsqueda por nombre de forma predeterminada
      if (this.nameSearch && this.searchTags.length === 0) {
        filteredCustomers = this.originalCustomers.filter((customer) => {
          return customer.name
            .toLowerCase()
            .includes(this.nameSearch.toLowerCase());
        });
      }

      this.customers = filteredCustomers;

      if (this.customers.length === 0) {
        // Si no se encuentran resultados, restaura la lista original
        this.customers = [...this.originalCustomers];
      }
    },
    toggleArrowIcon() {
      this.showTags = !this.showTags;
      this.isArrowUp = !this.isArrowUp;
    },
    async getCustomers() {
      const res = await this.axios.get(`${this.baseUrl}/customers`);
      this.customers = res.data;
      // Copia la lista original al cargar
      this.originalCustomers = [...this.customers];
      this.customers.sort((a, b) => b.name - a.name);
    },
    paginate(customersE) {
      let page = this.page;
      let perPage = this.perPage;
      let from = page * perPage - perPage;
      let to = page * perPage;
      return customersE.slice(from, to);
    },
    setCustomers() {
      let numberOfPages = Math.ceil(this.customers.length / this.perPage);
      for (let index = 1; index < +numberOfPages; index++) {
        this.pages.push(index);
      }
    },
    handleClickOutside(event) {
      // Verificar si el clic no ocurrió dentro de las etiquetas
      const tagsContainer = this.$refs.tagsContainer; // Añade una referencia a las etiquetas en tu plantilla
      if (tagsContainer && !tagsContainer.contains(event.target)) {
        // Cerrar las etiquetas
        this.showTags = false;
        this.isArrowUp = false;
      }
    },
    async addClient(customer){
      
      let order = (await this.axios.get(`${this.baseUrl}/order/${this.numOrder}`)).data

      await this.axios.put(`${this.baseUrl}/orderUpdate/${this.numOrder}`,{
        orderID: order.orderID,
        customerID: customer._id,
        cerrada: false
      })

      this.close()
    }
  },
  computed: {
    displayCustomers() {
      return this.paginate(this.customers);
    },
  },
  watch: {
    customers: "setCustomers",
  },
};
</script>

<style lang="scss">
.tags-container {
  border: 1px solid #ccc;
  background-color: white;
  padding: 10px;
  border-radius: 4px;
  position: absolute;
}

.rounded-corner {
  border-radius: 15px; /* Ajusta el valor según tus preferencias */
}

.black-border {
  border: 2px solid black; /* Cambia el color del borde según tus preferencias */
}

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
</style>
