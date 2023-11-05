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
          <div v-for="tag in allTags" :key="tag.productID">
            <input
              type="checkbox"
              :id="tag.productID"
              :value="tag.productID"
              v-model="searchTags"
              @change="searchByTags"
            />
            <label class="p-2" :for="tag.productID">{{ tag.name }}</label>
          </div>
        </div>
      </div>
    </div>
    <div class="container mt-1 bg-white p-3">
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
          <form>
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
            <button
              type="button"
              class="btn btn-outline-success me-2"
              @click="addToCart(product, quantityToAdd)"
            >
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
      products: [],
      allTags: [],
      isArrowUp: false,
      showTags: false,
      baseUrl: "http://localhost:3000",
      page: 1,
      perPage: 10,
      pages: [],
      quantityBuy: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      nameSearch: "",
      searchTags: [],
      originalProducts: [],
    };
  },
  created() {
    this.getProducts();
    this.getCategories();
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
    },
    toggleArrowIcon() {
      this.showTags = !this.showTags;
      this.isArrowUp = !this.isArrowUp;
    },
    async getProducts() {
      const res = await this.axios.get(`${this.baseUrl}/product`);
      this.products = res.data;
      // Copia la lista original al cargar
      this.originalProducts = [...this.products];
    },
    async getCategories() {
      const res = await this.axios.get(`${this.baseUrl}/categories`);
      this.allTags = res.data;
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
    async addToCart(product, quantityToAdd) {
      try {
        // Verifica que la cantidad a agregar sea un número válido
        const quantity = parseInt(quantityToAdd);

        if (isNaN(quantity) || quantity <= 0) {
          alert("Ingresa una cantidad válida para agregar al carrito.");
          return;
        }

        product.unitStock -= quantity;
        // Realiza una solicitud PUT al servidor para actualizar el producto
        const response = await this.axios.put(
          `${this.baseUrl}/productUpdate/${product.productID}`,
          product
        );

        if (response.status === 200) {
          console.log("Producto actualizado con éxito");
        } else {
          console.error("Error al actualizar el producto");
        }
        alert(`Producto a agregar al carrito: ${product.name}`);
        alert(`Cantidad a agregar: ${quantity}`);
      } catch (error) {
        console.error("Error al agregar al carrito:", error);
      }
    },
  },
  computed: {
    displayProduts() {
      return this.paginate(this.products);
    },
  },
  watch: {
    products: "setProducts",
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
