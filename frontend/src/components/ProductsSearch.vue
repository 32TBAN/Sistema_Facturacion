<template>
  <div class="bg-transparent">
    <h4 class="pb-1">Busqueda de productos</h4>

    <div class="container d-flex flex-column align-items-center">
      <form class="d-flex me-2 mb-3">
        <input
          class="form-control"
          type="search"
          placeholder="Ingrese el producto"
          aria-label="Search"
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

        <div v-if="showTags" class="tags-container" >
          <!-- Contenido de etiquetas -->
          <div v-for="tag in allTags" :key="tag">
            <input
              type="checkbox"
              :id="tag"
              :value="tag"
              v-model="searchTags"
              @change="searchByTags"
            />
            <label class="p-2" :for="tag">{{ tag.name }}</label>
          </div>
        </div>
      </div>
    </div>
    <div class="container mt-5 bg-white p-3">
      <div class="row table-header pb-3">
        <div class="col-2">Nombre</div>
        <div class="col-2">Cantidad x Unidad</div>
        <div class="col-2">Precio</div>
        <div class="col-2">Stock</div>
        <div class="col-2">Agregar al carrito</div>
      </div>

      <div
        class="row m-2 pt-2 rounded-corner"
        v-for="product in displayProduts"
        :key="product._id"
        style="background-color: #d9d9d9"
      >
        <div class="col-2">{{ product.name }}</div>
        <div class="col-2">{{ product.quantityPerUnit }}</div>
        <div class="col-2">{{ product.unitPrice }}</div>
        <div class="col-2">{{ product.unitStock }}</div>
        <div class="col-2 mb-2">
          <form @submit="addToCart(product, quantityToAdd)">
            <div class="d-flex align-items-center">
              <input
                class="mb-2 form-control"
                v-model="quantityToAdd"
                type="number"
                placeholder="cantidad"
                min="0"
                step="1"
                required
              />
            </div>
            <button type="submit" class="btn btn-outline-success me-2">
              Agregar
            </button>
          </form>
        </div>
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
          v-for="pageNumber in pages.slice(page - 1, page + 5)"
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
      products: [],
      allTags: [],
      isArrowUp: false,
      showTags: false,
      baseUrl: "http://localhost:3000",
      page: 1,
      perPage: 10,
      pages: [],
      quantityBuy: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    };
  },
  created() {
    this.getProducts();
    this.getCategories();
    window.addEventListener('click', this.handleClickOutside);
  },
  methods: {
    searchByTags() {
      this.searchResults = this.products.filter((product) => {
        return this.searchTags.every((tag) => product.tags.includes(tag));
      });
    },
    toggleArrowIcon() {
      this.showTags = !this.showTags;
      this.isArrowUp = !this.isArrowUp;
    },
    async getProducts() {
      const res = await this.axios.get(`${this.baseUrl}/product`);
      this.products = res.data;
    },
    async getCategories() {
      const res = await this.axios.get(`${this.baseUrl}/categories`);
      this.allTags = res.data;
      this.allTags.unshift({ name: "all" });
    },
    paginate(productE) {
      let page = this.page;
      let perPage = this.perPage;
      let from = page * perPage - perPage;
      let to = page * perPage;
      return productE.slice(from, to);
    },
    setProducts() {
      let numberOfPages = Math.ceil(this.products.length / this.perPage);
      for (let index = 1; index < +numberOfPages; index++) {
        this.pages.push(index);
      }
    },handleClickOutside(event) {
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
    displayProduts() {
      return this.paginate(this.products);
    },
  },
  watch: {
    products() {
      this.setProducts();
    },
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
