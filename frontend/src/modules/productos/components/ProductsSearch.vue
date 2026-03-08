<template>
  <section class="products-page">
    <header class="panel header-panel">
      <div>
        <h2>
          <font-awesome-icon :icon="['fas', 'boxes-stacked']" />
          Catalogo de productos
        </h2>
        <p>
          <font-awesome-icon :icon="['fas', 'circle-info']" />
          Consulta y gestion de inventario por SKU, nombre y categoria.
        </p>
      </div>
      <button v-if="isAdmin" class="primary" @click="openCreateModal">
        <font-awesome-icon :icon="['fas', 'plus']" />
        Nuevo producto
      </button>
    </header>

    <section class="panel">
      <div class="field">
        <label for="search">
          <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
          Buscar por nombre, SKU o categoria
        </label>
        <input id="search" v-model="search" type="search" placeholder="Ej: arroz, sku-001 o granos" />
      </div>
      <p class="meta">
        <font-awesome-icon :icon="['fas', 'database']" />
        {{ filteredProducts.length }} resultado(s)
      </p>
    </section>

    <section class="panel">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th><span class="th-content"><font-awesome-icon :icon="['fas', 'barcode']" /> SKU</span></th>
              <th><span class="th-content"><font-awesome-icon :icon="['fas', 'box']" /> Nombre</span></th>
              <th><span class="th-content"><font-awesome-icon :icon="['fas', 'tags']" /> Categoria</span></th>
              <th><span class="th-content"><font-awesome-icon :icon="['fas', 'dollar-sign']" /> Precio</span></th>
              <th><span class="th-content"><font-awesome-icon :icon="['fas', 'hashtag']" /> Stock</span></th>
              <th><span class="th-content"><font-awesome-icon :icon="['fas', 'toggle-on']" /> Estado</span></th>
              <th v-if="canEditProduct">
                <span class="th-content"><font-awesome-icon :icon="['fas', 'wrench']" /> Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in filteredProducts" :key="product.id">
              <td>
                <span class="sku-cell" :title="product.sku">{{ product.sku }}</span>
              </td>
              <td>{{ product.name }}</td>
              <td>{{ product.category?.name ?? "-" }}</td>
              <td>{{ money(product.price) }}</td>
              <td>{{ product.stock }}</td>
              <td>
                <span :class="['badge', product.isActive ? 'ok' : 'warn']">
                  <font-awesome-icon :icon="['fas', product.isActive ? 'circle-check' : 'triangle-exclamation']" />
                  {{ product.isActive ? "Activo" : "Inactivo" }}
                </span>
              </td>
              <td v-if="canEditProduct">
                <button class="ghost" @click="openEditModal(product)">
                  <font-awesome-icon :icon="['fas', 'pen']" />
                  Editar
                </button>
              </td>
            </tr>
            <tr v-if="filteredProducts.length === 0">
              <td :colspan="canEditProduct ? 7 : 6" class="empty">No hay productos para mostrar</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <p v-if="errorMessage" class="error">
      <font-awesome-icon :icon="['fas', 'triangle-exclamation']" />
      {{ errorMessage }}
    </p>
    <p v-if="successMessage" class="ok">
      <font-awesome-icon :icon="['fas', 'circle-check']" />
      {{ successMessage }}
    </p>

    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <section class="modal-card">
        <header>
          <h3>
            <font-awesome-icon :icon="['fas', editMode ? 'pen' : 'square-plus']" />
            {{ editMode ? "Editar producto" : "Crear producto" }}
          </h3>
          <button class="ghost icon-only" @click="closeModal" aria-label="Cerrar">
            <font-awesome-icon :icon="['fas', 'xmark']" />
          </button>
        </header>

        <div class="modal-grid">
          <div class="field">
            <label for="name">
              <font-awesome-icon :icon="['fas', 'box']" />
              Nombre
            </label>
            <input id="name" v-model="form.name" type="text" />
            <small :class="['validation', nameStatus]">
              <font-awesome-icon :icon="['fas', statusIcon(nameStatus)]" />
              {{ nameMessage }}
            </small>
          </div>

          <div class="field">
            <label for="sku">
              <font-awesome-icon :icon="['fas', 'barcode']" />
              SKU
            </label>
            <input id="sku" v-model="form.sku" type="text" />
            <small :class="['validation', skuStatus]">
              <font-awesome-icon :icon="['fas', statusIcon(skuStatus)]" />
              {{ skuMessage }}
            </small>
          </div>

          <div class="field category-field">
            <label for="category">
              <font-awesome-icon :icon="['fas', 'tags']" />
              Categoria
            </label>
            <p class="category-help">Selecciona una categoria existente o escribe una nueva.</p>
            <div class="combo-wrap" ref="comboRef">
              <input
                id="category"
                v-model="form.categoryInput"
                type="text"
                autocomplete="off"
                @focus="showCategoryDropdown = true"
                @input="showCategoryDropdown = true"
              />
              <button
                type="button"
                class="combo-toggle"
                aria-label="Mostrar categorias"
                @click="toggleCategoryDropdown"
              >
                <font-awesome-icon :icon="['fas', showCategoryDropdown ? 'chevron-up' : 'chevron-down']" />
              </button>
              <div v-if="showCategoryDropdown" class="combo-dropdown">
                <button
                  v-for="category in filteredCategoryOptions"
                  :key="category.id"
                  type="button"
                  class="combo-option"
                  @mousedown.prevent="selectCategoryOption(category.name)"
                >
                  {{ category.name }}
                </button>
                <p v-if="filteredCategoryOptions.length === 0" class="combo-empty">
                  No hay coincidencias. Se creara al guardar.
                </p>
              </div>
            </div>
            <small :class="['validation', categoryStatus]">
              <font-awesome-icon :icon="['fas', statusIcon(categoryStatus)]" />
              {{ categoryMessage }}
            </small>
          </div>

          <div class="field">
            <label for="price">
              <font-awesome-icon :icon="['fas', 'dollar-sign']" />
              Precio
            </label>
            <input id="price" v-model="form.price" type="number" min="0.01" step="0.01" />
            <small :class="['validation', priceStatus]">
              <font-awesome-icon :icon="['fas', statusIcon(priceStatus)]" />
              {{ priceMessage }}
            </small>
          </div>

          <div class="field">
            <label for="stock">
              <font-awesome-icon :icon="['fas', 'hashtag']" />
              Stock
            </label>
            <input id="stock" v-model="form.stock" type="number" min="0" step="1" />
            <small :class="['validation', stockStatus]">
              <font-awesome-icon :icon="['fas', statusIcon(stockStatus)]" />
              {{ stockMessage }}
            </small>
          </div>

          <div class="field">
            <label for="is-active">
              <font-awesome-icon :icon="['fas', 'toggle-on']" />
              Estado
            </label>
            <select id="is-active" v-model="form.isActive">
              <option :value="true">Activo</option>
              <option :value="false">Inactivo</option>
            </select>
            <small class="validation pending">
              <font-awesome-icon :icon="['fas', 'circle-info']" />
              Define disponibilidad del producto.
            </small>
          </div>

          <div class="field field-full">
            <label for="description">
              <font-awesome-icon :icon="['fas', 'align-left']" />
              Descripcion (opcional)
            </label>
            <textarea id="description" v-model="form.description" rows="2" />
          </div>
        </div>

        <p v-if="modalErrorMessage" class="error">
          <font-awesome-icon :icon="['fas', 'triangle-exclamation']" />
          {{ modalErrorMessage }}
        </p>

        <footer>
          <button class="ghost" @click="closeModal">
            <font-awesome-icon :icon="['fas', 'xmark']" />
            Cancelar
          </button>
          <button class="primary" :disabled="saving || !isFormValid" @click="saveProduct">
            <font-awesome-icon :icon="['fas', 'floppy-disk']" />
            {{ saving ? "Guardando..." : editMode ? "Guardar cambios" : "Crear producto" }}
          </button>
        </footer>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from "vue";
