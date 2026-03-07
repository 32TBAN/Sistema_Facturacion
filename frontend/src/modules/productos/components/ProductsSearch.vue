<template>
  <section class="products-page">
    <header>
      <h2>Catalogo de productos</h2>
      <p>Consulta de inventario disponible en tiempo real.</p>
    </header>

    <div class="toolbar">
      <input v-model="search" type="search" placeholder="Buscar por nombre o SKU" />
    </div>

    <table>
      <thead>
        <tr>
          <th>SKU</th>
          <th>Nombre</th>
          <th>Categoria</th>
          <th>Precio</th>
          <th>Stock</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in filteredProducts" :key="product.id">
          <td>{{ product.sku }}</td>
          <td>{{ product.name }}</td>
          <td>{{ product.category?.name ?? "-" }}</td>
          <td>{{ money(product.price) }}</td>
          <td>{{ product.stock }}</td>
          <td>{{ product.isActive ? "Activo" : "Inactivo" }}</td>
        </tr>
        <tr v-if="filteredProducts.length === 0">
          <td colspan="6" class="empty">No hay productos para mostrar</td>
        </tr>
      </tbody>
    </table>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { httpClient } from "@/shared/http/client";

type Product = {
  id: number;
  sku: string;
  name: string;
  price: number | string;
  stock: number;
  isActive: boolean;
  category?: {
    id: number;
    name: string;
  };
};

const products = ref<Product[]>([]);
const search = ref("");
const errorMessage = ref("");

const filteredProducts = computed(() => {
  const term = search.value.trim().toLowerCase();
  if (!term) return products.value;

  return products.value.filter(
    (product) =>
      product.name.toLowerCase().includes(term) || product.sku.toLowerCase().includes(term)
  );
});

const money = (value: number | string) =>
  new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
  }).format(Number(value));

onMounted(async () => {
  try {
    const { data } = await httpClient.get<Product[]>("/products");
    products.value = data;
  } catch {
    errorMessage.value = "No se pudo cargar el catalogo de productos.";
  }
});
</script>

<style scoped>
.products-page {
  display: grid;
  gap: 12px;
  text-align: left;
}

header h2,
header p {
  margin: 0;
}

.toolbar input {
  width: 100%;
  max-width: 340px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 8px 10px;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

th,
td {
  padding: 10px;
  border-bottom: 1px solid #e2e8f0;
}

th {
  background: #f8fafc;
}

.empty {
  text-align: center;
  color: #64748b;
}

.error {
  margin: 0;
  color: #b91c1c;
}
</style>
