<template>
  <div class="bg-transparent">
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
        style="background-color: #d9d9d9"
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
      perPage: 10,
      pages: [],
      nameSearch: "",
      searchTags: [],
      originalCustomers: [],
    };
  },
  created() {
    this.getCustomers();
    window.addEventListener("click", this.handleClickOutside);
  },
  methods: {
    searchByTags() {
      // Filtra productos por etiquetas seleccionadas
      let filteredByTags = this.originalProducts.filter((product) => {
        return this.searchTags.some((tagID) => product.categoryID === tagID);
      });

      if (this.nameSearch) {
        if (filteredByTags.length == 0) {
          this.products = this.products.filter((product) => {
            // Comprueba si el nombre del producto incluye el nombre de búsqueda
            const nameMatches = product.name
              .toLowerCase()
              .includes(this.nameSearch.toLowerCase());
            // Comprueba si el nombre del producto comienza con la letra de búsqueda
            const startsWithLetter = product.name
              .toLowerCase()
              .startsWith(this.nameSearch.toLowerCase());

            return nameMatches || startsWithLetter;
          });
        } else {
          this.products = filteredByTags.filter((product) => {
            // Comprueba si el nombre del producto incluye el nombre de búsqueda
            const nameMatches = product.name
              .toLowerCase()
              .includes(this.nameSearch.toLowerCase());
            // Comprueba si el nombre del producto comienza con la letra de búsqueda
            const startsWithLetter = product.name
              .toLowerCase()
              .startsWith(this.nameSearch.toLowerCase());

            return nameMatches || startsWithLetter;
          });
        }
      } else {
        this.products = [...filteredByTags];
      }

      if (this.products.length == 0) {
        this.products = [...this.originalProducts];
      }

      this.products.sort((a, b) => b.unitStock - a.unitStock);
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

<style>
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
</style>