import { isAxiosError } from "axios";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { httpClient } from "@/shared/http/client";

type Category = {
  id: number;
  name: string;
};

type Product = {
  id: number;
  sku: string;
  name: string;
  description?: string | null;
  price: number | string;
  stock: number;
  isActive: boolean;
  categoryId?: number;
  category?: Category;
};

type ValidationStatus = "pending" | "valid" | "invalid";

const authStore = useAuthStore();
const isAdmin = computed(() => authStore.roles.includes("admin"));
const canEditProduct = computed(
  () => authStore.roles.includes("admin") || authStore.roles.includes("empleado")
);

const products = ref<Product[]>([]);
const categories = ref<Category[]>([]);
const search = ref("");
const errorMessage = ref("");
const successMessage = ref("");

const showModal = ref(false);
const editMode = ref(false);
const editingProductId = ref<number | null>(null);
const modalErrorMessage = ref("");
const saving = ref(false);

const showCategoryDropdown = ref(false);
const comboRef = ref<HTMLElement | null>(null);

const form = reactive({
  name: "",
  sku: "",
  categoryInput: "",
  description: "",
  price: "",
  stock: "",
  isActive: true,
});

const normalizeText = (value: string) => value.trim().replace(/\s+/g, " ");

const filteredProducts = computed(() => {
  const term = search.value.trim().toLowerCase();
  if (!term) return products.value;
  return products.value.filter((product) => {
    const category = product.category?.name?.toLowerCase() ?? "";
    return (
      product.name.toLowerCase().includes(term) ||
      product.sku.toLowerCase().includes(term) ||
      category.includes(term)
    );
  });
});

