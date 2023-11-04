<template>
  <div class="bg-transparent">
    <h4 class="pb-1">Busqueda de clientes</h4>

    <div class="container d-flex flex-column align-items-center">
      <form class="d-flex me-2 mb-3">
        <input
          class="form-control"
          type="search"
          placeholder="Ingrese el id"
          aria-label="Search"
        />
      </form>

      <div class="d-flex flex-column align-items-center">
        <p class="bg-body-tertiary rounded-corner black-border p-1">
          Selecciona etiquetas
          <font-awesome-icon
            :icon="isArrowUp ? 'chevron-up' : 'chevron-down'"
            @click="toggleArrowIcon"
          />
        </p>
        <div v-if="showTags" class="tags-container">
          <div v-for="tag in allTags" :key="tag">
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
  </div>
</template>

<script>
export default {
  data() {
    return {
      items: [
        { id: 1, name: "Producto 1", tags: ["etiqueta1", "etiqueta2"] },
        { id: 2, name: "Producto 2", tags: ["etiqueta2", "etiqueta3"] },
      ],
      allTags: ["all", "etiqueta1", "etiqueta2", "etiqueta3"],
      searchTags: [],
      searchResults: [],
      isArrowUp: false,
      showTags: false,
    };
  },
  methods: {
    searchByTags() {
      this.searchResults = this.items.filter((item) => {
        return this.searchTags.every((tag) => item.tags.includes(tag));
      });
    },
    toggleArrowIcon() {
      this.showTags = !this.showTags;
      this.isArrowUp = !this.isArrowUp;
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

/* Define las clases CSS para el campo de búsqueda */
.rounded-corner {
  border-radius: 15px; /* Ajusta el valor según tus preferencias */
}

.black-border {
  border: 2px solid black; /* Cambia el color del borde según tus preferencias */
}
</style>
