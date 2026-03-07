<template>
  <section class="invoice-builder">
    <header class="panel">
      <h1>Nueva factura</h1>
      <p>Selecciona cliente y productos para emitir la factura.</p>
    </header>

    <section class="panel controls">
      <div class="field">
        <label for="customer">Cliente</label>
        <select id="customer" v-model.number="selectedCustomerId">
          <option :value="0">Selecciona un cliente</option>
          <option v-for="customer in customers" :key="customer.id" :value="customer.id">
            {{ customerDisplayName(customer) }} - {{ customer.identification }}
          </option>
        </select>
      </div>

      <div class="field">
        <label for="product-search">Buscar producto</label>
        <input
          id="product-search"
          v-model="productSearch"
          type="search"
          placeholder="Nombre o SKU"
        />
      </div>
    </section>

    <section class="panel">
      <h2>Productos</h2>
      <div class="products-grid">
        <article v-for="product in filteredProducts" :key="product.id" class="product-card">
          <div>
            <strong>{{ product.name }}</strong>
            <p>SKU: {{ product.sku }}</p>
            <p>Precio: {{ formatMoney(product.price) }}</p>
            <p>Stock: {{ product.stock }}</p>
          </div>
          <button :disabled="product.stock <= 0 || !product.isActive" @click="addProduct(product)">
            Agregar
          </button>
        </article>
      </div>
    </section>

    <section class="panel">
      <h2>Detalle</h2>
      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio</th>
            <th>Total</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in cart" :key="item.productId">
            <td>{{ item.name }}</td>
            <td>
              <input
                :value="item.quantity"
                type="number"
                min="1"
                :max="item.maxStock"
                @input="updateQuantity(item.productId, $event)"
              />
            </td>
            <td>{{ formatMoney(item.unitPrice) }}</td>
            <td>{{ formatMoney(item.unitPrice * item.quantity) }}</td>
            <td>
              <button class="ghost" @click="removeItem(item.productId)">Quitar</button>
            </td>
          </tr>
          <tr v-if="cart.length === 0">
            <td colspan="5" class="empty">No hay productos agregados</td>
          </tr>
        </tbody>
      </table>

      <div class="summary">
        <strong>Total estimado: {{ formatMoney(totalAmount) }}</strong>
        <button :disabled="!canCreateInvoice" @click="createInvoice">
          {{ creating ? "Emitiendo..." : "Emitir factura" }}
        </button>
      </div>

      <p v-if="successMessage" class="ok">{{ successMessage }}</p>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { isAxiosError } from "axios";
import { httpClient } from "@/shared/http/client";

type Product = {
  id: number;
  sku: string;
  name: string;
  price: number | string;
  stock: number;
  isActive: boolean;
};

type Customer = {
  id: number;
  fullName: string | null;
  businessName: string | null;
  identification: string;
};

type CartItem = {
  productId: number;
  name: string;
  unitPrice: number;
  quantity: number;
  maxStock: number;
};

type CreatedInvoice = {
  invoiceNumber: string;
};

const products = ref<Product[]>([]);
const customers = ref<Customer[]>([]);
const cart = ref<CartItem[]>([]);
const selectedCustomerId = ref(0);
const productSearch = ref("");
const creating = ref(false);
const successMessage = ref("");
const errorMessage = ref("");

const filteredProducts = computed(() => {
  const term = productSearch.value.trim().toLowerCase();
  if (!term) return products.value;

  return products.value.filter(
    (product) =>
      product.name.toLowerCase().includes(term) || product.sku.toLowerCase().includes(term)
  );
});

const totalAmount = computed(() =>
  cart.value.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0)
);

const canCreateInvoice = computed(
  () => selectedCustomerId.value > 0 && cart.value.length > 0 && !creating.value
);

const customerDisplayName = (customer: Customer) =>
  customer.fullName || customer.businessName || "Sin nombre";

const parsePrice = (value: number | string) => Number(value);

const formatMoney = (value: number | string) =>
  new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(value));

const fetchBaseData = async () => {
  const [productsResponse, customersResponse] = await Promise.all([
    httpClient.get<Product[]>("/products"),
    httpClient.get<Customer[]>("/customers"),
  ]);

  products.value = productsResponse.data;
  customers.value = customersResponse.data;
};

const addProduct = (product: Product) => {
  const existing = cart.value.find((item) => item.productId === product.id);
  if (existing) {
    if (existing.quantity < existing.maxStock) {
      existing.quantity += 1;
    }
    return;
  }

  cart.value.push({
    productId: product.id,
    name: product.name,
    unitPrice: parsePrice(product.price),
    quantity: 1,
    maxStock: product.stock,
  });
};

const updateQuantity = (productId: number, event: Event) => {
  const target = event.target as HTMLInputElement;
  const item = cart.value.find((entry) => entry.productId === productId);
  if (!item) return;

  const requested = Number(target.value);
  if (!Number.isFinite(requested) || requested < 1) {
    item.quantity = 1;
    return;
  }

  item.quantity = Math.min(requested, item.maxStock);
};

const removeItem = (productId: number) => {
  cart.value = cart.value.filter((item) => item.productId !== productId);
};

const createInvoice = async () => {
  if (!canCreateInvoice.value) return;

  creating.value = true;
  successMessage.value = "";
  errorMessage.value = "";

  try {
    const payload = {
      customerId: selectedCustomerId.value,
      items: cart.value.map((item) => ({ productId: item.productId, quantity: item.quantity })),
    };

    const { data } = await httpClient.post<CreatedInvoice>("/invoices", payload);
    successMessage.value = `Factura ${data.invoiceNumber} creada correctamente.`;
    selectedCustomerId.value = 0;
    cart.value = [];
    await fetchBaseData();
  } catch (error) {
    if (isAxiosError(error)) {
      errorMessage.value =
        (error.response?.data as { message?: string } | undefined)?.message ||
        "No se pudo crear la factura.";
    } else {
      errorMessage.value = "No se pudo crear la factura.";
    }
  } finally {
    creating.value = false;
  }
};

onMounted(async () => {
  try {
    await fetchBaseData();
  } catch {
    errorMessage.value = "No se pudo cargar clientes y productos.";
  }
});
</script>

<style scoped>
.invoice-builder {
  display: grid;
  gap: 16px;
}

.panel {
  border: 1px solid #dbe2ea;
  border-radius: 12px;
  background: #fff;
  padding: 14px;
  text-align: left;
}

.panel h1,
.panel h2,
.panel p {
  margin: 0;
}

.controls {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.field {
  display: grid;
  gap: 6px;
}

select,
input,
button {
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 8px;
}

.products-grid {
  margin-top: 10px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px;
}

.product-card {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px;
  display: grid;
  gap: 8px;
}

.product-card p {
  margin: 4px 0 0;
  color: #475569;
  font-size: 0.9rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

th,
td {
  border-bottom: 1px solid #e2e8f0;
  padding: 8px;
}

.empty {
  color: #64748b;
  text-align: center;
}

.summary {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.ghost {
  background: transparent;
}

.ok {
  margin: 10px 0 0;
  color: #166534;
}

.error {
  margin: 10px 0 0;
  color: #b91c1c;
}

@media (max-width: 920px) {
  .controls {
    grid-template-columns: 1fr;
  }

  .summary {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