const filteredCategoryOptions = computed(() => {
  const term = form.categoryInput.trim().toLowerCase();
  if (!term) return categories.value;
  return categories.value.filter((category) => category.name.toLowerCase().includes(term));
});

const money = (value: number | string) =>
  new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" }).format(Number(value));

const nameStatus = computed<ValidationStatus>(() => {
  if (!form.name.trim()) return "pending";
  return form.name.trim().length >= 2 ? "valid" : "invalid";
});
const skuStatus = computed<ValidationStatus>(() => {
  if (!form.sku.trim()) return "pending";
  return form.sku.trim().length >= 2 ? "valid" : "invalid";
});
const categoryStatus = computed<ValidationStatus>(() => {
  if (!form.categoryInput.trim()) return "pending";
  return normalizeText(form.categoryInput).length >= 2 ? "valid" : "invalid";
});
const priceStatus = computed<ValidationStatus>(() => {
  if (!form.price.toString().trim()) return "pending";
  const value = Number(form.price);
  return Number.isFinite(value) && value > 0 ? "valid" : "invalid";
});
const stockStatus = computed<ValidationStatus>(() => {
  if (!form.stock.toString().trim()) return "pending";
  const value = Number(form.stock);
  return Number.isInteger(value) && value >= 0 ? "valid" : "invalid";
});

const nameMessage = computed(() =>
  nameStatus.value === "pending"
    ? "Nombre requerido."
    : nameStatus.value === "valid"
    ? "Nombre valido."
    : "El nombre debe tener al menos 2 caracteres."
);
const skuMessage = computed(() =>
  skuStatus.value === "pending"
    ? "SKU requerido."
    : skuStatus.value === "valid"
    ? "SKU valido."
    : "El SKU debe tener al menos 2 caracteres."
);
const categoryMessage = computed(() =>
  categoryStatus.value === "pending"
    ? "Selecciona o escribe una categoria."
    : categoryStatus.value === "valid"
    ? "Categoria valida."
    : "La categoria debe tener al menos 2 caracteres."
);
const priceMessage = computed(() =>
  priceStatus.value === "pending"
    ? "Ingresa precio mayor a 0."
    : priceStatus.value === "valid"
    ? "Precio valido."
    : "Precio invalido."
);
const stockMessage = computed(() =>
  stockStatus.value === "pending"
    ? "Ingresa stock entero >= 0."
    : stockStatus.value === "valid"
    ? "Stock valido."
    : "Stock invalido."
);

const isFormValid = computed(
  () =>
    nameStatus.value === "valid" &&
    skuStatus.value === "valid" &&
    categoryStatus.value === "valid" &&
    priceStatus.value === "valid" &&
    stockStatus.value === "valid"
);

const statusIcon = (status: ValidationStatus) => {
  if (status === "valid") return "circle-check";
  if (status === "invalid") return "circle-xmark";
  return "clock";
};

const resetForm = () => {
  form.name = "";
  form.sku = "";
  form.categoryInput = "";
  form.description = "";
  form.price = "";
  form.stock = "";
  form.isActive = true;
  modalErrorMessage.value = "";
  showCategoryDropdown.value = false;
};

const fetchBaseData = async () => {
  const [productsRes, categoriesRes] = await Promise.all([
    httpClient.get<Product[]>("/products"),
    httpClient.get<Category[]>("/categories"),
  ]);
  products.value = productsRes.data;
  categories.value = categoriesRes.data;
};

const openCreateModal = () => {
  if (!isAdmin.value) return;
  editMode.value = false;
  editingProductId.value = null;
  resetForm();
  showModal.value = true;
};

const openEditModal = (product: Product) => {
  if (!canEditProduct.value) return;
  editMode.value = true;
  editingProductId.value = product.id;
  form.name = product.name;
  form.sku = product.sku;
  form.categoryInput = product.category?.name ?? "";
  form.description = product.description ?? "";
  form.price = String(product.price);
  form.stock = String(product.stock);
  form.isActive = product.isActive;
  modalErrorMessage.value = "";
  showCategoryDropdown.value = false;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  resetForm();
};

const selectCategoryOption = (name: string) => {
  form.categoryInput = name;
  showCategoryDropdown.value = false;
};

const toggleCategoryDropdown = () => {
  showCategoryDropdown.value = !showCategoryDropdown.value;
};

const onDocumentClick = (event: MouseEvent) => {
  const target = event.target as Node;
  if (!comboRef.value?.contains(target)) {
    showCategoryDropdown.value = false;
  }
};

const resolveCategoryId = async (rawName: string) => {
  const normalized = normalizeText(rawName);
  const existing = categories.value.find((category) => category.name.toLowerCase() === normalized.toLowerCase());
  if (existing) return existing.id;

  try {
    const { data } = await httpClient.post<Category>("/categories", { name: normalized });
    categories.value = [...categories.value, data];
    return data.id;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 409) {
      const { data } = await httpClient.get<Category[]>("/categories");
      categories.value = data;
      const conflict = categories.value.find((category) => category.name.toLowerCase() === normalized.toLowerCase());
      if (conflict) return conflict.id;
    }
    throw error;
  }
};

const saveProduct = async () => {
  if (!isAdmin.value || !isFormValid.value) return;

  saving.value = true;
  modalErrorMessage.value = "";
  successMessage.value = "";
  errorMessage.value = "";

  try {
    const categoryId = await resolveCategoryId(form.categoryInput);
    const payload = {
      categoryId,
      sku: normalizeText(form.sku),
      name: normalizeText(form.name),
      description: form.description.trim() || undefined,
      price: Number(form.price),
      stock: Number(form.stock),
      isActive: Boolean(form.isActive),
    };

    if (editMode.value && editingProductId.value) {
      await httpClient.put(`/products/${editingProductId.value}`, payload);
      successMessage.value = "Producto actualizado correctamente.";
    } else {
      await httpClient.post("/products", payload);
      successMessage.value = "Producto creado correctamente.";
    }

    await fetchBaseData();
    closeModal();
  } catch (error) {
    if (isAxiosError(error)) {
      modalErrorMessage.value =
        (error.response?.data as { message?: string } | undefined)?.message || "No se pudo guardar el producto.";
    } else {
      modalErrorMessage.value = "No se pudo guardar el producto.";
    }
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
  document.addEventListener("click", onDocumentClick);
  try {
    await fetchBaseData();
  } catch {
    errorMessage.value = "No se pudo cargar el catalogo de productos.";
  }
});

onUnmounted(() => {
  document.removeEventListener("click", onDocumentClick);
});
</script>

<style scoped>
.products-page {
  display: grid;
  gap: 12px;
  text-align: left;
}

.panel {
  border: 1px solid #dbe2ea;
  border-radius: 12px;
  background: #fff;
  padding: 14px;
}

.header-panel {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 10px;
  flex-wrap: wrap;
}

h2,
h3,
p,
label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

h2,
p {
  margin: 0;
}

.field {
  display: grid;
  gap: 6px;
}

input,
button,
select,
textarea {
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 8px;
}

button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.primary {
  background: #1e3a5f;
  color: #fff;
  border-color: #1e3a5f;
}

.ghost {
  background: transparent;
}

.meta {
  margin: 8px 0 0;
  color: #475569;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 900px;
  border-collapse: collapse;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

th,
td {
  padding: 10px;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}

th {
  background: #f8fafc;
}

.th-content {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.sku-cell {
  display: inline-block;
  max-width: 170px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
}

.badge {
  font-size: 0.82rem;
  border-radius: 999px;
  padding: 4px 10px;
  border: 1px solid;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.badge.ok {
  color: #166534;
  border-color: #86efac;
  background: #dcfce7;
}

.badge.warn {
  color: #92400e;
  border-color: #fcd34d;
  background: #fef3c7;
}

.empty {
  text-align: center;
  color: #64748b;
}

.ok,
.error {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.ok {
  color: #166534;
}

.error {
  color: #b91c1c;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 30;
  background: rgba(15, 23, 42, 0.45);
  display: grid;
  place-items: center;
  padding: 16px;
}

.modal-card {
  width: min(760px, 100%);
  background: white;
  border-radius: 12px;
  padding: 14px;
  display: grid;
  gap: 12px;
}

.modal-card header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.icon-only {
  padding: 8px 10px;
}

.modal-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.field-full {
  grid-column: 1 / -1;
}

.category-field {
  position: relative;
}

.category-help {
  margin: 0;
  color: #64748b;
  font-size: 0.85rem;
}

.combo-wrap {
  position: relative;
}

.combo-wrap input {
  width: 100%;
  padding-right: 34px;
}

.combo-toggle {
  position: absolute;
  top: 50%;
  right: 6px;
  transform: translateY(-50%);
  padding: 4px 6px;
  border: none;
  background: transparent;
}

.combo-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: 180px;
  overflow-y: auto;
  border: 1px solid #dbe2ea;
  border-radius: 8px;
  background: #fff;
  z-index: 10;
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.08);
}

.combo-option {
  width: 100%;
  justify-content: flex-start;
  border: none;
  border-radius: 0;
  background: #fff;
  padding: 8px 10px;
}

.combo-option:hover {
  background: #f1f5f9;
}

.combo-empty {
  margin: 0;
  padding: 8px 10px;
  color: #64748b;
  font-size: 0.85rem;
}

.validation {
  font-size: 0.8rem;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.validation.pending {
  color: #64748b;
}

.validation.valid {
  color: #166534;
}

.validation.invalid {
  color: #b91c1c;
}

footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

@media (max-width: 920px) {
  .modal-grid {
    grid-template-columns: 1fr;
  }
}
</style>
